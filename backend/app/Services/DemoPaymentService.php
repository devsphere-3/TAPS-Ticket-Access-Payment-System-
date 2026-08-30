<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Order;
use App\Models\Ticket;
use Illuminate\Support\Str;

class DemoPaymentService implements PaymentServiceInterface
{
    /**
     * Demo payment: langsung anggap berhasil dan buat tiket.
     * Digunakan untuk development/testing lokal.
     */
    public function createInvoice(Order $order): string
    {
        $order->loadMissing('orderItems');

        $order->update([
            'payment_status' => 'PAID',
            'payment_method' => 'DEMO',
            'paid_at'        => now(),
        ]);

        foreach ($order->orderItems as $item) {
            for ($i = 0; $i < $item->quantity; $i++) {
                $ticket = Ticket::create([
                    'order_id'           => $order->id,
                    'ticket_category_id' => $item->ticket_category_id,
                    'ticket_uuid'        => 'TKT-' . strtoupper(Str::random(8)),
                    'customer_name'      => $order->customer_name,
                    'customer_phone'     => $order->customer_phone,
                    'category_name'      => $item->ticket_category_name,
                    'status'             => 'UNUSED',
                ]);

                Attendance::create([
                    'ticket_id'     => $ticket->id,
                    'status'        => 'NOT_PRESENT',
                    'checked_in_at' => null,
                    'checked_in_by' => null,
                ]);
            }
        }

        return env('FRONTEND_URL', 'http://localhost:5173')
            . '/payment-success?order=' . $order->order_number
            . '&demo=true';
    }

    public function getMethodName(): string
    {
        return 'DEMO';
    }
}
