<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Currency;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CurrencyFactory extends Factory
{
    protected $model = Currency::class;

    public function definition()
    {
        $faker = 1;
        return [
            'name' => $faker->name,
            'code' => Str::random(3),
            'symbol' => Str::random(1),
            'format' => $faker->sentence,
            'exchange_rate' => $faker->randomFloat(10, 0, 1000),
            'active' => $faker->boolean,
            'created_at' => $faker->dateTime(),
            'updated_at' => $faker->dateTime(),
        ];
    }
}
