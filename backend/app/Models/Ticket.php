<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Ticket extends Model
{
    protected $fillable = [
        'order_id',
        'ticket_category_id',
        'ticket_uuid',
        'customer_name',
        'customer_phone',
        'category_name',
        'status',
        'used_at',
    ];

    protected function casts(): array
    {
        return [
            'used_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function ticketCategory(): BelongsTo
    {
        return $this->belongsTo(TicketCategory::class);
    }

    public function attendance(): HasOne
    {
        return $this->hasOne(Attendance::class);
    }

    public function isUnused(): bool
    {
        return $this->status === 'UNUSED';
    }

    public function isUsed(): bool
    {
        return $this->status === 'USED';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'CANCELLED';
    }
}
