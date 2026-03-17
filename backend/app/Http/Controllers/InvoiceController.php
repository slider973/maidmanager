<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\InvoiceLine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Invoice::where('user_id', $request->user()->id)
            ->with(['client', 'invoiceLines']);

        if ($request->has('client_id')) {
            $query->where('client_id', $request->input('client_id'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'client_id' => ['required', 'exists:clients,id'],
            'invoice_date' => ['required', 'date'],
            'due_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'lines' => ['nullable', 'array'],
            'lines.*.description' => ['required', 'string'],
            'lines.*.quantity' => ['nullable', 'numeric', 'min:0'],
            'lines.*.unit_price_cents' => ['nullable', 'integer', 'min:0'],
            'lines.*.amount' => ['nullable', 'numeric', 'min:0'],
            'lines.*.schedule_entry_id' => ['nullable', 'exists:schedule_entries,id'],
            'lines.*.sort_order' => ['nullable', 'integer'],
        ]);

        return DB::transaction(function () use ($validated, $request) {
            // Generate invoice number: FACT-YYYY-XXXX
            $year = date('Y');
            $lastInvoice = Invoice::where('user_id', $request->user()->id)
                ->where('invoice_number', 'like', "FACT-{$year}-%")
                ->orderByDesc('invoice_number')
                ->first();

            $sequence = 1;
            if ($lastInvoice) {
                $parts = explode('-', $lastInvoice->invoice_number);
                $sequence = (int) end($parts) + 1;
            }

            $invoiceNumber = sprintf('FACT-%s-%04d', $year, $sequence);

            $invoice = Invoice::create([
                'user_id' => $request->user()->id,
                'client_id' => $validated['client_id'],
                'invoice_number' => $invoiceNumber,
                'invoice_date' => $validated['invoice_date'],
                'due_date' => $validated['due_date'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'status' => 'draft',
                'total_cents' => 0,
            ]);

            $totalCents = 0;

            if (!empty($validated['lines'])) {
                foreach ($validated['lines'] as $index => $lineData) {
                    // Support both formats: quantity+unit_price_cents OR amount (in CHF)
                    $quantity = $lineData['quantity'] ?? 1;
                    $unitPriceCents = $lineData['unit_price_cents'] ?? (int) round(($lineData['amount'] ?? 0) * 100);
                    $lineTotalCents = (int) round($quantity * $unitPriceCents);
                    $invoice->invoiceLines()->create([
                        'description' => $lineData['description'],
                        'quantity' => $quantity,
                        'unit_price_cents' => $unitPriceCents,
                        'total_cents' => $lineTotalCents,
                        'schedule_entry_id' => $lineData['schedule_entry_id'] ?? null,
                        'sort_order' => $lineData['sort_order'] ?? $index,
                    ]);
                    $totalCents += $lineTotalCents;
                }
            }

            $invoice->update(['total_cents' => $totalCents]);

            return response()->json($invoice->load(['client', 'invoiceLines']), 201);
        });
    }

    public function show(Request $request, Invoice $invoice): JsonResponse
    {
        if ($invoice->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($invoice->load(['client', 'invoiceLines']));
    }

    public function update(Request $request, Invoice $invoice): JsonResponse
    {
        if ($invoice->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($invoice->status !== 'draft') {
            return response()->json(['message' => 'Seules les factures brouillon peuvent être modifiées'], 422);
        }

        $validated = $request->validate([
            'client_id' => ['sometimes', 'required', 'exists:clients,id'],
            'invoice_date' => ['sometimes', 'required', 'date'],
            'due_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $invoice->update($validated);

        // Recalculate total from lines
        $totalCents = $invoice->invoiceLines()->sum('total_cents');
        $invoice->update(['total_cents' => (int) $totalCents]);

        return response()->json($invoice->load(['client', 'invoiceLines']));
    }

    public function destroy(Request $request, Invoice $invoice): JsonResponse
    {
        if ($invoice->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($invoice->status !== 'draft') {
            return response()->json(['message' => 'Seules les factures brouillon peuvent être supprimées'], 422);
        }

        $invoice->invoiceLines()->delete();
        $invoice->delete();

        return response()->json(['message' => 'Facture supprimée']);
    }

    public function updateStatus(Request $request, Invoice $invoice): JsonResponse
    {
        if ($invoice->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:sent,paid,cancelled'],
        ]);

        $newStatus = $validated['status'];
        $currentStatus = $invoice->status;

        // Validate status transitions
        $validTransitions = [
            'draft' => ['sent', 'cancelled'],
            'sent' => ['paid', 'cancelled'],
            'paid' => ['cancelled'],
            'cancelled' => [],
        ];

        if (!in_array($newStatus, $validTransitions[$currentStatus] ?? [])) {
            return response()->json([
                'message' => "Transition de statut invalide : {$currentStatus} vers {$newStatus}",
            ], 422);
        }

        $data = ['status' => $newStatus];

        match ($newStatus) {
            'sent' => $data['sent_at'] = now(),
            'paid' => $data['paid_at'] = now(),
            'cancelled' => $data['cancelled_at'] = now(),
            default => null,
        };

        $invoice->update($data);

        return response()->json($invoice);
    }

    public function addLine(Request $request, Invoice $invoice): JsonResponse
    {
        if ($invoice->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'description' => ['required', 'string'],
            'quantity' => ['required', 'numeric', 'min:0'],
            'unit_price_cents' => ['required', 'integer', 'min:0'],
            'schedule_entry_id' => ['nullable', 'exists:schedule_entries,id'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $lineTotalCents = (int) round($validated['quantity'] * $validated['unit_price_cents']);

        $line = $invoice->invoiceLines()->create([
            ...$validated,
            'total_cents' => $lineTotalCents,
        ]);

        // Recalculate total
        $totalCents = $invoice->invoiceLines()->sum('total_cents');
        $invoice->update(['total_cents' => (int) $totalCents]);

        return response()->json($line, 201);
    }

    public function removeLine(Request $request, Invoice $invoice, InvoiceLine $invoiceLine): JsonResponse
    {
        if ($invoice->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($invoiceLine->invoice_id !== $invoice->id) {
            return response()->json(['message' => 'Ligne non trouvée pour cette facture'], 404);
        }

        $invoiceLine->delete();

        // Recalculate total
        $totalCents = $invoice->invoiceLines()->sum('total_cents');
        $invoice->update(['total_cents' => (int) $totalCents]);

        return response()->json(['message' => 'Ligne supprimée']);
    }
}
