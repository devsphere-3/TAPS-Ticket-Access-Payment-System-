<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use Illuminate\Http\JsonResponse;

class TicketController extends Controller
{
    // Public: ambil detail tiket berdasarkan UUID
    public function show(string $ticketUuid): JsonResponse
    {
        $ticket = Ticket::with('attendance')
            ->where('ticket_uuid', $ticketUuid)
            ->firstOrFail();

        return response()->json([
            'ticket_uuid'    => $ticket->ticket_uuid,
            'customer_name'  => $ticket->customer_name,
            'customer_phone' => $ticket->customer_phone,
            'category_name'  => $ticket->category_name,
            'status'         => $ticket->status,
            'used_at'        => $ticket->used_at,
            'attendance'     => $ticket->attendance ? [
                'status'        => $ticket->attendance->status,
                'checked_in_at' => $ticket->attendance->checked_in_at,
            ] : null,
        ]);
    }
}
