<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\TicketCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    // Public: buat order baru
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'customer_name'      => 'required|string|min:3|max:255',
            'customer_phone'     => ['required', 'string', 'regex:/^(\+62|0)[0-9]{8,14}$/'],
            'ticket_category_id' => 'required|integer|exists:ticket_categories,id',
            'quantity'           => 'required|integer|min:1|max:10',
        ]);

        // Ambil harga dari database — jangan percaya harga dari frontend
        $category = TicketCategory::where('id', $data['ticket_category_id'])
            ->where('is_active', true)
            ->firstOrFail();

        $unitPrice   = $category->price;
        $quantity    = $data['quantity'];
        $subtotal    = $unitPrice * $quantity;
        $orderNumber = $this->generateOrderNumber();

        $order = DB::transaction(function () use ($data, $category, $unitPrice, $quantity, $subtotal, $orderNumber) {
            $order = Order::create([
                'order_number'   => $orderNumber,
                'customer_name'  => $data['customer_name'],
                'customer_phone' => $data['customer_phone'],
                'total_amount'   => $subtotal,
                'payment_status' => 'UNPAID',
            ]);

            OrderItem::create([
                'order_id'              => $order->id,
                'ticket_category_id'    => $category->id,
                'ticket_category_name'  => $category->name, // snapshot
                'unit_price'            => $unitPrice,       // snapshot
                'quantity'              => $quantity,
                'subtotal'              => $subtotal,
            ]);

            return $order;
        });

        return response()->json([
            'order_number'   => $order->order_number,
            'customer_name'  => $order->customer_name,
            'customer_phone' => $order->customer_phone,
            'category'       => $category->name,
            'quantity'       => $quantity,
            'unit_price'     => $unitPrice,
            'total_amount'   => $subtotal,
            'payment_status' => $order->payment_status,
        ], 201);
    }

    // Public: detail order by order number
    public function show(string $orderNumber): JsonResponse
    {
        $order = Order::select([
                'id',
                'order_number',
                'customer_name',
                'customer_phone',
                'total_amount',
                'payment_status',
                'paid_at',
                'created_at',
            ])
            ->with(['orderItems' => function ($query) {
                $query->select(['id', 'order_id', 'ticket_category_name', 'unit_price', 'quantity', 'subtotal']);
            }])
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        return response()->json([
            'order_number'   => $order->order_number,
            'customer_name'  => $order->customer_name,
            'customer_phone' => $order->customer_phone,
            'total_amount'   => $order->total_amount,
            'payment_status' => $order->payment_status,
            'paid_at'        => $order->paid_at,
            'items'          => $order->orderItems->map(fn($item) => [
                'category_name' => $item->ticket_category_name,
                'unit_price'    => $item->unit_price,
                'quantity'      => $item->quantity,
                'subtotal'      => $item->subtotal,
            ]),
        ]);
    }

    // Admin: daftar semua order
    public function adminIndex(Request $request): JsonResponse
    {
        $query = Order::select([
                'id',
                'order_number',
                'customer_name',
                'customer_phone',
                'total_amount',
                'payment_status',
                'paid_at',
                'created_at',
            ])
            ->with(['orderItems' => function ($query) {
                $query->select(['id', 'order_id', 'ticket_category_name', 'unit_price', 'quantity', 'subtotal']);
            }])
            ->orderByDesc('created_at');

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'ilike', "%{$search}%")
                  ->orWhere('customer_name', 'ilike', "%{$search}%")
                  ->orWhere('customer_phone', 'ilike', "%{$search}%");
            });
        }

        $orders = $query->paginate(20);

        return response()->json($orders);
    }

    private function generateOrderNumber(): string
    {
        $date     = now()->format('Ymd');
        $sequence = str_pad(Order::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);

        return "ORD-{$date}-{$sequence}";
    }
}
