<?php

namespace App\Http\Controllers;

use App\Models\UserSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserSessionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $sessions = UserSession::where('user_id', $request->user()->id)
            ->orderByDesc('last_active_at')
            ->get();

        return response()->json($sessions);
    }

    public function destroy(Request $request, UserSession $userSession): JsonResponse
    {
        if ($userSession->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $userSession->delete();

        return response()->json(['message' => 'Session supprimée']);
    }

    public function destroyOthers(Request $request): JsonResponse
    {
        UserSession::where('user_id', $request->user()->id)
            ->where('is_current', false)
            ->delete();

        return response()->json(['message' => 'Autres sessions supprimées']);
    }

    public function updateActivity(Request $request, UserSession $userSession): JsonResponse
    {
        if ($userSession->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $userSession->update(['last_active_at' => now()]);

        return response()->json($userSession);
    }
}
