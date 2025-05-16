<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\DriverProfile;

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

        // First Lebanese driver
        $driver1 = User::create([
            'name' => 'Ahmad',
            'email' => 'driver1@example.com',
            'phone' => '0312345678',
            'password' => Hash::make('Admin123!'),
            'user_type' => 'driver',
            'email_verified_at' => now(),
        ]);

        DriverProfile::create([
            'user_id' => $driver1->id,
            'address' => 'Beirut, Lebanon',
            'vehicle_type' => 'car',
            'vehicle_model' => 'Peugeot 208',
            'vehicle_color' => 'Red',
            'vehicle_plate_number' => 'B1234567',
            'driver_license' => 'LBN9876543',
            'profile_picture' => 'default.jpg',
            'rating' => 4.9,
            'is_verified' => true,
            'is_available' => true,
            'latitude' => 33.8888,
            'longitude' => 35.4941,
            'last_location_update' => now(),
        ]);

        // Second Lebanese driver
        $driver2 = User::create([
            'name' => 'Ali',
            'email' => 'driver2@example.com',
            'phone' => '0323456789', // Another mock Lebanese phone number
            'password' => Hash::make('Admin123!'),
            'user_type' => 'driver',
            'email_verified_at' => now(),
        ]);

        DriverProfile::create([
            'user_id' => $driver2->id,
            'address' => 'Tripoli, Lebanon', // Another address in Lebanon
            'vehicle_type' => 'motorbike',
            'vehicle_model' => 'Honda CBR',
            'vehicle_color' => 'Black',
            'vehicle_plate_number' => 'T5678901',
            'driver_license' => 'LBN1122334',
            'profile_picture' => 'default.jpg',
            'rating' => 4.7, // Example rating
            'is_verified' => false,
            'is_available' => false,
            'latitude' => 34.4383, // Coordinates for Tripoli, Lebanon
            'longitude' => 35.8447,
            'last_location_update' => now(),
        ]);
        // Third Lebanese driver
        $driver3 = User::create([
            'name' => 'Khaled',
            'email' => 'driver3@example.com',
            'phone' => '0398765432',
            'password' => Hash::make('Admin123!'),
            'user_type' => 'driver',
            'email_verified_at' => now(),
        ]);

        DriverProfile::create([
            'user_id' => $driver3->id,
            'address' => 'Sidon, Lebanon',
            'vehicle_type' => 'van',
            'vehicle_model' => 'Ford Transit',
            'vehicle_color' => 'White',
            'vehicle_plate_number' => 'S1122334',
            'driver_license' => 'LBN5566778',
            'profile_picture' => 'default.jpg',
            'rating' => 4.8,
            'is_verified' => true, // This one can be unverified initially
            'is_available' => true,
            'latitude' => 33.5606, // Sidon coordinates
            'longitude' => 35.3758,
            'last_location_update' => now(),
        ]);


        $this->call([
            DeliverySeeder::class,
            DeliveryStatusSeeder::class,
            PaymentSeeder::class,
            NotificationSeeder::class,
            DriverEarningSeeder::class,
        ]);
    }
}

