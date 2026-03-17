<?php

namespace App\Http\Controllers;

use App\Models\RoomAction;
use App\Models\StaffMember;
use App\Models\TimeEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RoomActionController extends Controller
{
    private function getLinkedStaffMemberId(Request $request): ?int
    {
        $profile = $request->user()->profile;
        return $profile?->staff_account_id;
    }

    private function scopedTimeEntryQuery(Request $request)
    {
        $linkedId = $this->getLinkedStaffMemberId($request);
        if ($linkedId) {
            return TimeEntry::where('staff_member_id', $linkedId);
        }
        return TimeEntry::where('user_id', $request->user()->id);
    }

    public function index(Request $request): JsonResponse
    {
        // Support both time_entry_id and staff_member_id+date
        if ($request->has('staff_member_id') && $request->has('date')) {
            $timeEntryIds = $this->scopedTimeEntryQuery($request)
                ->where('staff_member_id', $request->input('staff_member_id'))
                ->whereDate('clock_in_at', $request->input('date'))
                ->pluck('id');

            $actions = RoomAction::whereIn('time_entry_id', $timeEntryIds)
                ->with(['roomType', 'actionType'])
                ->get();

            return response()->json($actions);
        }

        $request->validate([
            'time_entry_id' => ['required', 'integer'],
        ]);

        $timeEntry = $this->scopedTimeEntryQuery($request)
            ->findOrFail($request->input('time_entry_id'));

        $actions = RoomAction::where('time_entry_id', $timeEntry->id)
            ->with(['roomType', 'actionType'])
            ->get();

        return response()->json($actions);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'time_entry_id' => ['required', 'exists:time_entries,id'],
            'room_type_id' => ['required', 'exists:room_types,id'],
            'action_type_id' => ['required', 'exists:action_types,id'],
            'notes' => ['nullable', 'string'],
        ]);

        $this->scopedTimeEntryQuery($request)
            ->findOrFail($validated['time_entry_id']);

        $roomAction = RoomAction::create([
            ...$validated,
            'performed_at' => now(),
        ]);

        return response()->json($roomAction->load(['roomType', 'actionType']), 201);
    }

    public function destroy(Request $request, RoomAction $roomAction): JsonResponse
    {
        $this->scopedTimeEntryQuery($request)
            ->findOrFail($roomAction->time_entry_id);

        $roomAction->delete();

        return response()->json(['message' => 'Action supprimée']);
    }

    public function todayActions(Request $request, ?int $staffMemberId = null): JsonResponse
    {
        $staffMemberId = $staffMemberId ?? $request->input('staff_member_id');

        $timeEntryIds = $this->scopedTimeEntryQuery($request)
            ->where('staff_member_id', $staffMemberId)
            ->whereDate('clock_in_at', now()->toDateString())
            ->pluck('id');

        $actions = RoomAction::whereIn('time_entry_id', $timeEntryIds)
            ->with(['roomType', 'actionType'])
            ->get();

        return response()->json($actions);
    }

    public function summary(Request $request, int $timeEntryId): JsonResponse
    {
        $this->scopedTimeEntryQuery($request)
            ->findOrFail($timeEntryId);

        $summary = RoomAction::where('time_entry_id', $timeEntryId)
            ->select('action_type_id', DB::raw('count(*) as count'))
            ->groupBy('action_type_id')
            ->with('actionType')
            ->get();

        return response()->json($summary);
    }
}
