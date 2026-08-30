<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasIndex('orders', 'orders_payment_status_created_at_index')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->index(['payment_status', 'created_at'], 'orders_payment_status_created_at_index');
            });
        }

        if (! Schema::hasIndex('orders', 'orders_created_at_index')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->index('created_at', 'orders_created_at_index');
            });
        }

        if (! Schema::hasIndex('order_items', 'order_items_ticket_category_id_index')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->index('ticket_category_id', 'order_items_ticket_category_id_index');
            });
        }

        if (! Schema::hasIndex('order_items', 'order_items_order_id_index')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->index('order_id', 'order_items_order_id_index');
            });
        }

        if (! Schema::hasIndex('tickets', 'tickets_ticket_category_id_index')) {
            Schema::table('tickets', function (Blueprint $table) {
                $table->index('ticket_category_id', 'tickets_ticket_category_id_index');
            });
        }

        if (! Schema::hasIndex('tickets', 'tickets_status_ticket_category_id_index')) {
            Schema::table('tickets', function (Blueprint $table) {
                $table->index(['status', 'ticket_category_id'], 'tickets_status_ticket_category_id_index');
            });
        }

        if (! Schema::hasIndex('attendances', 'attendances_status_index')) {
            Schema::table('attendances', function (Blueprint $table) {
                $table->index('status', 'attendances_status_index');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasIndex('orders', 'orders_payment_status_created_at_index')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropIndex('orders_payment_status_created_at_index');
            });
        }

        if (Schema::hasIndex('orders', 'orders_created_at_index')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropIndex('orders_created_at_index');
            });
        }

        if (Schema::hasIndex('order_items', 'order_items_ticket_category_id_index')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->dropIndex('order_items_ticket_category_id_index');
            });
        }

        if (Schema::hasIndex('order_items', 'order_items_order_id_index')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->dropIndex('order_items_order_id_index');
            });
        }

        if (Schema::hasIndex('tickets', 'tickets_ticket_category_id_index')) {
            Schema::table('tickets', function (Blueprint $table) {
                $table->dropIndex('tickets_ticket_category_id_index');
            });
        }

        if (Schema::hasIndex('tickets', 'tickets_status_ticket_category_id_index')) {
            Schema::table('tickets', function (Blueprint $table) {
                $table->dropIndex('tickets_status_ticket_category_id_index');
            });
        }

        if (Schema::hasIndex('attendances', 'attendances_status_index')) {
            Schema::table('attendances', function (Blueprint $table) {
                $table->dropIndex('attendances_status_index');
            });
        }
    }
};
