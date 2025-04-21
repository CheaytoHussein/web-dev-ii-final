
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class VerifyDriverAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user || $user->user_type !== 'driver' || !$user->email_verified_at) {
            return response()->json([
                'message' => 'Access denied. Driver account required.'
            ], 403);
        }

        return $next($request);
    }
}
