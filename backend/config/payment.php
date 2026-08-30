<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Payment Gateway Configuration
    |--------------------------------------------------------------------------
    |
    | Default mode dibuat lokal agar testing aman tanpa mengaktifkan gateway.
    | Aktifkan gateway hanya saat PAYMENT_GATEWAY_ENABLED=true di .env.
    |
    */

    'gateway_enabled' => env('PAYMENT_GATEWAY_ENABLED', false),
    'mode'            => env('PAYMENT_MODE', 'local'),

    'api_key'         => env('PAYMENT_API_KEY'),
    'secret_key'      => env('PAYMENT_SECRET_KEY'),
    'api_url'         => env('PAYMENT_API_URL', 'https://api.xendit.co'),

    // Token untuk verifikasi webhook dari Xendit
    // Set di dashboard Xendit: Settings > Callbacks > Verification Token
    'webhook_token'   => env('PAYMENT_WEBHOOK_TOKEN'),

    // URL redirect setelah pembayaran selesai (halaman frontend)
    'success_url'     => rtrim(env('FRONTEND_URL', 'http://localhost:5174'), '/') . '/payment-success',
    'failure_url'     => rtrim(env('FRONTEND_URL', 'http://localhost:5174'), '/') . '/',

];
