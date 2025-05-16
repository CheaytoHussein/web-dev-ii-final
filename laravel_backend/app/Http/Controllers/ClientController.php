<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Delivery;
use App\Models\DeliveryStatus;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ClientController extends Controller
{

    public function getDashboard(Request $request)
    {
        $user = $request->user();

        if (!$user->isClient()) {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        // Get delivery statistics
        $activeDeliveries = $user->clientDeliveries()
            ->whereIn('status', ['pending', 'accepted', 'picked_up', 'in_transit'])
            ->count();

        $completedDeliveries = $user->clientDeliveries()
            ->where('status', 'delivered')
            ->count();

        $pendingDeliveries = $user->clientDeliveries()
            ->where('status', 'pending')
            ->count();

        // Get recent deliveries
        $recentDeliveries = $user->clientDeliveries()
            ->with('driver')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get nearby drivers
        $nearbyDriversCount = User::where('user_type', 'driver')
            ->whereHas('driverProfile', function($query) {
                $query->where('is_available', true)
                    ->where('is_verified', true);
            })
            ->count();

        return response()->json([
            'active_deliveries' => $activeDeliveries,
            'completed_deliveries' => $completedDeliveries,
            'pending_deliveries' => $pendingDeliveries,
            'recent_deliveries' => $recentDeliveries,
            'nearby_drivers' => $nearbyDriversCount,
        ]);
    }

    /**
     * Get all client deliveries
     */
    /**
     * Get all client deliveries
     */
    public function getDeliveries(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user || !$user->isClient()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 403);
            }

            $deliveries = $user->clientDeliveries()
                ->with(['driver' => function($query) {
                    $query->select('id', 'name');
                }])
                ->orderBy('created_at', 'desc')
                ->get([
                    'id',
                    'tracking_number',
                    'pickup_address',
                    'delivery_address',
                    'recipient_name',
                    'status',
                    'created_at',
                    'price',
                    'package_size',
                    'package_weight',
                    'delivery_date',
                    'delivery_time',
                    'driver_id'
                ]);

            return response()->json([
                'success' => true,
                'deliveries' => $deliveries->map(function ($delivery) {
                    return [
                        'id' => $delivery->id,
                        'tracking_number' => $delivery->tracking_number,
                        'pickup_address' => $delivery->pickup_address,
                        'delivery_address' => $delivery->delivery_address,
                        'recipient_name' => $delivery->recipient_name,
                        'status' => $delivery->status,
                        'created_at' => $delivery->created_at->toISOString(),
                        'price' => (float)$delivery->price,
                        'package_size' => $delivery->package_size,
                        'package_weight' => (float)$delivery->package_weight,
                        'delivery_date' => $delivery->delivery_date ? Carbon::parse($delivery->delivery_date)->toISOString() : null,
                        'delivery_time' => $delivery->delivery_time,
                        'driver_id' => $delivery->driver_id,
                        'driver' => $delivery->driver ? [
                            'id' => $delivery->driver->id,
                            'name' => $delivery->driver->name
                        ] : null
                    ];
                })
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get specific delivery details
     */
    /**
     * Get specific delivery details
     */
    public function getDelivery(Request $request, $id)
    {
        try {
            $user = $request->user();

            if (!$user || !$user->isClient()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 403);
            }

            $delivery = $user->clientDeliveries()
                ->with([
                    'driver' => function($query) {
                        $query->select('id', 'name');
                    },
                    'statusHistory' => function($query) {
                        $query->orderBy('created_at', 'desc')
                            ->select('id', 'delivery_id', 'status', 'location', 'notes', 'created_at');
                    }
                ])
                ->find($id);

            if (!$delivery) {
                return response()->json([
                    'success' => false,
                    'message' => 'Delivery not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'delivery' => [
                    'id' => $delivery->id,
                    'tracking_number' => $delivery->tracking_number,
                    'pickup_address' => $delivery->pickup_address,
                    'pickup_contact' => $delivery->pickup_contact,
                    'pickup_phone' => $delivery->pickup_phone,
                    'delivery_address' => $delivery->delivery_address,
                    'recipient_name' => $delivery->recipient_name,
                    'recipient_phone' => $delivery->recipient_phone,
                    'package_size' => $delivery->package_size,
                    'package_weight' => (float)$delivery->package_weight,
                    'package_description' => $delivery->package_description,
                    'is_fragile' => (bool)$delivery->is_fragile,
                    'delivery_type' => $delivery->delivery_type,
                    'delivery_date' => $delivery->delivery_date ? Carbon::parse($delivery->delivery_date)->toISOString() : null,
                    'delivery_time' => $delivery->delivery_time,
                    'delivery_instructions' => $delivery->delivery_instructions,
                    'price' => (float)$delivery->price,
                    'status' => $delivery->status,
                    'payment_status' => $delivery->payment_status,
                    'created_at' => $delivery->created_at->toISOString(),
                    'driver_id' => $delivery->driver_id,
                    'driver' => $delivery->driver ? [
                        'id' => $delivery->driver->id,
                        'name' => $delivery->driver->name
                    ] : null,
                    'status_history' => $delivery->statusHistory->map(function ($status) {
                        return [
                            'id' => $status->id,
                            'status' => $status->status,
                            'location' => $status->location,
                            'notes' => $status->notes,
                            'created_at' => $status->created_at->toISOString()
                        ];
                    })
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new delivery
     */
    public function createDelivery(Request $request)
    {
        $user = $request->user();

        if (!$user->isClient()) {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        $validator = Validator::make($request->all(), [
            'pickup_address' => 'required|string',
            'pickup_contact' => 'required|string',
            'pickup_phone' => 'required|string',
            'delivery_address' => 'required|string',
            'recipient_name' => 'required|string',
            'recipient_phone' => 'required|string',
            'package_size' => 'required|in:small,medium,large,extra_large',
            'package_weight' => 'required|numeric',
            'delivery_type' => 'required|in:standard,express,economy',
            'price' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        // Create delivery
        $delivery = new Delivery([
            'client_id' => $user->id,
            'tracking_number' => Delivery::generateTrackingNumber(),
            'pickup_address' => $request->pickup_address,
            'pickup_contact' => $request->pickup_contact,
            'pickup_phone' => $request->pickup_phone,
            'delivery_address' => $request->delivery_address,
            'recipient_name' => $request->recipient_name,
            'recipient_phone' => $request->recipient_phone,
            'package_size' => $request->package_size,
            'package_weight' => $request->package_weight,
            'package_description' => $request->package_description ?? null,
            'is_fragile' => $request->is_fragile ?? false,
            'delivery_type' => $request->delivery_type,
            'delivery_date' => $request->delivery_date ?? null,
            'delivery_time' => $request->delivery_time ?? null,
            'delivery_instructions' => $request->delivery_instructions ?? null,
            'price' => $request->price,
            'status' => 'pending',
            'payment_status' => 'pending',
        ]);

        // Assign driver if provided
        if ($request->driver_id) {
            $driver = User::where('id', $request->driver_id)
                ->where('user_type', 'driver')
                ->first();

            if ($driver) {
                $delivery->driver_id = $driver->id;
            }
        }

        $delivery->save();

        // Create initial status
        DeliveryStatus::create([
            'delivery_id' => $delivery->id,
            'status' => 'pending',
            'location' => $request->pickup_address,
            'notes' => 'Delivery created',
        ]);

        // Notify driver if assigned
        if ($delivery->driver_id) {
            Notification::create([
                'user_id' => $delivery->driver_id,
                'title' => 'New Delivery Assigned',
                'message' => "You have been assigned to a new delivery: {$delivery->tracking_number}",
                'type' => 'delivery_assigned',
                'reference_id' => (string)$delivery->id,
            ]);

            // In a real application, you would also send a push notification
            // using the driver's device_token
        }

        return response()->json([
            'message' => 'Delivery created successfully',
            'id' => $delivery->id,
            'tracking_number' => $delivery->tracking_number,
        ], 201);
    }

    /**
     * Cancel delivery
     */
    public function cancelDelivery(Request $request, $id)
    {
        $user = $request->user();

        if (!$user->isClient()) {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        $delivery = $user->clientDeliveries()->find($id);

        if (!$delivery) {
            return response()->json(['message' => 'Delivery not found'], 404);
        }

        // Check if the delivery can be cancelled
        if (!in_array($delivery->status, ['pending', 'accepted'])) {
            return response()->json([
                'message' => 'Delivery cannot be cancelled at this stage'
            ], 400);
        }

        // Update delivery status
        $delivery->status = 'cancelled';
        $delivery->save();

        // Add status history
        DeliveryStatus::create([
            'delivery_id' => $delivery->id,
            'status' => 'cancelled',
            'location' => 'N/A',
            'notes' => 'Cancelled by client',
        ]);

        // Notify driver if assigned
        if ($delivery->driver_id) {
            Notification::create([
                'user_id' => $delivery->driver_id,
                'title' => 'Delivery Cancelled',
                'message' => "Delivery {$delivery->tracking_number} has been cancelled by the client",
                'type' => 'delivery_cancelled',
                'reference_id' => (string)$delivery->id,
            ]);

            // In a real application, you would also send a push notification
        }

        return response()->json([
            'message' => 'Delivery cancelled successfully'
        ]);
    }

    /**
     * Get client notifications
     */
    public function getNotifications(Request $request)
    {
        $user = $request->user();

        $notifications = $user->notifications()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'notifications' => $notifications
        ]);
    }

}
