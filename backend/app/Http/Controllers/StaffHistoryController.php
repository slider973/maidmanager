<?php

namespace App\Http\Controllers;

use App\Models\StaffMember;
use App\Models\StaffPayment;
use App\Models\WorkSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StaffHistoryController extends Controller
{
    public function index(Request $request, int $staffMemberId): JsonResponse
    {
        // Verify staff member belongs to user
        StaffMember::where('user_id', $request->user()->id)
            ->findOrFail($staffMemberId);

        $workSessions = WorkSession::where('user_id', $request->user()->id)
            ->where('staff_member_id', $staffMemberId)
            ->get()
            ->map(function ($session) {
                return [
                    'id' => $session->id,
                    'type' => 'work_session',
                    'date' => $session->session_date->toDateString(),
                    'amount_cents' => $session->amount_cents,
                    'description' => $session->description,
                    'duration_minutes' => $session->duration_minutes,
                    'created_at' => $session->created_at,
                ];
            });

        $payments = StaffPayment::where('user_id', $request->user()->id)
            ->where('staff_member_id', $staffMemberId)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'type' => 'payment',
                    'date' => $payment->payment_date->toDateString(),
                    'amount_cents' => -$payment->amount_cents,
                    'description' => $payment->notes,
                    'payment_method' => $payment->payment_method,
                    'reference' => $payment->reference,
                    'created_at' => $payment->created_at,
                ];
            });

        $timeline = $workSessions->concat($payments)
            ->sortByDesc('date')
            ->values();

        return response()->json($timeline);
    }
}
