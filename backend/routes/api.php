<?php

use App\Http\Controllers\ActionTypeController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ClientRoomController;
use App\Http\Controllers\ClientRoomInstructionController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\RoomActionController;
use App\Http\Controllers\RoomTypeController;
use App\Http\Controllers\ScheduleCalendarController;
use App\Http\Controllers\ScheduleEntryController;
use App\Http\Controllers\StaffBalanceController;
use App\Http\Controllers\StaffHistoryController;
use App\Http\Controllers\StaffMemberController;
use App\Http\Controllers\StaffPaymentController;
use App\Http\Controllers\StatisticsController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TimeEntryController;
use App\Http\Controllers\UserSessionController;
use App\Http\Controllers\WorkSessionController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/user/profile', [AuthController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);

    // Staff Members
    Route::apiResource('staff-members', StaffMemberController::class);
    Route::patch('staff-members/{staffMember}/toggle-active', [StaffMemberController::class, 'toggleActive']);

    // Clients
    Route::apiResource('clients', ClientController::class);

    // Schedule Entries
    Route::apiResource('schedule-entries', ScheduleEntryController::class);
    Route::patch('schedule-entries/{scheduleEntry}/status', [ScheduleEntryController::class, 'updateStatus']);
    Route::get('schedule-entries-unbilled', [ScheduleEntryController::class, 'unbilled']);

    // Tasks
    Route::apiResource('tasks', TaskController::class);
    Route::patch('tasks/{task}/status', [TaskController::class, 'updateStatus']);

    // Work Sessions
    Route::apiResource('work-sessions', WorkSessionController::class);
    Route::get('work-sessions/total/{staffMemberId}', [WorkSessionController::class, 'totalForStaff']);

    // Staff Payments
    Route::apiResource('staff-payments', StaffPaymentController::class);

    // Invoices
    Route::apiResource('invoices', InvoiceController::class);
    Route::patch('invoices/{invoice}/status', [InvoiceController::class, 'updateStatus']);
    Route::post('invoices/{invoice}/lines', [InvoiceController::class, 'addLine']);
    Route::delete('invoices/{invoice}/lines/{invoiceLine}', [InvoiceController::class, 'removeLine']);

    // Room Types
    Route::apiResource('room-types', RoomTypeController::class)->except(['show']);
    Route::patch('room-types/{roomType}/toggle-active', [RoomTypeController::class, 'toggleActive']);

    // Action Types
    Route::apiResource('action-types', ActionTypeController::class)->except(['show']);

    // Time Entries (custom routes BEFORE apiResource to avoid conflicts)
    Route::get('time-entries/current/{staffMemberId?}', [TimeEntryController::class, 'currentEntry']);
    Route::get('time-entries/missing', [TimeEntryController::class, 'missingEntries']);
    Route::get('time-entries-summary', [TimeEntryController::class, 'summary']);
    Route::patch('time-entries/{timeEntry}/clock-out', [TimeEntryController::class, 'clockOut']);
    Route::apiResource('time-entries', TimeEntryController::class);

    // Room Actions
    Route::get('room-actions', [RoomActionController::class, 'index']);
    Route::post('room-actions', [RoomActionController::class, 'store']);
    Route::delete('room-actions/{roomAction}', [RoomActionController::class, 'destroy']);
    Route::get('room-actions/today/{staffMemberId}', [RoomActionController::class, 'todayActions']);
    Route::get('room-actions/summary/{timeEntryId}', [RoomActionController::class, 'summary']);

    // Client Rooms
    Route::apiResource('client-rooms', ClientRoomController::class)->except(['show']);
    Route::post('client-rooms/from-types', [ClientRoomController::class, 'addFromTypes']);

    // Client Room Instructions
    Route::get('client-room-instructions', [ClientRoomInstructionController::class, 'index']);
    Route::post('client-room-instructions', [ClientRoomInstructionController::class, 'upsert']);
    Route::get('client-room-instructions/show', [ClientRoomInstructionController::class, 'show']);
    Route::delete('client-room-instructions/{clientRoomInstruction}', [ClientRoomInstructionController::class, 'destroy']);

    // User Sessions
    Route::get('sessions', [UserSessionController::class, 'index']);
    Route::delete('sessions/{userSession}', [UserSessionController::class, 'destroy']);
    Route::delete('sessions-others', [UserSessionController::class, 'destroyOthers']);
    Route::patch('sessions/{userSession}/activity', [UserSessionController::class, 'updateActivity']);

    // Staff Balance
    Route::get('staff-balances', [StaffBalanceController::class, 'index']);
    Route::get('staff-balances/global', [StaffBalanceController::class, 'global']);
    Route::get('staff-balances/{staffMemberId}', [StaffBalanceController::class, 'show']);

    // Staff History
    Route::get('staff-history/{staffMemberId}', [StaffHistoryController::class, 'index']);

    // Statistics
    Route::get('statistics/global', [StatisticsController::class, 'global']);
    Route::get('statistics/staff/{staffMemberId}', [StatisticsController::class, 'staff']);
    Route::get('statistics/activity', [StatisticsController::class, 'activity']);

    // Schedule Calendar
    Route::get('calendar/month', [ScheduleCalendarController::class, 'month']);
    Route::get('calendar/staff-clients/{staffMemberId}', [ScheduleCalendarController::class, 'staffClients']);
});
