<?php

namespace App\Providers;

use App\Services\DemoPaymentService;
use App\Services\PaymentServiceInterface;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Binding PaymentService — ganti DemoPaymentService dengan
        // ProductionPaymentService saat payment gateway asli siap
        $this->app->bind(PaymentServiceInterface::class, DemoPaymentService::class);
    }

    public function boot(): void
    {
        //
    }
}
