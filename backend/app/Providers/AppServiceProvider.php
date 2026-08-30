<?php

namespace App\Providers;

use App\Services\DemoPaymentService;
use App\Services\InvoicePaymentService;
use App\Services\PaymentServiceInterface;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $isGatewayEnabled = filter_var(env('PAYMENT_GATEWAY_ENABLED', false), FILTER_VALIDATE_BOOLEAN);

        // Default untuk testing lokal: aktifkan mode demo.
        // Nyalakan gateway hanya saat nilai PAYMENT_GATEWAY_ENABLED=true di .env.
        $service = $isGatewayEnabled ? InvoicePaymentService::class : DemoPaymentService::class;

        $this->app->bind(PaymentServiceInterface::class, $service);
    }

    public function boot(): void
    {
        //
    }
}
