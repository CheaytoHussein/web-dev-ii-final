<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Delivery;
use App\Models\User;
use Illuminate\Support\Str;

class DeliverySeeder extends Seeder
{
    public function run(): void
    {
        // Fetch all clients and drivers from the database
        $clients = User::where('user_type', 'client')->get();
        $drivers = User::where('user_type', 'driver')->get();

        if ($clients->isEmpty() || $drivers->isEmpty()) {
            $this->command->warn('No clients or drivers found. Make sure they are seeded first.');
            return;
        }

        // Create first Lebanese delivery
        Delivery::create([
            'tracking_number' => strtoupper(Str::random(10)),
            'client_id' => $clients->first()->id, // Assign first client
            'driver_id' => $drivers->first()->id, // Assign first driver
            'pickup_address' => 'Gemayzeh, Beirut, Lebanon',
            'pickup_contact' => 'Ali Rami',
            'pickup_phone' => '0323456789',
            'pickup_latitude' => 33.8967,
            'pickup_longitude' => 35.5116,
            'delivery_address' => 'Achrafieh, Beirut, Lebanon',
            'recipient_name' => 'Maya Hassan',
            'recipient_phone' => '0398765432',
            'delivery_latitude' => 33.8993,
            'delivery_longitude' => 35.5353,
            'package_size' => 'medium',
            'package_weight' => 3.0,
            'package_description' => 'Electronics and gadgets',
            'is_fragile' => true,
            'delivery_type' => 'express',
            'delivery_date' => now()->addDays(2)->toDateString(),
            'delivery_time' => '10:00:00',
            'delivery_instructions' => 'Please call on arrival.',
            'status' => 'pending',
            'price' => 75.50,
            'payment_status' => 'paid',
            'payment_method' => 'credit_card',
            'payment_transaction_id' => Str::uuid(),
        ]);

        // Create second Lebanese delivery
        Delivery::create([
            'tracking_number' => strtoupper(Str::random(10)),
            'client_id' => $clients->last()->id, // Assign last client
            'driver_id' => $drivers->last()->id, // Assign last driver
            'pickup_address' => 'Tripoli, Lebanon',
            'pickup_contact' => 'Rami Zain',
            'pickup_phone' => '0392345678',
            'pickup_latitude' => 34.4383,
            'pickup_longitude' => 35.8447,
            'delivery_address' => 'Zahle, Lebanon',
            'recipient_name' => 'Samiya Khoury',
            'recipient_phone' => '0396543210',
            'delivery_latitude' => 33.8404,
            'delivery_longitude' => 36.2136,
            'package_size' => 'large',
            'package_weight' => 5.5,
            'package_description' => 'Furniture and home appliances',
            'is_fragile' => false,
            'delivery_type' => 'standard',
            'delivery_date' => now()->addDays(5)->toDateString(),
            'delivery_time' => '15:00:00',
            'delivery_instructions' => 'Leave at the back door.',
            'status' => 'in_transit',
            'price' => 120.00,
            'payment_status' => 'pending',
            'payment_method' => 'cash_on_delivery',
            'payment_transaction_id' => Str::uuid(),
        ]);
    }
}
