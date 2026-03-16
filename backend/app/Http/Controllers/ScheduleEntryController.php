<?php

namespace App\Http\Controllers;

use App\Models\ScheduleEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScheduleEntryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ScheduleEntry::where('user_id', $request->user()->id)
            ->with(['staffMember', 'client']);

        if ($request->has('staff_member_id')) {
            $query->where('staff_member_id', $request->input('staff_member_id'));
        }

        if ($request->has('client_id')) {
            $query->where('client_id', $request->input('client_id'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('from')) {
            $query->where('scheduled_date', '>=', $request->input('from'));
        }

        if ($request->has('to')) {
            $query->where('scheduled_date', '<=', $request->input('to'));
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'staff_member_id' => ['required', 'exists:staff_members,id'],
            'client_id' => ['nullable', 'exists:clients,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'scheduled_date' => ['required', 'date'],
            'start_time' => ['nullable', 'string'],
            'end_time' => ['nullable', 'string'],
            'duration_minutes' => ['nullable', 'integer', 'min:1'],
            'status' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ]);

        $entry = ScheduleEntry::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return response()->json($entry->load(['staffMember', 'client']), 201);
    }

    public function show(Request $request, ScheduleEntry $scheduleEntry): JsonResponse
    {
        if ($scheduleEntry->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($scheduleEntry->load(['staffMember', 'client']));
    }

    public function update(Request $request, ScheduleEntry $scheduleEntry): JsonResponse
    {
        if ($scheduleEntry->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'staff_member_id' => ['sometimes', 'required', 'exists:staff_members,id'],
            'client_id' => ['nullable', 'exists:clients,id'],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'scheduled_date' => ['sometimes', 'required', 'date'],
            'start_time' => ['nullable', 'string'],
            'end_time' => ['nullable', 'string'],
            'duration_minutes' => ['nullable', 'integer', 'min:1'],
            'status' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'is_billed' => ['sometimes', 'boolean'],
        ]);

        $scheduleEntry->update($validated);

        return response()->json($scheduleEntry->load(['staffMember', 'client']));
    }

    public function destroy(Request $request, ScheduleEntry $scheduleEntry): JsonResponse
    {
        if ($scheduleEntry->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $scheduleEntry->delete();

        return response()->json(['message' => 'Entrée de planning supprimée']);
    }

    public function updateStatus(Request $request, ScheduleEntry $scheduleEntry): JsonResponse
    {
        if ($scheduleEntry->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'status' => ['required', 'string'],
        ]);

        $scheduleEntry->update($validated);

        return response()->json($scheduleEntry);
    }

    public function unbilled(Request $request): JsonResponse
    {
        $entries = ScheduleEntry::where('user_id', $request->user()->id)
            ->where('status', 'completed')
            ->where('is_billed', false)
            ->with(['staffMember', 'client'])
            ->get();

        return response()->json($entries);
    }
}
