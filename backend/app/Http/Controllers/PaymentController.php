<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Order;
use App\Models\Ticket;
use App\Services\PaymentServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function __construct(
        private readonly PaymentServiceInterface $paymentService
    ) {}

    /*
    |--------------------------------------------------------------------------
    | POST /payment/checkout
    | Buat invoice dan kembalikan URL halaman pembayaran ke frontend.
    |--------------------------------------------------------------------------
    */
    public function checkout(Request $request): JsonResponse
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

        try {
            $invoiceUrl = $this->paymentService->createInvoice($order);
        } catch (\RuntimeException $e) {
            Log::error('Checkout gagal', [
                'order_number' => $order->order_number,
                'error'        => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Gagal membuat sesi pembayaran. Silakan coba lagi.',
            ], 500);
        }

        return response()->json([
            'message'     => 'Invoice berhasil dibuat.',
            'order_number' => $order->order_number,
            'invoice_url' => $invoiceUrl,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | POST /payment/webhook
    | Menerima notifikasi pembayaran dari payment gateway.
    | Endpoint ini TIDAK memerlukan auth Sanctum — diakses oleh server gateway.
    | Daftarkan URL ini di dashboard: Settings > Webhook URL
    |--------------------------------------------------------------------------
    */
    public function webhook(Request $request): JsonResponse
    {
        $payload = $request->all();

        Log::info('Webhook diterima', [
            'externalId'    => $payload['externalId'] ?? null,
            'paymentStatus' => $payload['paymentStatus'] ?? null,
            'invoiceCode'   => $payload['invoiceCode'] ?? null,
        ]);

        // Hanya proses jika status PAID
        if (($payload['paymentStatus'] ?? '') !== 'PAID') {
            return response()->json(['message' => 'Status diterima, tidak ada aksi.']);
        }

        $orderNumber = $payload['externalId'] ?? null;

        if (! $orderNumber) {
            Log::warning('Webhook: externalId kosong', ['payload' => $payload]);
            return response()->json(['message' => 'externalId kosong.'], 422);
        }

        $order = Order::where('order_number', $orderNumber)->first();

        if (! $order) {
            Log::warning('Webhook: order tidak ditemukan', ['order_number' => $orderNumber]);
            return response()->json(['message' => 'Order tidak ditemukan.'], 404);
        }

        // Idempotency: skip jika sudah PAID sebelumnya
        if ($order->isPaid()) {
            Log::info('Webhook: order sudah PAID, diabaikan', ['order_number' => $orderNumber]);
            return response()->json(['message' => 'Order sudah diproses.']);
        }

        // Update order dan generate tiket dalam 1 transaction
        DB::transaction(function () use ($order, $payload) {
            $order->update([
                'payment_status' => 'PAID',
                'payment_method' => strtoupper($payload['paymentMethod'] ?? $this->paymentService->getMethodName()),
                'paid_at'        => now(),
            ]);

            $this->generateTickets($order);
        });

        Log::info('Webhook: order berhasil diproses', ['order_number' => $orderNumber]);

        // Gateway butuh HTTP 200 dalam 10 detik
        return response()->json(['message' => 'OK']);
    }

    /*
    |--------------------------------------------------------------------------
    | GET /orders/{orderNumber}/payment-status
    | Polling status pembayaran dari frontend (fallback selain webhook).
    |--------------------------------------------------------------------------
    */
    public function status(Request $request, string $orderNumber): JsonResponse
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();

        return response()->json([
            'order_number'   => $order->order_number,
            'payment_status' => $order->payment_status,
            'payment_method' => $order->payment_method,
            'paid_at'        => $order->paid_at?->toISOString(),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Private helpers
    |--------------------------------------------------------------------------
    */
    private function generateTickets(Order $order): void
    {
        $order->load('orderItems');

        foreach ($order->orderItems as $item) {
            for ($i = 0; $i < $item->quantity; $i++) {
                $ticketUuid = $this->generateUniqueTicketUuid();

                $ticket = Ticket::create([
                    'order_id'           => $order->id,
                    'ticket_category_id' => $item->ticket_category_id,
                    'ticket_uuid'        => $ticketUuid,
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
    }

    private function generateUniqueTicketUuid(): string
    {
        do {
            $uuid = 'TKT-' . strtoupper(Str::random(6));
        } while (Ticket::where('ticket_uuid', $uuid)->exists());

        return $uuid;
    }
}
