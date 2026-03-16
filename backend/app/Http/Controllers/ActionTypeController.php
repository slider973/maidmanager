<?php

namespace App\Http\Controllers;

use App\Models\ActionType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActionTypeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ActionType::where(function ($q) use ($request) {
            $q->whereNull('user_id')
                ->orWhere('user_id', $request->user()->id);
        })
            ->orderBy('sort_order');

        if ($request->has('position')) {
            $position = $request->input('position');
            $query->where(function ($q) use ($position) {
                $q->whereNull('position_filter')
                    ->orWhereJsonContains('position_filter', $position);
            });
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'name_fr' => ['required', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:255'],
            'position_filter' => ['nullable', 'array'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $actionType = ActionType::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return response()->json($actionType, 201);
    }

    public function update(Request $request, ActionType $actionType): JsonResponse
    {
        if ($actionType->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'name_fr' => ['sometimes', 'required', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:255'],
            'position_filter' => ['nullable', 'array'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $actionType->update($validated);

        return response()->json($actionType);
    }

    public function destroy(Request $request, ActionType $actionType): JsonResponse
    {
        if ($actionType->user_id === null) {
            return response()->json(['message' => 'Les types système ne peuvent pas être supprimés'], 403);
        }

        if ($actionType->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $actionType->delete();

        return response()->json(['message' => "Type d'action supprimé"]);
    }
}
