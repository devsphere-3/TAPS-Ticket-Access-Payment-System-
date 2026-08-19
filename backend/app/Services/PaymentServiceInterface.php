<?php

namespace App\Services;

use App\Models\Order;

interface PaymentServiceInterface
{
    /**
     * Proses pembayaran untuk order tertentu.
     * Mengembalikan true jika berhasil.
     */
    public function pay(Order $order): bool;

    /**
     * Nama metode pembayaran yang digunakan.
     */
    public function getMethodName(): string;
}
