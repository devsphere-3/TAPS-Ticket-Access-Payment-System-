<?php

namespace App\Services;

use App\Models\Order;

class DemoPaymentService implements PaymentServiceInterface
{
    /**
     * Demo payment: langsung berhasil tanpa gateway asli.
     * Pada production, ganti dengan implementasi payment gateway.
     */
    public function pay(Order $order): bool
    {
        // Demo selalu berhasil
        return true;
    }

    public function getMethodName(): string
    {
        return 'DEMO';
    }
}
