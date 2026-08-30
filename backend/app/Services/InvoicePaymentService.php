<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class InvoicePaymentService implements PaymentServiceInterface
{
    private string $apiKey;
    private string $apiUrl;

    public function __construct()
    {
        $this->apiKey = config('payment.secret_key');
        $this->apiUrl = rtrim(config('payment.api_url'), '/');
    }

    /**
     * Buat invoice ke payment gateway dan kembalikan paymentUrl.
     * Docs: POST /invoices
     * Auth: x-api-key header
     */
    public function createInvoice(Order $order): string
    {
        // Buat deskripsi dari item order, maks 100 karakter
        $order->loadMissing('orderItems');
        $productName = $order->orderItems->count() > 1
            ? 'Tiket Event - ' . $order->order_number
            : ($order->orderItems->first()->ticket_category_name ?? 'Tiket Event');

        $payload = [
            'productName'     => $productName,
            'amount'          => (int) $order->total_amount,
            'customerName'    => $order->customer_name,
            'customerContact' => $order->customer_phone,
            'externalId'      => $order->order_number,
        ];

        Log::info('Membuat invoice pembayaran', [
            'order_number' => $order->order_number,
            'amount'       => $payload['amount'],
            'endpoint'     => "{$this->apiUrl}/invoices",
        ]);

        $response = Http::withHeaders([
                'x-api-key' => $this->apiKey,
                'Accept'    => 'application/json',
            ])
            ->timeout(30)
            ->post("{$this->apiUrl}/invoices", $payload);

        if ($response->failed()) {
            Log::error('Gagal membuat invoice', [
                'order_number'  => $order->order_number,
                'http_status'   => $response->status(),
                'response_body' => $response->json() ?? $response->body(),
            ]);

            $apiMessage = $response->json('message')
                ?? $response->json('error')
                ?? 'Unknown error (HTTP ' . $response->status() . ')';

            throw new RuntimeException('Gagal membuat invoice: ' . $apiMessage);
        }

        $data = $response->json('data');

        if (empty($data['paymentUrl'])) {
            Log::error('Response invoice tidak memiliki paymentUrl', [
                'order_number' => $order->order_number,
                'response'     => $response->json(),
            ]);
            throw new RuntimeException('Response invoice tidak valid: paymentUrl tidak ditemukan.');
        }

        // Simpan invoiceCode ke order sebagai referensi untuk webhook matching
        $order->update([
            'payment_method' => $this->getMethodName(),
        ]);

        Log::info('Invoice berhasil dibuat', [
            'order_number' => $order->order_number,
            'invoice_code' => $data['invoiceCode'] ?? null,
            'payment_url'  => $data['paymentUrl'],
            'expired_at'   => $data['expiredAt'] ?? null,
        ]);

        return $data['paymentUrl'];
    }

    public function getMethodName(): string
    {
        return 'QRIS';
    }
}
