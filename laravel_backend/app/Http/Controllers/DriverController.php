<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Delivery;
use App\Models\DriverProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class DriverController extends Controller
{
    /**
     * Get driver dashboard data
     */
    public function getDashboard()
    {
        $user = Auth::user();

        if (!$user->isDriver()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $driverProfile = $user->driverProfile;
        $completedDeliveries = $user->driverDeliveries()->where('status', 'delivered')->count();
        $activeDeliveries = $user->driverDeliveries()->whereIn('status', ['accepted', 'picked_up', 'in_transit'])->count();

        // Calculate earnings for today and this week
        $todayEarnings = $user->driverEarnings()
            ->whereDate('created_at', Carbon::today())
            ->sum('amount');

        $weekEarnings = $user->driverEarnings()
            ->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
            ->sum('amount');

        return response()->json([
            'driver' => [
                'name' => $user->name,
                'is_verified' => $driverProfile->is_verified,
                'is_available' => $driverProfile->is_available,
                'rating' => $driverProfile->rating,
                'vehicle_info' => [
                    'type' => $driverProfile->vehicle_type,
                    'model' => $driverProfile->vehicle_model,
                    'color' => $driverProfile->vehicle_color,
                    'plate_number' => $driverProfile->vehicle_plate_number,
                ]
            ],
            'stats' => [
                'completed_deliveries' => $completedDeliveries,
                'active_deliveries' => $activeDeliveries,
                'today_earnings' => $todayEarnings,
                'week_earnings' => $weekEarnings,
            ],
            'recent_deliveries' => $user->driverDeliveries()
                ->with(['client:id,name', 'payment:id,delivery_id,amount'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
        ]);
    }

    /**
     * Update driver availability
     */
    public function updateAvailability(Request $request)
    {
        $user = Auth::user();

        if (!$user->isDriver()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'available' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $user->driverProfile->update([
            'is_available' => $request->available
        ]);

        return response()->json([
            'message' => 'Availability updated successfully',
            'is_available' => $request->available
        ]);
    }

    /**
     * Update driver location
     */
    public function updateLocation(Request $request)
    {
        $user = Auth::user();

        if (!$user->isDriver()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $user->driverProfile->update([
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'last_location_update' => now(),
        ]);

        return response()->json([
            'message' => 'Location updated successfully'
        ]);
    }

    /**
     * Get driver deliveries
     */
    public function getDeliveries(Request $request)
    {
        $user = Auth::user();

        if (!$user->isDriver()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $status = $request->query('status');
        $query = $user->driverDeliveries()->with(['client:id,name', 'payment:id,delivery_id,amount,status']);

        if ($status) {
            $query->where('status', $status);
        }

        $deliveries = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json($deliveries);
    }

    /**
     * Get delivery details
     */
    public function getDelivery($id)
    {
        $user = Auth::user();

        if (!$user->isDriver()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $delivery = $user->driverDeliveries()
            ->with([
                'client:id,name,phone,email',
                'payment:id,delivery_id,amount,status',
                'statusHistory' => function($query) {
                    $query->orderBy('created_at', 'desc');
                }
            ])
            ->findOrFail($id);

        return response()->json([
            'delivery' => $delivery
        ]);
    }

    /**
     * Accept a delivery request
     */
    public function acceptDelivery($id)
    {
        $user = Auth::user();

        if (!$user->isDriver()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $delivery = Delivery::where('status', 'pending')
            ->findOrFail($id);

        // Check if driver is verified and available
        if (!$user->driverProfile->is_verified) {
            return response()->json(['message' => 'Your account is not verified yet'], 400);
        }

        if (!$user->driverProfile->is_available) {
            return response()->json(['message' => 'Please set your status to available first'], 400);
        }

        // Update delivery
        $delivery->update([
            'driver_id' => $user->id,
            'status' => 'accepted',
        ]);

        // Add status history
        $delivery->statusHistory()->create([
            'status' => 'accepted',
            'notes' => 'Driver accepted the delivery request',
            'location' => null,
        ]);

        // Create notification for client
        $delivery->client->notifications()->create([
            'title' => 'Delivery Accepted',
            'message' => "Your delivery #{$delivery->tracking_number} has been accepted by a driver",
            'type' => 'delivery_update',
            'data' => json_encode(['delivery_id' => $delivery->id]),
        ]);

        return response()->json([
            'message' => 'Delivery accepted successfully',
            'delivery' => $delivery
        ]);
    }

    /**
     * Update delivery status
     */
    public function updateDeliveryStatus(Request $request, $id)
    {
        $user = Auth::user();

        if (!$user->isDriver()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $delivery = $user->driverDeliveries()->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:picked_up,in_transit,delivered',
            'notes' => 'nullable|string|max:500',
            'location' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        // Validate status transition
        $validTransitions = [
            'accepted' => ['picked_up'],
            'picked_up' => ['in_transit'],
            'in_transit' => ['delivered'],
        ];

        if (!isset($validTransitions[$delivery->status]) || !in_array($request->status, $validTransitions[$delivery->status])) {
            return response()->json(['message' => 'Invalid status transition'], 422);
        }

        // Update delivery
        $delivery->update([
            'status' => $request->status,
        ]);

        // Add status history
        $delivery->statusHistory()->create([
            'status' => $request->status,
            'notes' => $request->notes,
            'location' => $request->location,
        ]);

        // Create notification for client
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

        // If delivered, create driver earnings record
        if ($request->status === 'delivered') {
            $payment = $delivery->payment;
            if ($payment) {
                // Typically driver gets 80% of the payment
                $driverShare = $payment->amount * 0.80;

                $user->driverEarnings()->create([
                    'delivery_id' => $delivery->id,
                    'amount' => $driverShare,
                    'notes' => "Payment for delivery #{$delivery->tracking_number}",
                ]);
            }
        }

        return response()->json([
            'message' => 'Delivery status updated successfully',
            'delivery' => $delivery
        ]);
    }

    /**
     * Get driver earnings
     */
    public function getEarnings(Request $request)
    {
        $user = Auth::user();

        if (!$user->isDriver()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $period = $request->query('period', 'week');

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
            default:
                $start = Carbon::now()->startOfWeek();
                $end = Carbon::now()->endOfWeek();
        }

        $earnings = $user->driverEarnings()
            ->with('delivery:id,tracking_number,pickup_address,delivery_address')
            ->whereBetween('created_at', [$start, $end])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        $total = $user->driverEarnings()
            ->whereBetween('created_at', [$start, $end])
            ->sum('amount');

        return response()->json([
            'earnings' => $earnings,
            'total' => $total,
            'period' => $period,
        ]);
    }

    /**
     * Get driver notifications
     */
    public function getNotifications()
    {
        $user = Auth::user();

        if (!$user->isDriver()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $notifications = $user->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'notifications' => $notifications
        ]);
    }
}
