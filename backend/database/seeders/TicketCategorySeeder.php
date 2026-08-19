<?php

namespace Database\Seeders;

use App\Models\TicketCategory;
use Illuminate\Database\Seeder;

class TicketCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name'        => 'Siswa',
                'slug'        => 'siswa',
                'description' => 'Tiket khusus pelajar/mahasiswa. Harap tunjukkan kartu pelajar.',
                'price'       => 25000,
                'is_active'   => true,
            ],
            [
                'name'        => 'Umum',
                'slug'        => 'umum',
                'description' => 'Tiket reguler untuk masyarakat umum.',
                'price'       => 50000,
                'is_active'   => true,
            ],
            [
                'name'        => 'VIP',
                'slug'        => 'vip',
                'description' => 'Tiket VIP dengan akses area premium dan kursi prioritas.',
                'price'       => 100000,
                'is_active'   => true,
            ],
        ];

        foreach ($categories as $category) {
            TicketCategory::firstOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}
