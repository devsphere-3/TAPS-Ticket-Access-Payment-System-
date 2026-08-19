<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('ticket_category_id')->constrained('ticket_categories')->restrictOnDelete();
            $table->string('ticket_uuid')->unique();
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('category_name'); // snapshot nama kategori
            $table->string('status')->default('UNUSED'); // UNUSED, USED, CANCELLED
            $table->timestamp('used_at')->nullable();
            $table->timestamps();

            $table->index('ticket_uuid');
            $table->index('order_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
