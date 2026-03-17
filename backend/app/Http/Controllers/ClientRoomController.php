<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\ClientRoom;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientRoomController extends Controller
{
    private function findAccessibleClient(Request $request, int $clientId): Client
    {
        // Try direct ownership first
        $client = Client::where('user_id', $request->user()->id)->find($clientId);
        if ($client) return $client;

        // Staff can access clients of their manager
        $profile = $request->user()->profile;
        if ($profile?->staff_account_id) {
            $staffMember = \App\Models\StaffMember::find($profile->staff_account_id);
            if ($staffMember) {
                $client = Client::where('user_id', $staffMember->user_id)->find($clientId);
                if ($client) return $client;
            }
        }
        abort(403, 'Forbidden');
    }

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'client_id' => ['required', 'integer'],
        ]);

        $this->findAccessibleClient($request, $request->input('client_id'));

        $rooms = ClientRoom::where('client_id', $request->input('client_id'))
            ->with('roomType')
            ->orderBy('sort_order')
            ->get();

        return response()->json($rooms);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'client_id' => ['required', 'exists:clients,id'],
            'room_type_id' => ['nullable', 'exists:room_types,id'],
            'custom_name' => ['nullable', 'string', 'max:255'],
            'instructions' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        // Verify client belongs to user
        Client::where('user_id', $request->user()->id)
            ->findOrFail($validated['client_id']);

        $room = ClientRoom::create($validated);

        return response()->json($room->load('roomType'), 201);
    }

    public function update(Request $request, ClientRoom $clientRoom): JsonResponse
    {
        // Verify ownership through client
        Client::where('user_id', $request->user()->id)
            ->findOrFail($clientRoom->client_id);

        $validated = $request->validate([
            'room_type_id' => ['nullable', 'exists:room_types,id'],
            'custom_name' => ['nullable', 'string', 'max:255'],
            'instructions' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $clientRoom->update($validated);

        return response()->json($clientRoom->load('roomType'));
    }

    public function destroy(Request $request, ClientRoom $clientRoom): JsonResponse
    {
        // Verify ownership through client
        Client::where('user_id', $request->user()->id)
            ->findOrFail($clientRoom->client_id);

        $clientRoom->delete();

        return response()->json(['message' => 'Pièce supprimée']);
    }

    public function addFromTypes(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'client_id' => ['required', 'exists:clients,id'],
            'room_type_ids' => ['required', 'array'],
            'room_type_ids.*' => ['required', 'exists:room_types,id'],
        ]);

        // Verify client belongs to user
        Client::where('user_id', $request->user()->id)
            ->findOrFail($validated['client_id']);

        $rooms = [];
        foreach ($validated['room_type_ids'] as $index => $roomTypeId) {
            $rooms[] = ClientRoom::create([
                'client_id' => $validated['client_id'],
                'room_type_id' => $roomTypeId,
                'sort_order' => $index,
            ]);
        }

        return response()->json(
            ClientRoom::whereIn('id', collect($rooms)->pluck('id'))
                ->with('roomType')
                ->get(),
            201
        );
    }
}
