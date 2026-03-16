<?php

namespace App\Http\Controllers;

use App\Models\ScheduleEntry;
use App\Models\StaffMember;
use App\Models\Task;
use App\Models\WorkSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class StatisticsController extends Controller
{
    public function global(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $scheduleQuery = ScheduleEntry::where('user_id', $userId);
        $taskQuery = Task::where('user_id', $userId);

        // Apply date filters
        if ($request->has('from')) {
            $scheduleQuery->where('scheduled_date', '>=', $request->input('from'));
            $taskQuery->where('created_at', '>=', $request->input('from'));
        }

        if ($request->has('to')) {
            $scheduleQuery->where('scheduled_date', '<=', $request->input('to'));
            $taskQuery->where('created_at', '<=', $request->input('to'));
        }

        if ($request->has('period')) {
            $this->applyPeriodFilter($scheduleQuery, 'scheduled_date', $request->input('period'));
            $this->applyPeriodFilter($taskQuery, 'created_at', $request->input('period'));
        }

        $totalSchedules = (clone $scheduleQuery)->count();
        $completedSchedules = (clone $scheduleQuery)->where('status', 'completed')->count();

        $totalTasks = (clone $taskQuery)->count();
        $completedTasks = (clone $taskQuery)->where('status', 'completed')->count();

        $totalStaff = StaffMember::where('user_id', $userId)->count();
        $activeStaff = StaffMember::where('user_id', $userId)->where('is_active', true)->count();

        return response()->json([
            'schedules' => [
                'total' => $totalSchedules,
                'completed' => $completedSchedules,
                'completion_rate' => $totalSchedules > 0 ? round($completedSchedules / $totalSchedules * 100, 1) : 0,
            ],
            'tasks' => [
                'total' => $totalTasks,
                'completed' => $completedTasks,
                'completion_rate' => $totalTasks > 0 ? round($completedTasks / $totalTasks * 100, 1) : 0,
            ],
            'staff' => [
                'total' => $totalStaff,
                'active' => $activeStaff,
            ],
        ]);
    }

    public function staff(Request $request, int $staffMemberId): JsonResponse
    {
        $userId = $request->user()->id;

        // Verify staff member belongs to user
        $staffMember = StaffMember::where('user_id', $userId)
            ->findOrFail($staffMemberId);

        $totalSchedules = ScheduleEntry::where('user_id', $userId)
            ->where('staff_member_id', $staffMemberId)
            ->count();

        $completedSchedules = ScheduleEntry::where('user_id', $userId)
            ->where('staff_member_id', $staffMemberId)
            ->where('status', 'completed')
            ->count();

        $totalTasks = Task::where('user_id', $userId)
            ->where('staff_member_id', $staffMemberId)
            ->count();

        $completedTasks = Task::where('user_id', $userId)
            ->where('staff_member_id', $staffMemberId)
            ->where('status', 'completed')
            ->count();

        $totalWorkMinutes = WorkSession::where('user_id', $userId)
            ->where('staff_member_id', $staffMemberId)
            ->sum('duration_minutes');

        $totalEarnedCents = WorkSession::where('user_id', $userId)
            ->where('staff_member_id', $staffMemberId)
            ->sum('amount_cents');

        return response()->json([
            'staff_member' => $staffMember,
            'schedules' => [
                'total' => $totalSchedules,
                'completed' => $completedSchedules,
                'completion_rate' => $totalSchedules > 0 ? round($completedSchedules / $totalSchedules * 100, 1) : 0,
            ],
            'tasks' => [
                'total' => $totalTasks,
                'completed' => $completedTasks,
                'completion_rate' => $totalTasks > 0 ? round($completedTasks / $totalTasks * 100, 1) : 0,
            ],
            'work' => [
                'total_minutes' => (int) $totalWorkMinutes,
                'total_earned_cents' => (int) $totalEarnedCents,
            ],
        ]);
    }

    public function activity(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $period = $request->input('period', 'week');

        $now = Carbon::now();

        switch ($period) {
            case 'month':
                $from = $now->copy()->subDays(30);
                break;
            case 'year':
                $from = $now->copy()->subYear();
                break;
            case 'week':
            default:
                $from = $now->copy()->subDays(7);
                break;
        }

        $schedules = ScheduleEntry::where('user_id', $userId)
            ->where('scheduled_date', '>=', $from)
            ->select(DB::raw('DATE(scheduled_date) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->pluck('count', 'date');

        $tasks = Task::where('user_id', $userId)
            ->where('created_at', '>=', $from)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->pluck('count', 'date');

        $workSessions = WorkSession::where('user_id', $userId)
            ->where('session_date', '>=', $from)
            ->select(DB::raw('DATE(session_date) as date'), DB::raw('sum(duration_minutes) as total_minutes'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->pluck('total_minutes', 'date');

        return response()->json([
            'period' => $period,
            'from' => $from->toDateString(),
            'to' => $now->toDateString(),
            'schedules' => $schedules,
            'tasks' => $tasks,
            'work_minutes' => $workSessions,
        ]);
    }

    private function applyPeriodFilter($query, string $dateColumn, string $period): void
    {
        $now = Carbon::now();

        match ($period) {
            'week' => $query->where($dateColumn, '>=', $now->copy()->startOfWeek()),
            'month' => $query->where($dateColumn, '>=', $now->copy()->startOfMonth()),
            'year' => $query->where($dateColumn, '>=', $now->copy()->startOfYear()),
            default => null,
        };
    }
}
