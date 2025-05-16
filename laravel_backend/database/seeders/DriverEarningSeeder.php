<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Delivery;
use App\Models\DriverEarning;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class DriverEarningSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();

        // Get all drivers
        $drivers = User::where('user_type', 'driver')->get();

        // Get all deliveries
        $deliveries = Delivery::all();

        foreach ($drivers as $driver) {
            // Generate random earnings for each driver
            foreach ($deliveries as $delivery) {
                DriverEarning::create([
                    'driver_id' => $driver->id,
                    'delivery_id' => $delivery->id,
                    'amount' => $faker->randomFloat(2, 50, 500), // Random amount between 50 and 500
                    'commission' => $faker->randomFloat(2, 5, 50), // Random commission between 5 and 50
                    'net_amount' => $faker->randomFloat(2, 10, 450), // Random net amount after commission
                    'status' => $faker->randomElement(['pending', 'completed', 'cancelled']),
                    'payout_date' => $faker->dateTimeBetween('-1 month', 'now'), // Random payout date in the last month
                    'payout_method' => $faker->randomElement(['bank_transfer', 'paypal', 'cash']),
                    'transaction_id' => $faker->uuid(),
                ]);
            }
        }
    }
}
