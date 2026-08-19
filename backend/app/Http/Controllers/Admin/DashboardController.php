<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Order;
use App\Models\Ticket;
use App\Models\TicketCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        // Aggregate queries — tidak mengambil seluruh tabel
        $totalTickets  = Ticket::count();
        $totalSold     = Ticket::where('status', '!=', 'CANCELLED')->count();
        $totalPresent  = Attendance::where('status', 'PRESENT')->count();
        $totalAbsent   = Attendance::where('status', 'NOT_PRESENT')->count();
        $totalCustomers = Order::where('payment_status', 'PAID')->count();

        // Statistik per kategori
        $categoryStats = TicketCategory::select('ticket_categories.id', 'ticket_categories.name')
            ->selectRaw('COUNT(tickets.id) as total')
            ->leftJoin('tickets', 'ticket_categories.id', '=', 'tickets.ticket_category_id')
            ->groupBy('ticket_categories.id', 'ticket_categories.name')
            ->orderBy('ticket_categories.name')
            ->get();

        return response()->json([
            'total_customers' => $totalCustomers,
            'total_tickets'   => $totalTickets,
            'total_sold'      => $totalSold,
            'total_present'   => $totalPresent,
            'total_absent'    => $totalAbsent,
            'category_stats'  => $categoryStats,
        ]);
    }
}
