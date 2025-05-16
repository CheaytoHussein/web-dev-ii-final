<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Delivery;
use App\Models\Payment;
use App\Models\DriverEarning;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AdminController extends Controller
{
    /**
     * Admin login
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        // Find user with admin role
        $admin = User::where('email', $request->email)
            ->where('user_type', 'admin')
            ->first();

        if (!$admin || !Hash::check($request->password, $admin->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Create token
        $token = $admin->createToken('admin_token')->plainTextToken;

        return response()->json([
            'message' => 'Admin login successful',
            'token' => $token,
            'admin' => $admin->only(['id', 'name', 'email']),
        ]);
    }

    /**
     * Get admin user details
     */
    public function getUser(Request $request)
    {
        $admin = $request->user();

        if (!$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        return response()->json([
            'admin' => $admin->only(['id', 'name', 'email']),
        ]);
    }

    /**
     * Admin logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Get admin dashboard statistics
     */
    public function getDashboard(Request $request)
    {
        $admin = $request->user();

        if (!$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        // Users statistics
        $totalClients = User::where('user_type', 'client')->count();
        $totalDrivers = User::where('user_type', 'driver')->count();
        $verifiedDrivers = User::where('user_type', 'driver')
            ->whereHas('driverProfile', function($query) {
                $query->where('is_verified', true);
            })
            ->count();
        $activeDrivers = User::where('user_type', 'driver')
            ->whereHas('driverProfile', function($query) {
                $query->where('is_available', true);
            })
            ->count();

        // Deliveries statistics
        $totalDeliveries = Delivery::count();
        $activeDeliveries = Delivery::whereIn('status', ['pending', 'accepted', 'picked_up', 'in_transit'])->count();
        $completedDeliveries = Delivery::where('status', 'delivered')->count();
        $cancelledDeliveries = Delivery::where('status', 'cancelled')->count();

        // Payment statistics
        $totalRevenue = Payment::where('status', 'completed')->sum('amount');
        $totalCommissions = DriverEarning::sum('commission');
        $todayRevenue = Payment::whereDate('created_at', Carbon::today())
            ->where('status', 'completed')
            ->sum('amount');

        // Recent deliveries
        $recentDeliveries = Delivery::with(['client', 'driver'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $currentMonthRevenue = Payment::where('status', 'completed')
            ->whereMonth('created_at', Carbon::now()->month)
            ->sum('amount');

        $previousMonthRevenue = Payment::where('status', 'completed')
            ->whereMonth('created_at', Carbon::now()->subMonth()->month)
            ->sum('amount');

        return response()->json([
            'users' => [
                'total_clients' => $totalClients,
                'total_drivers' => $totalDrivers,
                'verified_drivers' => $verifiedDrivers,
                'active_drivers' => $activeDrivers,
            ],
            'deliveries' => [
                'total' => $totalDeliveries,
                'active' => $activeDeliveries,
                'completed' => $completedDeliveries,
                'cancelled' => $cancelledDeliveries,
            ],
            'revenue' => [
                'total' => $totalRevenue,
                'current_month' => $currentMonthRevenue,
                'previous_month' => $previousMonthRevenue,
                'currency' => '$', // Add currency symbol
            ],
            'recent_deliveries' => $recentDeliveries,
        ]);
    }

    /**
     * Get all clients
     */
    public function getClients(Request $request)
    {
        $admin = $request->user();
        if (!$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        $query = User::where('user_type', 'client')->with('clientProfile');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                    ->orWhere('email', 'like', "%$search%");
            });
        }

        $sort = $request->query('sort', 'name');
        $direction = $request->query('direction', 'asc');
        $query->orderBy($sort, $direction);

        return response()->json([
            'clients' => $query->paginate(20)
        ]);
    }

    public function getDrivers(Request $request)
    {
        $admin = $request->user();
        if (!$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        $query = User::where('user_type', 'driver')->with('driverProfile');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                    ->orWhere('email', 'like', "%$search%");
            });
        }

        if ($status = $request->query('status')) {
            $query->whereHas('driverProfile', function ($q) use ($status) {
                if ($status === 'verified') {
                    $q->where('is_verified', true);
                } elseif ($status === 'unverified') {
                    $q->where('is_verified', false);
                } elseif ($status === 'active') {
                    $q->where('is_available', true);
                }
            });
        }

        $sort = $request->query('sort', 'name');
        $direction = $request->query('direction', 'asc');
        $query->orderBy($sort, $direction);

        return response()->json([
            'drivers' => $query->paginate(20)
        ]);
    }


    /**
     * Verify or unverify a driver
     */
    public function toggleDriverVerification($id)
    {
        $user = User::where('role', 'driver')->find($id);

        if (!$user || !$user->driverProfile) {
            return response()->json(['message' => 'Driver not found.'], 404);
        }

        $driverProfile = $user->driverProfile;
        $driverProfile->is_verified = !$driverProfile->is_verified;
        $driverProfile->save();

        return response()->json([
            'message' => 'Driver verification status updated.',
            'driver' => $user->load('driverProfile'),
        ]);
    }


    /**
     * Get all deliveries
     */
    public function getDeliveries(Request $request)
    {
        $admin = $request->user();

        if (!$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        $status = $request->query('status');
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $query = Delivery::with(['client', 'driver']);

        if ($status) {
            $query->where('status', $status);
        }

        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        $deliveries = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'deliveries' => $deliveries
        ]);
    }

    /**
     * Get delivery details
     */
    public function getDelivery(Request $request, $id)
    {
        $admin = $request->user();

        if (!$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        $delivery = Delivery::with([
                'client',
                'driver',
                'driver.driverProfile',
                'statusHistory' => function($query) {
                    $query->orderBy('created_at', 'desc');
                },
                'payment',
                'driverEarning'
            ])
            ->find($id);

        if (!$delivery) {
            return response()->json(['message' => 'Delivery not found'], 404);
        }

        return response()->json([
            'delivery' => $delivery
        ]);
    }

    /**
     * Get system reports
     */
    public function getReports(Request $request)
    {
        $admin = $request->user();

        if (!$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        $period = $request->query('period', 'month');

        switch ($period) {
            case 'week':
                $startDate = Carbon::now()->subWeek();
                $groupBy = 'date';
                $format = 'Y-m-d';
                break;
            case 'month':
                $startDate = Carbon::now()->subMonth();
                $groupBy = 'date';
                $format = 'Y-m-d';
                break;
            case 'year':
                $startDate = Carbon::now()->subYear();
                $groupBy = 'month';
                $format = 'Y-m';
                break;
            default:
                $startDate = Carbon::now()->subMonth();
                $groupBy = 'date';
                $format = 'Y-m-d';
        }

        // Revenue over time
        $revenue = Payment::where('status', 'completed')
            ->where('created_at', '>=', $startDate)
            ->get()
            ->groupBy(function($date) use ($groupBy, $format) {
                return Carbon::parse($date->created_at)->format($format);
            })
            ->map(function($group) {
                return $group->sum('amount');
            });

        // Deliveries by status
        $deliveriesByStatus = Delivery::select('status', \DB::raw('count(*) as count'))
            ->where('created_at', '>=', $startDate)
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();

        // New users over time
        $newUsers = User::where('created_at', '>=', $startDate)
            ->get()
            ->groupBy(function($date) use ($groupBy, $format) {
                return Carbon::parse($date->created_at)->format($format);
            })
            ->map(function($group) {
                return $group->count();
            });

        return response()->json([
            'revenue' => $revenue,
            'deliveries_by_status' => $deliveriesByStatus,
            'new_users' => $newUsers,
            'period' => $period,
        ]);
    }

    /**
     * Get admin notifications
     */
    public function getNotifications(Request $request)
    {
        $admin = $request->user();

        $notifications = $admin->notifications()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'notifications' => $notifications
        ]);
    }
    /**
     * Verify a driver
     */
    public function verifyDriver($id)
    {
        $user = User::where('user_type', 'driver')->find($id);

        if (!$user || !$user->driverProfile) {
            return response()->json(['message' => 'Driver not found.'], 404);
        }

        $user->driverProfile->is_verified = true;
        $user->driverProfile->save();

        return response()->json([
            'message' => 'Driver verified successfully.',
            'driver' => $user->load('driverProfile'),
        ]);
    }

    /**
     * Unverify a driver
     */
    public function unverifyDriver($id)
    {
        $user = User::where('user_type', 'driver')->find($id);

        if (!$user || !$user->driverProfile) {
            return response()->json(['message' => 'Driver not found.'], 404);
        }

        $user->driverProfile->is_verified = false;
        $user->driverProfile->save();

        return response()->json([
            'message' => 'Driver unverified successfully.',
            'driver' => $user->load('driverProfile'),
        ]);
    }

}
