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
        $activeDeliveries = $user->driverDeliveries()->whereIn('status', ['pending','accepted', 'picked_up', 'in_transit'])->count();
        $pendingDeliveries = $user->driverDeliveries()->where('status', 'pending')->count();

        
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
                'pending_deliveries' => $pendingDeliveries,
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
    }public function updateProfile(Request $request)
{
    $user = Auth::user();

    if (!$user->isDriver()) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    // Validate incoming data
    $validatedData = $request->validate([
        'vehicle_type' => 'required|string|max:255',
        'vehicle_model' => 'required|string|max:255',
        'vehicle_color' => 'required|string|max:255',
        'vehicle_plate_number' => 'required|string|max:255',
        'driver_license' => 'required|string|max:255',
        'is_available' => 'required|boolean',
    ]);

    // Update the driver's profile
    $driverProfile = $user->driverProfile;
    $driverProfile->update([
        'vehicle_type' => $validatedData['vehicle_type'],
        'vehicle_model' => $validatedData['vehicle_model'],
        'vehicle_color' => $validatedData['vehicle_color'],
        'vehicle_plate_number' => $validatedData['vehicle_plate_number'],
        'driver_license' => $validatedData['driver_license'],
        'is_available' => $validatedData['is_available'],
    ]);

    return response()->json(['message' => 'Profile updated successfully', 'driverProfile' => $driverProfile]);
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

    // Ensure that the delivery object contains the new fields
    $deliveryDetails = $delivery->toArray();
    $deliveryDetails['package_size'] = $delivery->package_size;
    $deliveryDetails['package_description'] = $delivery->package_description;
    $deliveryDetails['delivery_instructions'] = $delivery->delivery_instructions;
    $deliveryDetails['price'] = $delivery->price;

    return response()->json([
        'delivery' => $deliveryDetails
    ]);
}

public function getActiveDelivery(Request $request)
{
    // Fetch active delivery data, e.g. based on the authenticated driver
    $driver = $request->user();  // Assuming you have a driver logged in
    $activeDelivery = Delivery::where('driver_id', $driver->id)
        ->where('status', '!=', 'delivered')
        ->first();

    return response()->json(['delivery' => $activeDelivery]);
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
            'pending' => ['accepted','delivered','in_transit'],
            'accepted' => ['picked_up','in_transit','delivered'],
            'picked_up' => ['in_transit'],
            'in_transit' => ['delivered'],
            'delivered' => ['in_transit'],
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
            'amount' => $payment->amount,  // Total amount of the payment
            'commission' => $payment->amount * 0.20,  // Assuming 20% commission
            'net_amount' => $driverShare,  // Driver's share after commission
            'status' => 'paid',  // You can track the status of the payout
            'payout_date' => Carbon::now(),  // Date of the payout
            'payout_method' => 'bank_transfer',  // You can adjust the payout method based on your requirements
            'transaction_id' => uniqid(),  // Transaction ID, can be unique
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