<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['tickets.attendance', 'orderItems'])
            ->orderByDesc('created_at');

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->filled('category_id')) {
            $query->whereHas('orderItems', function ($q) use ($request) {
                $q->where('ticket_category_id', $request->category_id);
            });
        }

        if ($request->filled('attendance')) {
            $attendanceStatus = $request->attendance === 'present' ? 'PRESENT' : 'NOT_PRESENT';
            $query->whereHas('tickets.attendance', function ($q) use ($attendanceStatus) {
                $q->where('status', $attendanceStatus);
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'ilike', "%{$search}%")
                  ->orWhere('customer_phone', 'ilike', "%{$search}%")
                  ->orWhere('order_number', 'ilike', "%{$search}%")
                  ->orWhereHas('tickets', function ($tq) use ($search) {
                      $tq->where('ticket_uuid', 'ilike', "%{$search}%");
                  });
            });
        }

        $orders = $query->paginate(20);

        $data = $orders->getCollection()->map(function ($order) {
            $firstItem   = $order->orderItems->first();
            $firstTicket = $order->tickets->first();

            return [
                'order_number'   => $order->order_number,
                'customer_name'  => $order->customer_name,
                'customer_phone' => $order->customer_phone,
                'category'       => $firstItem?->ticket_category_name,
                'quantity'       => $order->orderItems->sum('quantity'),
                'total_amount'   => $order->total_amount,
                'payment_status' => $order->payment_status,
                'paid_at'        => $order->paid_at,
                'attendance'     => $firstTicket?->attendance?->status ?? 'NOT_PRESENT',
                'checked_in_at'  => $firstTicket?->attendance?->checked_in_at,
                'ticket_uuid'    => $firstTicket?->ticket_uuid,
                // Semua ticket UUIDs untuk kirim WA jika lebih dari 1 tiket
                'all_ticket_uuids' => $order->tickets->pluck('ticket_uuid'),
                'created_at'     => $order->created_at,
            ];
        });

        return response()->json([
            'data'         => $data,
            'current_page' => $orders->currentPage(),
            'last_page'    => $orders->lastPage(),
            'per_page'     => $orders->perPage(),
            'total'        => $orders->total(),
        ]);
    }

    // Hapus order beserta semua tiket dan attendance-nya
    public function destroy(string $orderNumber): JsonResponse
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();

        DB::transaction(function () use ($order) {
            // Cascade delete sudah di-setup di migration:
            // orders → order_items (cascadeOnDelete)
            // orders → tickets (cascadeOnDelete)
            // tickets → attendances (cascadeOnDelete)
            $order->delete();
        });

        return response()->json(['message' => 'Customer berhasil dihapus.']);
    }
}
