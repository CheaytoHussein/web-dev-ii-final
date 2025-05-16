<?php

namespace Database\Seeders;

use App\Models\Delivery;
use App\Models\DeliveryStatus; // Ensure to import the model
use Illuminate\Database\Seeder;

class DeliveryStatusSeeder extends Seeder
{
    public function run(): void
    {
        // Sample deliveries to associate statuses with
        $deliveries = Delivery::all(); // Or you can create sample deliveries here if needed

        foreach ($deliveries as $delivery) {
            // Randomly assigning status
            $statuses = ['pending', 'accepted', 'picked_up', 'in_transit', 'delivered', 'cancelled'];
            $status = $statuses[array_rand($statuses)];

            DeliveryStatus::create([
                'delivery_id' => $delivery->id,
                'status' => $status,
                'location' => $this->getRandomLocation(),
                'latitude' => $this->getRandomLatitude(),
                'longitude' => $this->getRandomLongitude(),
                'notes' => 'Status updated by system.',
            ]);
        }
    }

    // Helper functions to generate random data
    private function getRandomLocation(): string
    {
        $locations = ['Beirut', 'Tripoli', 'Zahle', 'Jounieh', 'Tyre']; // Lebanese cities
        return $locations[array_rand($locations)];
    }

    private function getRandomLatitude(): float
    {
        return rand(-9000000, 9000000) / 100000; // Random latitude between -90 and 90
    }

    private function getRandomLongitude(): float
    {
        return rand(-18000000, 18000000) / 100000; // Random longitude between -180 and 180
    }
}
