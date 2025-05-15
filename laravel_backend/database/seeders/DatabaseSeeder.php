<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Seed the Admin User (Check if it already exists)
        if (!User::where('email', 'admin@example.com')->exists()) {
            User::create([
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'phone' => '1234567890',
                'password' => Hash::make('Admin123!'),
                'user_type' => 'admin',
                'email_verified_at' => now(),
            ]);
        }

        // Seed the Client User (Check if it already exists)
        if (!User::where('email', 'client@example.com')->exists()) {
            User::create([
                'name' => 'Client User',
                'email' => 'client@example.com',
                'phone' => '1234567899',
                'password' => Hash::make('Admin123!'),
                'user_type' => 'client',
                'email_verified_at' => now(),
            ]);
        }

        // Seed the Driver User (Check if it already exists)
        if (!User::where('email', 'driver@example.com')->exists()) {
            User::create([
                'name' => 'Driver User',
                'email' => 'driver@example.com',
                'phone' => '1234567898',
                'password' => Hash::make('Admin123!'),
                'user_type' => 'driver',
                'email_verified_at' => now(),
            ]);
        }

        // Seed 3 Additional Clients (Check if they already exist)
        $clients = [
            ['name' => 'John Doe', 'email' => 'johndoe@gmail.com', 'phone' => '1234567891'],
            ['name' => 'Jane Smith', 'email' => 'janesmith@gmail.com', 'phone' => '1234567892'],
            ['name' => 'Michael Johnson', 'email' => 'michaeljohnson@gmail.com', 'phone' => '1234567893']
        ];

        foreach ($clients as $client) {
            if (!User::where('email', $client['email'])->exists()) {
                User::create([
                    'name' => $client['name'],
                    'email' => $client['email'],
                    'phone' => $client['phone'],
                    'password' => Hash::make('Admin123!'),
                    'user_type' => 'client',
                    'email_verified_at' => now(),
                ]);
            }
        }

        // Seed 3 Additional Drivers (Check if they already exist)
        $drivers = [
            ['name' => 'Ethan Brown', 'email' => 'ethanbrown@gmail.com', 'phone' => '1234567894'],
            ['name' => 'Olivia Davis', 'email' => 'oliviadavis@gmail.com', 'phone' => '1234567895'],
            ['name' => 'Liam Wilson', 'email' => 'liamwilson@gmail.com', 'phone' => '1234567896']
        ];

        foreach ($drivers as $driver) {
            if (!User::where('email', $driver['email'])->exists()) {
                User::create([
                    'name' => $driver['name'],
                    'email' => $driver['email'],
                    'phone' => $driver['phone'],
                    'password' => Hash::make('Admin123!'),
                    'user_type' => 'driver',
                    'email_verified_at' => now(),
                ]);
            }
        }
    }
}
