<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ScheduleEntry extends Model
{
    protected $fillable = [
        'user_id',
        'staff_member_id',
        'client_id',
        'title',
        'description',
        'scheduled_date',
        'start_time',
        'end_time',
        'duration_minutes',
        'status',
        'notes',
        'is_billed',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_date' => 'date',
            'is_billed' => 'boolean',
            'duration_minutes' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function staffMember(): BelongsTo
    {
        return $this->belongsTo(StaffMember::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function workSession(): HasOne
    {
        return $this->hasOne(WorkSession::class);
    }
}
