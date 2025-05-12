<?php

namespace App\Traits;

use App\Models\Currency;
use Illuminate\Http\Request;
use GuzzleHttp\Client;

trait CurrencyTrait {

   static public function getRates() {
        $apiKey = 'fca_live_OXAp8ofOHCzpL1Fxwu9llOjcC0Vw9mPUlUb8LwTs'; // Replace 'YOUR_API_KEY' with your actual API key
        $baseCurrency = 'USD'; // Assuming your base currency is USD, you can change it accordingly
        $targetCurrency = session('ca'); // Get the target currency from session

        // Make a request to the API
        $client = new Client();
       $targetCurrency= implode(',' ,Currency::where('active',1)->get()->pluck('code')->toArray());

        $response = $client->get("https://api.freecurrencyapi.com/v1/latest?apikey=$apiKey&currencies=$targetCurrency&base_currency=$baseCurrency");

        // Decode the JSON response
        $data = json_decode($response->getBody(), true);
        $currencies = Currency::where('active',1)->get();

        foreach ($currencies as $currency) {

            if(isset( $data['data'][$currency->code])){
                $currency->exchange_rate = $data['data'][$currency->code];
                $currency->save();
            }
            }

    }

    static public function  convertTrait($price){
        $code = session('ca');
        return number_format($price *  Currency::where('code', $code)->first()->exchange_rate,2);

    }

    static public function currencySymbol(){
       $code = session('ca');
       $currency= Currency::where('code', $code)->first()->symbol;
       return $currency;
}
}
