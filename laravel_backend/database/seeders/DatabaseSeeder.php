<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'phone' => '1234567890',
            'password' => Hash::make('Admin123!'),
            'user_type' => 'admin',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Client User',
            'email' => 'client@example.com',
            'phone' => '1234567899',
            'password' => Hash::make('Admin123!'),
            'user_type' => 'client',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Driver User',
            'email' => 'driver@example.com',
            'phone' => '1234567898',
            'password' => Hash::make('Admin123!'),
            'user_type' => 'driver',
            'email_verified_at' => now(),
        ]);
    }
}
