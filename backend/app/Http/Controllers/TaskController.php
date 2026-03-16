<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Task::where('user_id', $request->user()->id)
            ->with('staffMember');

        if ($request->has('staff_member_id')) {
            $query->where('staff_member_id', $request->input('staff_member_id'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->input('priority'));
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'staff_member_id' => ['nullable', 'exists:staff_members,id'],
            'priority' => ['nullable', 'string'],
            'status' => ['nullable', 'string'],
            'due_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $task = Task::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return response()->json($task->load('staffMember'), 201);
    }

    public function show(Request $request, Task $task): JsonResponse
    {
        if ($task->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($task->load('staffMember'));
    }

    public function update(Request $request, Task $task): JsonResponse
    {
        if ($task->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'staff_member_id' => ['nullable', 'exists:staff_members,id'],
            'priority' => ['nullable', 'string'],
            'status' => ['nullable', 'string'],
            'due_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $task->update($validated);

        return response()->json($task->load('staffMember'));
    }

    public function destroy(Request $request, Task $task): JsonResponse
    {
        if ($task->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $task->delete();

        return response()->json(['message' => 'Tâche supprimée']);
    }

    public function updateStatus(Request $request, Task $task): JsonResponse
    {
        if ($task->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'status' => ['required', 'string'],
        ]);

        $data = $validated;

        if ($validated['status'] === 'completed') {
            $data['completed_at'] = now();
        }

        $task->update($data);

        return response()->json($task);
    }
}
