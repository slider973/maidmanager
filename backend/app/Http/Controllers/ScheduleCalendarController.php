<?php

namespace App\Http\Controllers;

use App\Models\ScheduleEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ScheduleCalendarController extends Controller
{
    public function month(Request $request): JsonResponse
    {
        $year = $request->input('year', now()->year);
        $month = $request->input('month', now()->month);

        $startOfMonth = Carbon::create($year, $month, 1)->startOfMonth();
        $endOfMonth = Carbon::create($year, $month, 1)->endOfMonth();

        // Support staff accessing their own schedules
        $profile = $request->user()->profile;
        $linkedStaffId = $profile?->staff_account_id;
        if ($linkedStaffId) {
            $staffMember = \App\Models\StaffMember::findOrFail($linkedStaffId);
            $userId = $staffMember->user_id;
        } else {
            $userId = $request->user()->id;
        }

        $query = ScheduleEntry::where('user_id', $userId)
            ->whereBetween('scheduled_date', [$startOfMonth, $endOfMonth])
            ->with(['staffMember', 'client']);

        if ($request->has('client_id')) {
            $query->where('client_id', $request->input('client_id'));
        }

        if ($request->has('staff_member_id')) {
            $query->where('staff_member_id', $request->input('staff_member_id'));
        }

        $entries = $query->orderBy('scheduled_date')
            ->orderBy('start_time')
            ->get();

        // Organize by day
        $calendar = $entries->groupBy(function ($entry) {
            return $entry->scheduled_date->toDateString();
        });

        return response()->json([
            'year' => (int) $year,
            'month' => (int) $month,
            'days' => $calendar,
        ]);
    }

    public function staffClients(Request $request, ?int $staffMemberId = null): JsonResponse
    {
        $staffMemberId = $staffMemberId ?? $request->input('staff_member_id');

        // Support staff accessing their own data
        $profile = $request->user()->profile;
        $linkedStaffId = $profile?->staff_account_id;

        if ($linkedStaffId) {
            $staffMember = \App\Models\StaffMember::findOrFail($linkedStaffId);
            $managerId = $staffMember->user_id;
        } else {
            $managerId = $request->user()->id;
        }

        $clientIds = ScheduleEntry::where('user_id', $managerId)
            ->where('staff_member_id', $staffMemberId)
            ->whereNotNull('client_id')
            ->distinct()
            ->pluck('client_id');

        $clients = \App\Models\Client::where('user_id', $managerId)
            ->whereIn('id', $clientIds)
            ->get();

        return response()->json($clients);
    }
}
