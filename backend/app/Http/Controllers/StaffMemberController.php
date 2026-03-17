<?php

namespace App\Http\Controllers;

use App\Models\StaffMember;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StaffMemberController extends Controller
{
    /**
     * Check if user owns this staff member OR is the linked staff account
     */
    private function canAccess(Request $request, StaffMember $staffMember): bool
    {
        if ($staffMember->user_id === $request->user()->id) {
            return true;
        }
        $profile = $request->user()->profile;
        return $profile && $profile->staff_account_id === $staffMember->id;
    }

    public function index(Request $request): JsonResponse
    {
        $query = StaffMember::where('user_id', $request->user()->id)
            ->orderBy('first_name');

        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'position' => ['required', 'string', 'in:housekeeper,gardener,cook,driver,nanny,guard,other'],
            'position_custom' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'email', 'max:255'],
            'start_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'hourly_rate_cents' => ['nullable', 'integer', 'min:0'],
        ]);

        $staffMember = StaffMember::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return response()->json($staffMember, 201);
    }

    public function show(Request $request, StaffMember $staffMember): JsonResponse
    {
        if (!$this->canAccess($request, $staffMember)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($staffMember);
    }

    public function update(Request $request, StaffMember $staffMember): JsonResponse
    {
        if ($staffMember->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'first_name' => ['sometimes', 'required', 'string', 'max:255'],
            'last_name' => ['sometimes', 'required', 'string', 'max:255'],
            'position' => ['sometimes', 'required', 'string', 'in:housekeeper,gardener,cook,driver,nanny,guard,other'],
            'position_custom' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'email', 'max:255'],
            'start_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
            'hourly_rate_cents' => ['nullable', 'integer', 'min:0'],
        ]);

        $staffMember->update($validated);

        return response()->json($staffMember);
    }

    public function destroy(Request $request, StaffMember $staffMember): JsonResponse
    {
        if ($staffMember->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $staffMember->delete();

        return response()->json(['message' => 'Membre du personnel supprimé']);
    }

    public function toggleActive(Request $request, StaffMember $staffMember): JsonResponse
    {
        if ($staffMember->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $staffMember->update(['is_active' => !$staffMember->is_active]);

        return response()->json($staffMember);
    }
}
