<?php

namespace App\Http\Controllers;

use App\Models\Currency;
use App\Models\Product;
use Illuminate\Http\Request;

use App\Traits\CurrencyTrait;


class CurrencyController extends Controller
{


    public function index(Request $request)
    {
        $converted = '';
        $currencies = Currency::all(); // Retrieve all currencies

        // Get the user's preferred currency from the session, or use a default value
        $userCurrency = $request->session()->get('ca', 'USD');

        if ($request->filled('currency_to')) {
            $convertedObj = Currency::convert()
                ->from($userCurrency)
                ->to($request->get('currency_to'))
                ->amount($request->get('amount'));

            if ($request->filled('date')) {
                $convertedObj = $convertedObj->date($request->get('date'));
            }

            $converted = $convertedObj->get();
        }

        return view('web.views.updated.base', compact('converted', 'currencies', 'userCurrency'));
    }

    public function showCurrencySelector()
    {
        $selectedCurrency = 'USD'; // Example selected currency
        // Pass the $selectedCurrency variable to the Blade view
        return view('web.views.updated.base')->with('selectedCurrency', $selectedCurrency);
    }




//    public function showCurrencySelector()
//    {
//        $selectedCurrency = request()->input('currency_from', 'USD'); // Default to USD if not provided
//
//        return response()->json(['selectedCurrency' => $selectedCurrency]);
//    }



    use CurrencyTrait;

    public function convertCurrency(Request $request)
    {
        $price = $request->input('price');
        $convertedPrice = $this->convert($price);
        return response()->json(['converted_price' => $convertedPrice]);
    }

    public function getPriceInUserCurrency($id)
    {
        $price = Product::find($id)->price;
        $convertedPrice = self::convertTrait($price);
        return response()->json(['converted_price' => $convertedPrice , 'old_price' => $price]);

    }

    public function setCurrencySelector(Request $request,$code)
    {
//        currency()->setUserCurrency($code);
        $request->session()->put('ca', $code);

        return redirect()->route('index') ;
    }




}
