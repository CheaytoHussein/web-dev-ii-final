
<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ClientProfile;
use App\Models\DriverProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|max:20',
            'password' => ['required', 'confirmed', Password::min(8)
                ->letters()
                ->mixedCase()
                ->numbers()
                ->symbols()],
            'user_type' => 'required|in:client,driver',
            'agree_terms' => 'required|accepted',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        // Create user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'user_type' => $request->user_type,
            'otp' => $this->generateOTP(),
            'otp_expires_at' => Carbon::now()->addMinutes(15),
        ]);

        // Create profile based on user type
        if ($request->user_type === 'client') {
            ClientProfile::create([
                'user_id' => $user->id
            ]);
        } else {
            DriverProfile::create([
                'user_id' => $user->id,
                'is_available' => false,
                'is_verified' => false,
            ]);
        }

        // Send OTP email
        $this->sendOTPEmail($user);

        return response()->json([
            'message' => 'Registration successful. Please check your email for verification code.',
            'user' => $user->only(['id', 'name', 'email', 'user_type']),
        ], 201);
    }

    /**
     * Verify email with OTP
     */
    public function verifyEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|min:6|max:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email already verified'], 400);
        }

        if ($user->otp !== $request->otp) {
            return response()->json(['message' => 'Invalid OTP'], 400);
        }

        if (Carbon::now() > $user->otp_expires_at) {
            return response()->json(['message' => 'OTP has expired'], 400);
        }

        $user->email_verified_at = Carbon::now();
        $user->otp = null;
        $user->otp_expires_at = null;
        $user->save();

        return response()->json(['message' => 'Email verified successfully'], 200);
    }

    /**
     * Resend OTP for email verification
     */
    public function resendVerification(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email already verified'], 400);
        }

        // Generate new OTP
        $user->otp = $this->generateOTP();
        $user->otp_expires_at = Carbon::now()->addMinutes(15);
        $user->save();

        // Send OTP email
        $this->sendOTPEmail($user);

        return response()->json(['message' => 'Verification code has been resent'], 200);
    }

    /**
     * Login user
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
            'user_type' => 'required|in:client,driver',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        // Attempt authentication
        if (!Auth::attempt([
            'email' => $request->email,
            'password' => $request->password,
            'user_type' => $request->user_type,
        ])) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = Auth::user();

        // Check if email is verified
        if (!$user->email_verified_at) {
            Auth::logout();
            
            // Generate new OTP for convenience
            $user->otp = $this->generateOTP();
            $user->otp_expires_at = Carbon::now()->addMinutes(15);
            $user->save();

            // Send OTP email
            $this->sendOTPEmail($user);
            
            return response()->json([
                'message' => 'Email not verified. A new verification code has been sent.',
                'requires_verification' => true,
                'email' => $user->email,
            ], 403);
        }

        // Update device token if provided
        if ($request->has('device_token')) {
            $user->device_token = $request->device_token;
            $user->save();
        }

        // Create token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => $user->only(['id', 'name', 'email', 'user_type']),
        ]);
    }

    /**
     * Get authenticated user details
     */
    public function getUser(Request $request)
    {
        $user = $request->user();
        
        $userData = $user->only(['id', 'name', 'email', 'phone', 'user_type']);
        
        if ($user->isClient()) {
            $userData['profile'] = $user->clientProfile;
        } elseif ($user->isDriver()) {
            $userData['profile'] = $user->driverProfile;
            $userData['is_available'] = $user->driverProfile->is_available;
            $userData['is_verified'] = $user->driverProfile->is_verified;
            $userData['rating'] = $user->driverProfile->rating;
        }

        return response()->json([
            'user' => $userData,
        ]);
    }

    /**
     * Logout user (revoke token)
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        
        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Forgot password request
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $user = User::where('email', $request->email)->first();

        // Generate password reset token
        $token = \Str::random(60);
        
        \DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => Hash::make($token),
                'created_at' => Carbon::now()
            ]
        );

        // Send password reset email with link
        // Mail::to($user->email)->send(new PasswordResetMail($user, $token));
        
        // For demo purposes, let's just return the token directly
        // In production, you'd only return a success message
        return response()->json([
            'message' => 'Password reset link has been sent to your email',
            'reset_link' => url('/reset-password?token=' . $token . '&email=' . urlencode($user->email)),
        ]);
    }

    /**
     * Reset password
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
            'email' => 'required|email|exists:users,email',
            'password' => ['required', 'confirmed', Password::min(8)
                ->letters()
                ->mixedCase()
                ->numbers()
                ->symbols()],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $tokenRecord = \DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$tokenRecord) {
            return response()->json(['message' => 'Invalid token or email'], 400);
        }

        if (!Hash::check($request->token, $tokenRecord->token)) {
            return response()->json(['message' => 'Invalid token'], 400);
        }

        // Check if the token is expired (1 hour validity)
        if (Carbon::parse($tokenRecord->created_at)->addHour()->isPast()) {
            return response()->json(['message' => 'Token has expired'], 400);
        }

        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        // Delete the token
        \DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();

        return response()->json(['message' => 'Password has been reset successfully']);
    }

    /**
     * Generate 6-digit OTP for email verification
     */
    private function generateOTP()
    {
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Send OTP email for verification
     */
    private function sendOTPEmail(User $user)
    {
        // In a real application, you would send an actual email
        // Mail::to($user->email)->send(new VerificationOTPMail($user));
        
        // For demonstration purposes, we'll just log the OTP
        \Log::info('Verification OTP for ' . $user->email . ': ' . $user->otp);
    }
}
