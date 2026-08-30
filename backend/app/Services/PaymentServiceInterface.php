<?php

namespace App\Services;

use App\Models\Order;

interface PaymentServiceInterface
{
    /**
     * Buat invoice/transaksi pembayaran untuk order tertentu.
     * Mengembalikan URL redirect ke halaman pembayaran.
     */
    public function createInvoice(Order $order): string;

    /**
     * Nama metode pembayaran yang digunakan.
     */
    public function getMethodName(): string;
}
