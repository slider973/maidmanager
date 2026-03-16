<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class StaffMember extends Model
{
    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'position',
        'position_custom',
        'phone',
        'email',
        'start_date',
        'notes',
        'is_active',
        'hourly_rate_cents',
        'invitation_token',
        'invitation_expires_at',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'start_date' => 'date',
            'invitation_expires_at' => 'datetime',
            'hourly_rate_cents' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function workSessions(): HasMany
    {
        return $this->hasMany(WorkSession::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function scheduleEntries(): HasMany
    {
        return $this->hasMany(ScheduleEntry::class);
    }

    public function staffPayments(): HasMany
    {
        return $this->hasMany(StaffPayment::class);
    }

    public function timeEntries(): HasMany
    {
        return $this->hasMany(TimeEntry::class);
    }

    public function profile(): HasOne
    {
        return $this->hasOne(Profile::class, 'staff_account_id');
    }
}
