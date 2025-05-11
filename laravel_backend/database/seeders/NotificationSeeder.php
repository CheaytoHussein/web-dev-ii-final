<?php

namespace Database\Seeders;
namespace Database\Seeders;

use App\Models\User;
use App\Models\Notification;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();

        // Get all users
        $users = User::all();

        // Generate random notifications for each user
        foreach ($users as $user) {
            // Randomly generate a number of notifications for each user
            for ($i = 0; $i < rand(1, 5); $i++) {
                // Generate a random notification title and message in Lebanese English context
                $notificationType = $faker->randomElement(['system', 'delivery', 'payment', 'reminder']);
                $title = '';
                $message = '';

                switch ($notificationType) {
                    case 'system':
                        $title = 'System Alert';
                        $message = 'El system it updated successfully, please check your notifications for more details.';
                        break;
                    case 'delivery':
                        $title = 'Delivery Status Update';
                        $message = 'Your delivery is now accepted by the driver. It will reach you soon. Yalla, wait for it!';
                        break;
                    case 'payment':
                        $title = 'Payment Notification';
                        $message = 'Your payment was received successfully. Thank you for your payment. Transaction ID: ' . $faker->uuid;
                        break;
                    case 'reminder':
                        $title = 'Reminder';
                        $message = 'Don’t forget, you need to renew your subscription for the service ASAP. Baddak tezid it now!';
                        break;
                }

                // Create the notification for the user
                Notification::create([
                    'user_id' => $user->id,
                    'title' => $title,
                    'message' => $message,
                    'is_read' => $faker->boolean(),
                    'type' => $notificationType,
                    'reference_id' => $faker->randomDigitNotNull(),
                ]);
            }
        }
    }
}
