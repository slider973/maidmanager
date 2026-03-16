<?php

namespace App\Http\Controllers;

use App\Models\StaffMember;
use App\Models\WorkSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkSessionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = WorkSession::where('user_id', $request->user()->id)
            ->with('staffMember');

        if ($request->has('staff_member_id')) {
            $query->where('staff_member_id', $request->input('staff_member_id'));
        }

        if ($request->has('from')) {
            $query->where('session_date', '>=', $request->input('from'));
        }

        if ($request->has('to')) {
            $query->where('session_date', '<=', $request->input('to'));
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'staff_member_id' => ['required', 'exists:staff_members,id'],
            'session_date' => ['required', 'date'],
            'duration_minutes' => ['required', 'integer', 'min:1'],
            'schedule_entry_id' => ['nullable', 'exists:schedule_entries,id'],
            'description' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'hourly_rate_cents' => ['nullable', 'integer', 'min:0'],
            'amount_cents' => ['nullable', 'integer', 'min:0'],
        ]);

        $staffMember = StaffMember::where('user_id', $request->user()->id)
            ->findOrFail($validated['staff_member_id']);

        $hourlyRate = $validated['hourly_rate_cents'] ?? $staffMember->hourly_rate_cents ?? 0;
        $amountCents = $validated['amount_cents'] ?? (int) round($validated['duration_minutes'] * $hourlyRate / 60);

        $workSession = WorkSession::create([
            ...$validated,
            'user_id' => $request->user()->id,
            'hourly_rate_cents' => $hourlyRate,
            'amount_cents' => $amountCents,
        ]);

        return response()->json($workSession->load('staffMember'), 201);
    }

    public function show(Request $request, WorkSession $workSession): JsonResponse
    {
        if ($workSession->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($workSession->load('staffMember'));
    }

    public function update(Request $request, WorkSession $workSession): JsonResponse
    {
        if ($workSession->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'staff_member_id' => ['sometimes', 'required', 'exists:staff_members,id'],
            'session_date' => ['sometimes', 'required', 'date'],
            'duration_minutes' => ['sometimes', 'required', 'integer', 'min:1'],
            'schedule_entry_id' => ['nullable', 'exists:schedule_entries,id'],
            'description' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'hourly_rate_cents' => ['nullable', 'integer', 'min:0'],
            'amount_cents' => ['nullable', 'integer', 'min:0'],
        ]);

        $workSession->update($validated);

        // Recalculate amount_cents
        $durationMinutes = $workSession->duration_minutes;
        $hourlyRate = $workSession->hourly_rate_cents ?? 0;
        $workSession->update([
            'amount_cents' => (int) round($durationMinutes * $hourlyRate / 60),
        ]);

        return response()->json($workSession->load('staffMember'));
    }

    public function destroy(Request $request, WorkSession $workSession): JsonResponse
    {
        if ($workSession->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $workSession->delete();

        return response()->json(['message' => 'Session de travail supprimée']);
    }

    public function totalForStaff(Request $request, int $staffMemberId): JsonResponse
    {
        $total = WorkSession::where('user_id', $request->user()->id)
            ->where('staff_member_id', $staffMemberId)
            ->sum('amount_cents');

        return response()->json(['total_cents' => (int) $total]);
    }
}
