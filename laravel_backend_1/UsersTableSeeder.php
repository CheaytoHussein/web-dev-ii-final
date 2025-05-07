<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\ClientProfile;
use App\Models\DriverProfile;
use Illuminate\Support\Facades\Hash;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'phone' => '1234567890',
            'password' => Hash::make('Admin123!'),
            'user_type' => 'admin',
            'email_verified_at' => now(),
        ]);

        // Create client user
        $client = User::create([
            'name' => 'Test Client',
            'email' => 'client@example.com',
            'phone' => '1234567891',
            'password' => Hash::make('Client123!'),
            'user_type' => 'client',
            'email_verified_at' => now(),
        ]);
        
        // Create client profile
        ClientProfile::create([
            'user_id' => $client->id,
            'company_name' => 'Test Company',
        ]);

        // Create driver user
        $driver = User::create([
            'name' => 'Test Driver',
            'email' => 'driver@example.com',
            'phone' => '1234567892',
            'password' => Hash::make('Driver123!'),
            'user_type' => 'driver',
            'email_verified_at' => now(),
        ]);
        
        // Create driver profile
        DriverProfile::create([
            'user_id' => $driver->id,
            'is_available' => true,
            'is_verified' => true,
        ]);
    }
}