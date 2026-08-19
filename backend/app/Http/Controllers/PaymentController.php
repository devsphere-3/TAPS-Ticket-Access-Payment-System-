<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Order;
use App\Models\Ticket;
use App\Services\PaymentServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function __construct(
        private readonly PaymentServiceInterface $paymentService
    ) {}

    // Public: proses demo payment
    public function demo(Request $request): JsonResponse
    {
        $request->validate([
            'order_number' => 'required|string|exists:orders,order_number',
        ]);

        $order = Order::where('order_number', $request->order_number)->firstOrFail();

        if (! $order->isUnpaid()) {
            return response()->json([
                'message' => 'Order ini tidak dalam status menunggu pembayaran.',
            ], 422);
        }

        $success = $this->paymentService->pay($order);

        if (! $success) {
            return response()->json(['message' => 'Pembayaran gagal.'], 500);
        }

        // Update order dan generate tickets dalam 1 transaction
        $tickets = DB::transaction(function () use ($order) {
            $order->update([
                'payment_status' => 'PAID',
                'payment_method' => $this->paymentService->getMethodName(),
                'paid_at'        => now(),
            ]);

            return $this->generateTickets($order);
        });

        return response()->json([
            'message'        => 'Pembayaran berhasil.',
            'order_number'   => $order->order_number,
            'payment_status' => 'PAID',
            'tickets'        => $tickets->map(fn($t) => [
                'ticket_uuid'   => $t->ticket_uuid,
                'customer_name' => $t->customer_name,
                'category_name' => $t->category_name,
                'status'        => $t->status,
            ]),
        ]);
    }

    private function generateTickets(Order $order)
    {
        $order->load('orderItems');
        $tickets = collect();

        foreach ($order->orderItems as $item) {
            for ($i = 0; $i < $item->quantity; $i++) {
                $ticketUuid = 'TKT-' . strtoupper(Str::random(6));

                // Pastikan uuid unik
                while (Ticket::where('ticket_uuid', $ticketUuid)->exists()) {
                    $ticketUuid = 'TKT-' . strtoupper(Str::random(6));
                }

                $ticket = Ticket::create([
                    'order_id'           => $order->id,
                    'ticket_category_id' => $item->ticket_category_id,
                    'ticket_uuid'        => $ticketUuid,
                    'customer_name'      => $order->customer_name,
                    'customer_phone'     => $order->customer_phone,
                    'category_name'      => $item->ticket_category_name,
                    'status'             => 'UNUSED',
                ]);

                // Buat attendance record awal
                Attendance::create([
                    'ticket_id'     => $ticket->id,
                    'status'        => 'NOT_PRESENT',
                    'checked_in_at' => null,
                    'checked_in_by' => null,
                ]);

                $tickets->push($ticket);
            }
        }

        return $tickets;
    }
}
