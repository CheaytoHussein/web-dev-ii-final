
# SwiftTrack Laravel Backend

This folder contains the Laravel backend for the SwiftTrack delivery app system.

## Requirements

- PHP >= 8.0
- Composer
- MySQL or PostgreSQL
- Laravel 10.x

## Installation

1. Navigate to the backend folder:
```bash
cd laravel_backend
```

2. Install dependencies:
```bash
composer install
```

3. Copy the environment file:
```bash
cp .env.example .env
```

4. Generate application key:
```bash
php artisan key:generate
```

5. Configure your database in the .env file:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=swifttrack
DB_USERNAME=root
DB_PASSWORD=
```

6. Run migrations and seed the database:
```bash
php artisan migrate --seed
```

7. Start the development server:
```bash
php artisan serve
```

## API Documentation

The API will be available at `http://localhost:8000/api`.

### Authentication Endpoints

- **POST /api/auth/register**: Register a new user (client or driver)
- **POST /api/auth/verify-email**: Verify email with OTP
- **POST /api/auth/login**: Login with email and password
- **POST /api/auth/forgot-password**: Request password reset
- **POST /api/auth/reset-password**: Reset password with token
- **POST /api/auth/logout**: Logout (revoke token)
- **GET /api/auth/user**: Get authenticated user details

### Client Endpoints

- **GET /api/client/dashboard**: Get client dashboard data
- **GET /api/client/deliveries**: Get all client deliveries
- **GET /api/client/deliveries/{id}**: Get specific delivery details
- **POST /api/client/deliveries**: Create new delivery request
- **POST /api/client/deliveries/{id}/cancel**: Cancel a delivery

### Driver Endpoints

- **GET /api/driver/dashboard**: Get driver dashboard data
- **GET /api/driver/deliveries**: Get all driver assigned deliveries
- **POST /api/driver/availability**: Update driver availability status
- **POST /api/driver/deliveries/{id}/status**: Update delivery status
- **POST /api/driver/location**: Update driver current location

### Payment Endpoints

- **POST /api/payments/process**: Process card payment
- **POST /api/payments/verify-crypto**: Verify cryptocurrency payment

### Admin Endpoints

- **POST /api/admin/login**: Admin login
- **GET /api/admin/dashboard**: Get admin dashboard statistics
- **GET /api/admin/users**: Get all clients
- **GET /api/admin/drivers**: Get all drivers
- **GET /api/admin/deliveries**: Get all deliveries
