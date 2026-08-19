<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Akun demo
        User::updateOrCreate(
            ['username' => 'admin'],
            [
                'name'     => 'Admin Demo',
                'username' => 'admin',
                'email'    => 'admin@demo.test',
                'password' => Hash::make('password'),
                'role'     => 'admin',
            ]
        );

        // Akun MASTER
        User::updateOrCreate(
            ['username' => 'MASTER'],
            [
                'name'     => 'MASTER',
                'username' => 'MASTER',
                'email'    => 'master@system.local',
                'password' => Hash::make('Master123'),
                'role'     => 'admin',
            ]
        );
    }
}
