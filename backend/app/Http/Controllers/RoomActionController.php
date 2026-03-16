<?php

namespace App\Http\Controllers;

use App\Models\RoomAction;
use App\Models\TimeEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RoomActionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'time_entry_id' => ['required', 'integer'],
        ]);

        // Verify the time entry belongs to the user
        $timeEntry = TimeEntry::where('user_id', $request->user()->id)
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

        // Verify the time entry belongs to the user
        TimeEntry::where('user_id', $request->user()->id)
            ->findOrFail($validated['time_entry_id']);

        $roomAction = RoomAction::create([
            ...$validated,
            'performed_at' => now(),
        ]);

        return response()->json($roomAction->load(['roomType', 'actionType']), 201);
    }

    public function destroy(Request $request, RoomAction $roomAction): JsonResponse
    {
        // Verify ownership through time entry
        TimeEntry::where('user_id', $request->user()->id)
            ->findOrFail($roomAction->time_entry_id);

        $roomAction->delete();

        return response()->json(['message' => 'Action supprimée']);
    }

    public function todayActions(Request $request, int $staffMemberId): JsonResponse
    {
        $timeEntryIds = TimeEntry::where('user_id', $request->user()->id)
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
        // Verify the time entry belongs to the user
        TimeEntry::where('user_id', $request->user()->id)
            ->findOrFail($timeEntryId);

        $summary = RoomAction::where('time_entry_id', $timeEntryId)
            ->select('action_type_id', DB::raw('count(*) as count'))
            ->groupBy('action_type_id')
            ->with('actionType')
            ->get();

        return response()->json($summary);
    }
}
