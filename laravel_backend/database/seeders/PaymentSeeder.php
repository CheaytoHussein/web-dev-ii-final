<?php

namespace Database\Seeders;

use App\Models\Delivery;
use App\Models\User;
use App\Models\Payment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        // Get all deliveries and users
        $deliveries = Delivery::all();
        $users = User::where('user_type', 'client')->get(); // Assuming clients make payments

        // Loop through deliveries and create random payments for them
        foreach ($deliveries as $delivery) {
            // Randomly pick a client for the payment
            $user = $users->random();

            // Generate random payment data
            $amount = rand(500, 5000) / 100; // Random amount between 5.00 and 50.00
            $payment_method = ['credit_card', 'paypal', 'bank_transfer'][rand(0, 2)];
            $status = ['pending', 'completed', 'failed', 'refunded'][rand(0, 3)];

            // Create a payment record
            Payment::create([
                'delivery_id' => $delivery->id,
                'user_id' => $user->id,
                'amount' => $amount,
                'payment_method' => $payment_method,
                'transaction_id' => Str::random(10), // Random transaction ID
                'status' => $status,
                'payment_details' => $this->generateRandomPaymentDetails(),
            ]);
        }
    }

    // Helper function to generate random payment details
    private function generateRandomPaymentDetails(): string
    {
        $details = [
            'Payment processed successfully.',
            'Payment failed due to insufficient funds.',
            'Refund issued for the order.',
            'Payment completed via PayPal.',
        ];

        return $details[array_rand($details)];
    }
}
