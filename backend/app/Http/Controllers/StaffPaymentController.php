<?php

namespace App\Http\Controllers;

use App\Models\StaffPayment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StaffPaymentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = StaffPayment::where('user_id', $request->user()->id)
            ->with('staffMember');

        if ($request->has('staff_member_id')) {
            $query->where('staff_member_id', $request->input('staff_member_id'));
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'staff_member_id' => ['required', 'exists:staff_members,id'],
            'amount_cents' => ['required', 'integer', 'min:1'],
            'payment_date' => ['required', 'date'],
            'payment_method' => ['required', 'string', 'in:cash,transfer,check'],
            'reference' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        $payment = StaffPayment::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return response()->json($payment->load('staffMember'), 201);
    }

    public function show(Request $request, StaffPayment $staffPayment): JsonResponse
    {
        if ($staffPayment->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($staffPayment->load('staffMember'));
    }

    public function update(Request $request, StaffPayment $staffPayment): JsonResponse
    {
        if ($staffPayment->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'staff_member_id' => ['sometimes', 'required', 'exists:staff_members,id'],
            'amount_cents' => ['sometimes', 'required', 'integer', 'min:1'],
            'payment_date' => ['sometimes', 'required', 'date'],
            'payment_method' => ['sometimes', 'required', 'string', 'in:cash,transfer,check'],
            'reference' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        $staffPayment->update($validated);

        return response()->json($staffPayment->load('staffMember'));
    }

    public function destroy(Request $request, StaffPayment $staffPayment): JsonResponse
    {
        if ($staffPayment->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $staffPayment->delete();

        return response()->json(['message' => 'Paiement supprimé']);
    }
}
