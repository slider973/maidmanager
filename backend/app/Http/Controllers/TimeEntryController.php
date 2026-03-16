<?php

namespace App\Http\Controllers;

use App\Models\StaffMember;
use App\Models\TimeEntry;
use App\Models\WorkSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class TimeEntryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = TimeEntry::where('user_id', $request->user()->id)
            ->with(['staffMember', 'client']);

        if ($request->has('staff_member_id')) {
            $query->where('staff_member_id', $request->input('staff_member_id'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('from')) {
            $query->where('clock_in_at', '>=', $request->input('from'));
        }

        if ($request->has('to')) {
            $query->where('clock_in_at', '<=', $request->input('to'));
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'staff_member_id' => ['required', 'exists:staff_members,id'],
            'client_id' => ['nullable', 'exists:clients,id'],
            'notes' => ['nullable', 'string'],
        ]);

        $timeEntry = TimeEntry::create([
            ...$validated,
            'user_id' => $request->user()->id,
            'clock_in_at' => now(),
            'status' => 'open',
        ]);

        return response()->json($timeEntry->load(['staffMember', 'client']), 201);
    }

    public function show(Request $request, TimeEntry $timeEntry): JsonResponse
    {
        if ($timeEntry->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($timeEntry->load(['staffMember', 'client', 'roomActions']));
    }

    public function update(Request $request, TimeEntry $timeEntry): JsonResponse
    {
        if ($timeEntry->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'staff_member_id' => ['sometimes', 'required', 'exists:staff_members,id'],
            'client_id' => ['nullable', 'exists:clients,id'],
            'clock_in_at' => ['sometimes', 'required', 'date'],
            'clock_out_at' => ['nullable', 'date'],
            'duration_minutes' => ['nullable', 'integer', 'min:0'],
            'status' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ]);

        $timeEntry->update($validated);

        return response()->json($timeEntry->load(['staffMember', 'client']));
    }

    public function clockOut(Request $request, TimeEntry $timeEntry): JsonResponse
    {
        if ($timeEntry->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($timeEntry->status !== 'open') {
            return response()->json(['message' => 'Cette entrée est déjà clôturée'], 422);
        }

        $clockOutAt = now();
        $durationMinutes = (int) round($timeEntry->clock_in_at->diffInMinutes($clockOutAt));

        $timeEntry->update([
            'clock_out_at' => $clockOutAt,
            'duration_minutes' => $durationMinutes,
            'status' => 'closed',
        ]);

        // Auto-create WorkSession
        $staffMember = $timeEntry->staffMember;
        $hourlyRate = $staffMember->hourly_rate_cents ?? 0;
        $amountCents = (int) round($durationMinutes * $hourlyRate / 60);

        $workSession = WorkSession::create([
            'user_id' => $request->user()->id,
            'staff_member_id' => $timeEntry->staff_member_id,
            'session_date' => $timeEntry->clock_in_at->toDateString(),
            'duration_minutes' => $durationMinutes,
            'hourly_rate_cents' => $hourlyRate,
            'amount_cents' => $amountCents,
            'description' => 'Pointage automatique',
        ]);

        $timeEntry->update(['work_session_id' => $workSession->id]);

        return response()->json($timeEntry->load(['staffMember', 'client']));
    }

    public function currentEntry(Request $request, int $staffMemberId): JsonResponse
    {
        $entry = TimeEntry::where('user_id', $request->user()->id)
            ->where('staff_member_id', $staffMemberId)
            ->where('status', 'open')
            ->with(['staffMember', 'client'])
            ->first();

        if (!$entry) {
            return response()->json(null);
        }

        return response()->json($entry);
    }

    public function summary(Request $request): JsonResponse
    {
        $query = TimeEntry::where('user_id', $request->user()->id);

        if ($request->has('staff_member_id')) {
            $query->where('staff_member_id', $request->input('staff_member_id'));
        }

        $date = $request->input('date', now()->toDateString());
        $startOfWeek = Carbon::parse($date)->startOfWeek();
        $endOfWeek = Carbon::parse($date)->endOfWeek();

        $dailyMinutes = (clone $query)
            ->whereDate('clock_in_at', $date)
            ->where('status', 'closed')
            ->sum('duration_minutes');

        $weeklyMinutes = (clone $query)
            ->whereBetween('clock_in_at', [$startOfWeek, $endOfWeek])
            ->where('status', 'closed')
            ->sum('duration_minutes');

        return response()->json([
            'date' => $date,
            'daily_minutes' => (int) $dailyMinutes,
            'weekly_minutes' => (int) $weeklyMinutes,
        ]);
    }
}
