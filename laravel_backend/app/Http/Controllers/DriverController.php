<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Delivery;
use App\Models\DriverProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\ModelNotFoundException;
class DriverController extends Controller
{
    /**
     * Get driver dashboard data
     */
    public function getDashboard()
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            if (!$user->isDriver()) {
                return response()->json(['message' => 'Unauthorized - User is not a driver'], 403);
            }

            $driverProfile = $user->driverProfile;
            if (!$driverProfile) {
                return response()->json(['message' => 'Driver profile not found'], 404);
            }

            $completedDeliveries = $user->driverDeliveries()->where('status', 'delivered')->count();
            $activeDeliveries = $user->driverDeliveries()->whereIn('status', ['accepted', 'picked_up', 'in_transit'])->count();

            // Calculate earnings for today and this week
            $todayEarnings = $user->driverEarnings()
                ->whereDate('created_at', Carbon::today())
                ->where('status', 'completed')
                ->sum('net_amount');

            $weekEarnings = $user->driverEarnings()
                ->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
                ->where('status', 'completed')
                ->sum('net_amount');

            $totalEarnings = $user->driverEarnings()
                ->where('status', 'completed')
                ->sum('net_amount');

            return response()->json([
                'driver' => [
                    'name' => $user->name,
                    'is_verified' => $driverProfile->is_verified,
                    'is_available' => $driverProfile->is_available,
                    'rating' => (float)$driverProfile->rating,
                    'vehicle_info' => [
                        'type' => $driverProfile->vehicle_type,
                        'model' => $driverProfile->vehicle_model,
                        'color' => $driverProfile->vehicle_color,
                        'plate_number' => $driverProfile->vehicle_plate_number,
                    ],
                    'profile_picture' => $driverProfile->profile_picture,
                ],
                'stats' => [
                    'completed_deliveries' => $completedDeliveries,
                    'active_deliveries' => $activeDeliveries,
                    'today_earnings' => $todayEarnings,
                    'week_earnings' => $weekEarnings,
                    'total_earnings' => $totalEarnings,
                ],
                'recent_deliveries' => $user->driverDeliveries()
                    ->with(['client:id,name,phone', 'payment:id,delivery_id,amount,status'])
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get()
                    ->map(function ($delivery) {
                        return [
                            'id' => $delivery->id,
                            'tracking_number' => $delivery->tracking_number,
                            'status' => $delivery->status,
                            'created_at' => $delivery->created_at->toISOString(),
                            'pickup_address' => $delivery->pickup_address,
                            'delivery_address' => $delivery->delivery_address,
                            'price' => (float)$delivery->price,
                            'client' => $delivery->client,
                            'payment' => $delivery->payment,
                        ];
                    })
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to load dashboard',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update driver availability
     */
    public function updateAvailability(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            if (!$user->isDriver()) {
                return response()->json(['message' => 'Unauthorized - User is not a driver'], 403);
            }

            $validator = Validator::make($request->all(), [
                'is_available' => 'required|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $driverProfile = $user->driverProfile;
            if (!$driverProfile) {
                return response()->json(['message' => 'Driver profile not found'], 404);
            }

            $driverProfile->update([
                'is_available' => $request->is_available
            ]);

            return response()->json([
                'message' => 'Availability updated successfully',
                'is_available' => $driverProfile->is_available
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update availability',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update driver location
     */
    public function updateLocation(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            if (!$user->isDriver()) {
                return response()->json(['message' => 'Unauthorized - User is not a driver'], 403);
            }

            $validator = Validator::make($request->all(), [
                'latitude' => 'required|numeric|between:-90,90',
                'longitude' => 'required|numeric|between:-180,180',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $driverProfile = $user->driverProfile;
            if (!$driverProfile) {
                return response()->json(['message' => 'Driver profile not found'], 404);
            }

            $driverProfile->update([
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'last_location_update' => now(),
            ]);

            return response()->json([
                'message' => 'Location updated successfully',
                'location' => [
                    'latitude' => $driverProfile->latitude,
                    'longitude' => $driverProfile->longitude,
                    'updated_at' => $driverProfile->last_location_update
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update location',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get driver deliveries with filters
     */
    public function getDeliveries(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user || !$user->isDriver()) {
                return response()->json(['message' => 'Unauthorized access'], 403);
            }

            $status = $request->query('status');
            $dateFrom = $request->query('date_from');
            $dateTo = $request->query('date_to');
            $perPage = $request->query('per_page', 15);

            $query = $user->driverDeliveries()
                ->with(['client:id,name,phone', 'payment:id,delivery_id,amount,status'])
                ->orderBy('created_at', 'desc');

            if ($status) {
                $query->where('status', $status);
            }

            if ($dateFrom) {
                $query->whereDate('created_at', '>=', Carbon::parse($dateFrom));
            }

            if ($dateTo) {
                $query->whereDate('created_at', '<=', Carbon::parse($dateTo));
            }

            $deliveries = $query->paginate($perPage);

            return response()->json([
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
                        'delivery_date' => $delivery->delivery_date,
                        'delivery_time' => $delivery->delivery_time,
                        'client' => $delivery->client,
                        'payment' => $delivery->payment,
                    ];
                }),
                'pagination' => [
                    'total' => $deliveries->total(),
                    'per_page' => $deliveries->perPage(),
                    'current_page' => $deliveries->currentPage(),
                    'last_page' => $deliveries->lastPage(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch deliveries',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get delivery details
     */
    public function getDelivery($id)
    {
        try {
            $user = Auth::user();

            if (!$user || !$user->isDriver()) {
                return response()->json(['message' => 'Unauthorized access'], 403);
            }

            $delivery = $user->driverDeliveries()
                ->with([
                    'client:id,name,phone',
                    'payment:id,delivery_id,amount,status',
                    'statusHistory' => function($query) {
                        $query->orderBy('created_at', 'desc');
                    }
                ])
                ->find($id);

            if (!$delivery) {
                return response()->json(['message' => 'Delivery not found'], 404);
            }

            return response()->json([
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
                    'delivery_date' => $delivery->delivery_date,
                    'delivery_time' => $delivery->delivery_time,
                    'delivery_instructions' => $delivery->delivery_instructions,
                    'price' => (float)$delivery->price,
                    'status' => $delivery->status,
                    'payment_status' => $delivery->payment_status,
                    'created_at' => $delivery->created_at->toISOString(),
                    'client' => $delivery->client,
                    'payment' => $delivery->payment,
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
                'message' => 'Failed to fetch delivery details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Accept a delivery request
     */
    /**
     * Accept a delivery request
     */
    public function acceptDelivery($id)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            if (!$user->isDriver()) {
                return response()->json(['message' => 'Unauthorized - User is not a driver'], 403);
            }

            $driverProfile = $user->driverProfile;
            if (!$driverProfile) {
                return response()->json(['message' => 'Driver profile not found'], 404);
            }

            if (!$driverProfile->is_verified) {
                return response()->json(['message' => 'Your account is not verified yet'], 400);
            }

            if (!$driverProfile->is_available) {
                return response()->json(['message' => 'Please set your status to available first'], 400);
            }

            $delivery = Delivery::where('status', 'pending')
                ->whereNull('driver_id')
                ->findOrFail($id);

            DB::transaction(function () use ($user, $delivery, $driverProfile) {
                $delivery->update([
                    'driver_id' => $user->id,
                    'status' => 'accepted',
                ]);

                $delivery->statusHistory()->create([
                    'status' => 'accepted',
                    'notes' => 'Driver accepted the delivery request',
                    'location' => $driverProfile->vehicle_plate_number,
                    'latitude' => $driverProfile->latitude,
                    'longitude' => $driverProfile->longitude,
                ]);

                $delivery->client->notifications()->create([
                    'title' => 'Delivery Accepted',
                    'message' => "Your delivery #{$delivery->tracking_number} has been accepted by a driver",
                    'type' => 'delivery_update',
                    'data' => json_encode(['delivery_id' => $delivery->id]),
                ]);
            });

            return response()->json([
                'message' => 'Delivery accepted successfully',
                'delivery' => $delivery->fresh(['client:id,name', 'payment'])
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Delivery not found or already taken'], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to accept delivery',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update delivery status
     */
    public function updateDeliveryStatus(Request $request, $id)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            if (!$user->isDriver()) {
                return response()->json(['message' => 'Unauthorized - User is not a driver'], 403);
            }

            $validator = Validator::make($request->all(), [
                'status' => 'required|in:picked_up,in_transit,delivered',
                'notes' => 'nullable|string|max:500',
                'location' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $delivery = $user->driverDeliveries()->findOrFail($id);
            $driverProfile = $user->driverProfile;

            // Validate status transition
            $validTransitions = [
                'accepted' => ['picked_up'],
                'picked_up' => ['in_transit'],
                'in_transit' => ['delivered'],
            ];

            if (!isset($validTransitions[$delivery->status])) {
                return response()->json(['message' => 'Invalid current status for transition'], 400);
            }

            if (!in_array($request->status, $validTransitions[$delivery->status])) {
                return response()->json(['message' => 'Invalid status transition'], 400);
            }

            DB::transaction(function () use ($user, $request, $delivery, $driverProfile) {
                $delivery->update(['status' => $request->status]);

                $delivery->statusHistory()->create([
                    'status' => $request->status,
                    'notes' => $request->notes,
                    'location' => $request->location ?? $driverProfile->vehicle_plate_number,
                    'latitude' => $driverProfile->latitude,
                    'longitude' => $driverProfile->longitude,
                ]);

                $statusMessages = [
                    'picked_up' => 'Driver has picked up your package',
                    'in_transit' => 'Your package is on the way',
                    'delivered' => 'Your package has been delivered',
                ];

                $delivery->client->notifications()->create([
                    'title' => 'Delivery Update',
                    'message' => $statusMessages[$request->status] . " - #{$delivery->tracking_number}",
                    'type' => 'delivery_update',
                    'data' => json_encode(['delivery_id' => $delivery->id]),
                ]);

                if ($request->status === 'delivered') {
                    $payment = $delivery->payment;
                    if ($payment && $payment->status === 'paid') {
                        $commissionRate = 0.20; // 20% commission
                        $commission = $payment->amount * $commissionRate;
                        $netAmount = $payment->amount - $commission;

                        $user->driverEarnings()->create([
                            'delivery_id' => $delivery->id,
                            'amount' => $payment->amount,
                            'commission' => $commission,
                            'net_amount' => $netAmount,
                            'status' => 'completed',
                            'notes' => "Payment for delivery #{$delivery->tracking_number}",
                        ]);
                    }
                }
            });

            return response()->json([
                'message' => 'Delivery status updated successfully',
                'delivery' => $delivery->fresh(['client:id,name', 'payment', 'statusHistory'])
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Delivery not found'], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update delivery status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get driver earnings
     */
    public function getEarnings(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            if (!$user->isDriver()) {
                return response()->json(['message' => 'Unauthorized - User is not a driver'], 403);
            }

            $period = $request->query('period', 'week');
            $status = $request->query('status', 'completed');
            $perPage = $request->query('per_page', 15);

            switch ($period) {
                case 'today':
                    $start = Carbon::today();
                    $end = Carbon::tomorrow();
                    break;
                case 'week':
                    $start = Carbon::now()->startOfWeek();
                    $end = Carbon::now()->endOfWeek();
                    break;
                case 'month':
                    $start = Carbon::now()->startOfMonth();
                    $end = Carbon::now()->endOfMonth();
                    break;
                case 'year':
                    $start = Carbon::now()->startOfYear();
                    $end = Carbon::now()->endOfYear();
                    break;
                case 'all':
                    $start = null;
                    $end = null;
                    break;
                default:
                    $start = Carbon::now()->startOfWeek();
                    $end = Carbon::now()->endOfWeek();
            }

            $query = $user->driverEarnings()
                ->with('delivery:id,tracking_number,pickup_address,delivery_address')
                ->when($status, function ($q) use ($status) {
                    $q->where('status', $status);
                })
                ->when($start && $end, function ($q) use ($start, $end) {
                    $q->whereBetween('created_at', [$start, $end]);
                })
                ->orderBy('created_at', 'desc');

            $earnings = $query->paginate($perPage);
            $total = $query->sum('net_amount');

            return response()->json([
                'earnings' => $earnings->map(function ($earning) {
                    return [
                        'id' => $earning->id,
                        'amount' => (float)$earning->amount,
                        'commission' => (float)$earning->commission,
                        'net_amount' => (float)$earning->net_amount,
                        'status' => $earning->status,
                        'created_at' => $earning->created_at->toISOString(),
                        'delivery' => $earning->delivery,
                    ];
                }),
                'total' => (float)$total,
                'period' => $period,
                'pagination' => [
                    'total' => $earnings->total(),
                    'per_page' => $earnings->perPage(),
                    'current_page' => $earnings->currentPage(),
                    'last_page' => $earnings->lastPage(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch earnings',
                'error' => $e->getMessage()
            ], 500);
        }
    }




    /**
     * Get driver profile information
     */
    public function getProfile()
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            if (!$user->isDriver()) {
                return response()->json(['message' => 'Unauthorized - User is not a driver'], 403);
            }

            $driverProfile = $user->driverProfile;
            if (!$driverProfile) {
                return response()->json(['message' => 'Driver profile not found'], 404);
            }

            return response()->json([
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                ],
                'profile' => [
                    'address' => $driverProfile->address,
                    'vehicle_type' => $driverProfile->vehicle_type,
                    'vehicle_model' => $driverProfile->vehicle_model,
                    'vehicle_color' => $driverProfile->vehicle_color,
                    'vehicle_plate_number' => $driverProfile->vehicle_plate_number,
                    'driver_license' => $driverProfile->driver_license,
                    'profile_picture' => $driverProfile->profile_picture,
                    'rating' => (float)$driverProfile->rating,
                    'is_verified' => (bool)$driverProfile->is_verified,
                    'latitude' => $driverProfile->latitude,
                    'longitude' => $driverProfile->longitude,
                    'last_location_update' => $driverProfile->last_location_update,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to load profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update driver profile information
     */
    public function updateProfile(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            if (!$user->isDriver()) {
                return response()->json(['message' => 'Unauthorized - User is not a driver'], 403);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'phone' => 'sometimes|required|string|max:20',
                'address' => 'sometimes|required|string|max:500',
                'driver_license' => 'sometimes|required|string|max:50',
                'profile_picture' => 'sometimes|nullable|string|max:512',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            DB::transaction(function () use ($user, $request) {
                // Update user table fields
                if ($request->has('name')) {
                    $user->name = $request->name;
                }
                if ($request->has('phone')) {
                    $user->phone = $request->phone;
                }
                $user->save();

                // Update driver profile fields
                $profileData = [];
                if ($request->has('address')) {
                    $profileData['address'] = $request->address;
                }
                if ($request->has('driver_license')) {
                    $profileData['driver_license'] = $request->driver_license;
                }
                if ($request->has('profile_picture')) {
                    $profileData['profile_picture'] = $request->profile_picture;
                }

                if (!empty($profileData)) {
                    $user->driverProfile()->update($profileData);
                }
            });

            return response()->json([
                'message' => 'Profile updated successfully',
                'user' => $user->fresh(['driverProfile'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update driver vehicle information
     */
    public function updateVehicleInfo(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            if (!$user->isDriver()) {
                return response()->json(['message' => 'Unauthorized - User is not a driver'], 403);
            }

            $validator = Validator::make($request->all(), [
                'vehicle_type' => 'required|string|max:50',
                'vehicle_model' => 'required|string|max:100',
                'vehicle_color' => 'required|string|max:50',
                'vehicle_plate_number' => 'required|string|max:20',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $user->driverProfile()->update([
                'vehicle_type' => $request->vehicle_type,
                'vehicle_model' => $request->vehicle_model,
                'vehicle_color' => $request->vehicle_color,
                'vehicle_plate_number' => $request->vehicle_plate_number,
            ]);

            return response()->json([
                'message' => 'Vehicle information updated successfully',
                'profile' => $user->driverProfile
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update vehicle information',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    /**
     * Get driver notifications
     */
    public function getNotifications(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            if (!$user->isDriver()) {
                return response()->json(['message' => 'Unauthorized - User is not a driver'], 403);
            }

            $perPage = $request->query('per_page', 20);
            $unreadOnly = $request->query('unread_only', false);

            $query = $user->notifications()
                ->orderBy('created_at', 'desc');

            if ($unreadOnly) {
                $query->whereNull('read_at');
            }

            $notifications = $query->paginate($perPage);

            return response()->json([
                'notifications' => $notifications->map(function ($notification) {
                    return [
                        'id' => $notification->id,
                        'title' => $notification->title,
                        'message' => $notification->message,
                        'type' => $notification->type,
                        'data' => json_decode($notification->data),
                        'read_at' => $notification->read_at,
                        'created_at' => $notification->created_at->toISOString(),
                    ];
                }),
                'pagination' => [
                    'total' => $notifications->total(),
                    'per_page' => $notifications->perPage(),
                    'current_page' => $notifications->currentPage(),
                    'last_page' => $notifications->lastPage(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
