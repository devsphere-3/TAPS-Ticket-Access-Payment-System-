<?php

namespace App\Http\Controllers;

use App\Models\TicketCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TicketCategoryController extends Controller
{
    // Public: ambil kategori aktif
    public function index(): JsonResponse
    {
        $categories = TicketCategory::where('is_active', true)
            ->orderBy('price')
            ->get(['id', 'name', 'slug', 'description', 'price']);

        return response()->json($categories);
    }

    // Admin: ambil semua kategori
    public function adminIndex(): JsonResponse
    {
        $categories = TicketCategory::orderBy('created_at')->get();

        return response()->json($categories);
    }

    // Admin: buat kategori baru
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|min:2|max:100',
            'description' => 'nullable|string|max:500',
            'price'       => 'required|integer|min:0',
            'is_active'   => 'boolean',
        ]);

        $data['slug'] = Str::slug($data['name']) . '-' . Str::random(4);

        $category = TicketCategory::create($data);

        return response()->json($category, 201);
    }

    // Admin: update kategori
    public function update(Request $request, TicketCategory $ticketCategory): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'sometimes|string|min:2|max:100',
            'description' => 'nullable|string|max:500',
            'price'       => 'sometimes|integer|min:0',
            'is_active'   => 'sometimes|boolean',
        ]);

        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']) . '-' . Str::random(4);
        }

        $ticketCategory->update($data);

        return response()->json($ticketCategory);
    }

    // Admin: toggle status aktif
    public function toggleStatus(TicketCategory $ticketCategory): JsonResponse
    {
        $ticketCategory->update(['is_active' => ! $ticketCategory->is_active]);

        return response()->json([
            'message'   => 'Status berhasil diubah.',
            'is_active' => $ticketCategory->is_active,
        ]);
    }
}
