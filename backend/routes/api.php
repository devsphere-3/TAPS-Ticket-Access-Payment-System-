<?php

use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ScannerController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\TicketCategoryController;
use App\Http\Controllers\TicketController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes — tidak butuh auth
|--------------------------------------------------------------------------
*/

// Kategori tiket aktif
Route::get('/ticket-categories', [TicketCategoryController::class, 'index']);

// Order
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);

// Demo Payment
Route::post('/payment/demo', [PaymentController::class, 'demo']);

// Ticket detail
Route::get('/tickets/{ticketUuid}', [TicketController::class, 'show']);

/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
*/

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
});

/*
|--------------------------------------------------------------------------
| Admin Routes — butuh auth + role admin
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Customers
    Route::get('/customers', [CustomerController::class, 'index']);
    Route::delete('/customers/{orderNumber}', [CustomerController::class, 'destroy']);

    // Orders
    Route::get('/orders', [OrderController::class, 'adminIndex']);

    // Ticket Categories management
    Route::get('/ticket-categories', [TicketCategoryController::class, 'adminIndex']);
    Route::post('/ticket-categories', [TicketCategoryController::class, 'store']);
    Route::put('/ticket-categories/{ticketCategory}', [TicketCategoryController::class, 'update']);
    Route::patch('/ticket-categories/{ticketCategory}/status', [TicketCategoryController::class, 'toggleStatus']);

    // Scanner / Check-in
    Route::post('/tickets/scan', [ScannerController::class, 'scan']);
});
