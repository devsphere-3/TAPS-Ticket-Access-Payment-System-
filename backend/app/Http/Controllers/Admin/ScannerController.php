<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ScannerController extends Controller
{
    public function scan(Request $request): JsonResponse
    {
        $request->validate([
            'ticket_uuid' => 'required|string',
        ]);

        $ticketUuid = trim($request->ticket_uuid);
        $adminId    = $request->user()->id;

        // Cari tiket
        $ticket = Ticket::with('attendance')
            ->where('ticket_uuid', $ticketUuid)
            ->first();

        if (! $ticket) {
            return response()->json([
                'success' => false,
                'code'    => 'INVALID',
                'message' => 'Tiket tidak ditemukan.',
            ], 404);
        }

        if ($ticket->isCancelled()) {
            return response()->json([
                'success' => false,
                'code'    => 'CANCELLED',
                'message' => 'Tiket telah dibatalkan.',
                'ticket'  => $this->formatTicket($ticket),
            ], 422);
        }

        if ($ticket->isUsed()) {
            return response()->json([
                'success'      => false,
                'code'         => 'ALREADY_USED',
                'message'      => 'Tiket sudah digunakan.',
                'ticket'       => $this->formatTicket($ticket),
                'checked_in_at' => $ticket->attendance?->checked_in_at,
            ], 409);
        }

        // Valid — proses check-in dengan transaction + row lock
        $result = DB::transaction(function () use ($ticket, $adminId) {
            // Lock baris tiket untuk cegah double scan concurrent
            $locked = Ticket::lockForUpdate()->find($ticket->id);

            // Double-check setelah lock
            if ($locked->isUsed()) {
                return ['already_used' => true, 'ticket' => $locked];
            }

            $locked->update([
                'status'  => 'USED',
                'used_at' => now(),
            ]);

            $locked->attendance()->update([
                'status'        => 'PRESENT',
                'checked_in_at' => now(),
                'checked_in_by' => $adminId,
            ]);

            return ['already_used' => false, 'ticket' => $locked->fresh('attendance')];
        });

        if ($result['already_used']) {
            return response()->json([
                'success' => false,
                'code'    => 'ALREADY_USED',
                'message' => 'Tiket sudah digunakan.',
                'ticket'  => $this->formatTicket($result['ticket']),
            ], 409);
        }

        return response()->json([
            'success' => true,
            'code'    => 'VALID',
            'message' => 'Tiket berhasil digunakan.',
            'ticket'  => $this->formatTicket($result['ticket']),
        ]);
    }

    private function formatTicket(Ticket $ticket): array
    {
        return [
            'ticket_uuid'    => $ticket->ticket_uuid,
            'customer_name'  => $ticket->customer_name,
            'customer_phone' => $ticket->customer_phone,
            'category'       => $ticket->category_name,
            'status'         => $ticket->status,
            'used_at'        => $ticket->used_at,
        ];
    }
}
