<?php

namespace App\Http\Controllers;

use App\Models\StaffMember;
use App\Models\StaffPayment;
use App\Models\WorkSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StaffBalanceController extends Controller
{
    public function show(Request $request, int $staffMemberId): JsonResponse
    {
        // Verify staff member belongs to user
        $staffMember = StaffMember::where('user_id', $request->user()->id)
            ->findOrFail($staffMemberId);

        $totalEarned = WorkSession::where('user_id', $request->user()->id)
            ->where('staff_member_id', $staffMemberId)
            ->sum('amount_cents');

        $totalPaid = StaffPayment::where('user_id', $request->user()->id)
            ->where('staff_member_id', $staffMemberId)
            ->sum('amount_cents');

        return response()->json([
            'staff_member_id' => $staffMemberId,
            'staff_member' => $staffMember,
            'total_work_cents' => (int) $totalEarned,
            'total_paid_cents' => (int) $totalPaid,
            'total_balance_cents' => (int) ($totalEarned - $totalPaid),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $staffMembers = StaffMember::where('user_id', $request->user()->id)
            ->where('is_active', true)
            ->get();

        $balances = $staffMembers->map(function ($staffMember) use ($request) {
            $totalEarned = WorkSession::where('user_id', $request->user()->id)
                ->where('staff_member_id', $staffMember->id)
                ->sum('amount_cents');

            $totalPaid = StaffPayment::where('user_id', $request->user()->id)
                ->where('staff_member_id', $staffMember->id)
                ->sum('amount_cents');

            return [
                'staff_member_id' => $staffMember->id,
                'staff_member' => $staffMember,
                'total_work_cents' => (int) $totalEarned,
                'total_paid_cents' => (int) $totalPaid,
                'total_balance_cents' => (int) ($totalEarned - $totalPaid),
            ];
        });

        return response()->json($balances);
    }

    public function global(Request $request): JsonResponse
    {
        $totalEarned = WorkSession::where('user_id', $request->user()->id)
            ->sum('amount_cents');

        $totalPaid = StaffPayment::where('user_id', $request->user()->id)
            ->sum('amount_cents');

        $staffCount = StaffMember::where('user_id', $request->user()->id)
            ->where('is_active', true)
            ->count();

        return response()->json([
            'total_work_cents' => (int) $totalEarned,
            'total_paid_cents' => (int) $totalPaid,
            'total_balance_cents' => (int) ($totalEarned - $totalPaid),
            'staff_count' => $staffCount,
        ]);
    }
}
