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
    /**
     * Get the staff member ID linked to current user's profile (if any)
     */
    private function getLinkedStaffMemberId(Request $request): ?int
    {
        $profile = $request->user()->profile;
        return $profile?->staff_account_id;
    }

    private function canAccessEntry(Request $request, TimeEntry $entry): bool
    {
        if ($entry->user_id === $request->user()->id) return true;
        $linkedId = $this->getLinkedStaffMemberId($request);
        return $linkedId && $entry->staff_member_id === $linkedId;
    }

    /**
     * Build query scoped to user's own data OR their linked staff member
     */
    private function scopedQuery(Request $request)
    {
        $linkedId = $this->getLinkedStaffMemberId($request);
        if ($linkedId) {
            return TimeEntry::where('staff_member_id', $linkedId);
        }
        return TimeEntry::where('user_id', $request->user()->id);
    }

    public function index(Request $request): JsonResponse
    {
        $query = $this->scopedQuery($request)
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

        // Use the staff member's owner (manager) as user_id
        $staffMember = StaffMember::findOrFail($validated['staff_member_id']);
        $timeEntry = TimeEntry::create([
            ...$validated,
            'user_id' => $staffMember->user_id,
            'clock_in_at' => now(),
            'status' => 'open',
        ]);

        return response()->json($timeEntry->load(['staffMember', 'client']), 201);
    }

    public function show(Request $request, TimeEntry $timeEntry): JsonResponse
    {
        if (!$this->canAccessEntry($request, $timeEntry)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($timeEntry->load(['staffMember', 'client', 'roomActions']));
    }

    public function update(Request $request, TimeEntry $timeEntry): JsonResponse
    {
        if (!$this->canAccessEntry($request, $timeEntry)) {
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
        if (!$this->canAccessEntry($request, $timeEntry)) {
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
            'user_id' => $staffMember->user_id,
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

    public function currentEntry(Request $request, ?int $staffMemberId = null): JsonResponse
    {
        $staffMemberId = $staffMemberId ?? $request->input('staff_member_id');

        $entry = $this->scopedQuery($request)
            ->where('staff_member_id', $staffMemberId)
            ->where('status', 'open')
            ->with(['staffMember', 'client'])
            ->first();

        if (!$entry) {
            return response()->json(null);
        }

        return response()->json($entry);
    }

    public function missingEntries(Request $request): JsonResponse
    {
        $staffMemberId = $request->input('staff_member_id');

        $entries = $this->scopedQuery($request)
            ->where('staff_member_id', $staffMemberId)
            ->where('status', 'open')
            ->where('clock_in_at', '<', now()->startOfDay())
            ->with(['staffMember', 'client'])
            ->get();

        return response()->json($entries);
    }

    public function summary(Request $request): JsonResponse
    {
        $query = $this->scopedQuery($request);

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
