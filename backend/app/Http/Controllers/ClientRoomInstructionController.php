<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\ClientRoomInstruction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientRoomInstructionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'client_id' => ['required', 'integer'],
        ]);

        // Verify client belongs to user
        Client::where('user_id', $request->user()->id)
            ->findOrFail($request->input('client_id'));

        $instructions = ClientRoomInstruction::where('client_id', $request->input('client_id'))
            ->with('roomType')
            ->get();

        return response()->json($instructions);
    }

    public function upsert(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'client_id' => ['required', 'exists:clients,id'],
            'room_type_id' => ['required', 'exists:room_types,id'],
            'instructions' => ['required', 'string'],
        ]);

        // Verify client belongs to user
        Client::where('user_id', $request->user()->id)
            ->findOrFail($validated['client_id']);

        $instruction = ClientRoomInstruction::updateOrCreate(
            [
                'client_id' => $validated['client_id'],
                'room_type_id' => $validated['room_type_id'],
            ],
            [
                'instructions' => $validated['instructions'],
                'updated_by' => $request->user()->id,
            ]
        );

        return response()->json($instruction->load('roomType'));
    }

    public function show(Request $request): JsonResponse
    {
        $request->validate([
            'client_id' => ['required', 'integer'],
            'room_type_id' => ['required', 'integer'],
        ]);

        // Verify client belongs to user
        Client::where('user_id', $request->user()->id)
            ->findOrFail($request->input('client_id'));

        $instruction = ClientRoomInstruction::where('client_id', $request->input('client_id'))
            ->where('room_type_id', $request->input('room_type_id'))
            ->with('roomType')
            ->firstOrFail();

        return response()->json($instruction);
    }

    public function destroy(Request $request, ClientRoomInstruction $clientRoomInstruction): JsonResponse
    {
        // Verify ownership through client
        Client::where('user_id', $request->user()->id)
            ->findOrFail($clientRoomInstruction->client_id);

        $clientRoomInstruction->delete();

        return response()->json(['message' => 'Instruction supprimée']);
    }
}
