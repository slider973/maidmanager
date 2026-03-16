<?php

namespace App\Http\Controllers;

use App\Models\RoomType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoomTypeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $roomTypes = RoomType::where(function ($query) use ($request) {
            $query->whereNull('user_id')
                ->orWhere('user_id', $request->user()->id);
        })
            ->orderBy('sort_order')
            ->get();

        return response()->json($roomTypes);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'name_fr' => ['required', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $roomType = RoomType::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return response()->json($roomType, 201);
    }

    public function update(Request $request, RoomType $roomType): JsonResponse
    {
        if ($roomType->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'name_fr' => ['sometimes', 'required', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $roomType->update($validated);

        return response()->json($roomType);
    }

    public function destroy(Request $request, RoomType $roomType): JsonResponse
    {
        if ($roomType->user_id === null) {
            return response()->json(['message' => 'Les types système ne peuvent pas être supprimés'], 403);
        }

        if ($roomType->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $roomType->delete();

        return response()->json(['message' => 'Type de pièce supprimé']);
    }

    public function toggleActive(Request $request, RoomType $roomType): JsonResponse
    {
        if ($roomType->user_id !== null && $roomType->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $roomType->update(['is_active' => !$roomType->is_active]);

        return response()->json($roomType);
    }
}
