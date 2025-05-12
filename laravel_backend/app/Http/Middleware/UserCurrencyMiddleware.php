<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class UserCurrencyMiddleware
{

    public function handle(Request $request, Closure $next)
    {
        if($request->session()->has('ca')) {

            if (!$request->get('ca') && !$request->getSession()->get('ca')) {
                $clientIP = $request->getClientIp();
                $localCurrency = geoip($clientIP)->getAttribute('ca');
                $request->getSession()->put([
                    'ca' => $localCurrency,
                ]);
            }
        } else{
            $request->session()->put('ca','USD');
        }
        return $next($request);
    }
}
