# AI-LMS Laravel API — user approval slice

Laravel 12 API implementing the approved global `users` identity table, email/mobile OTP verification, one-level-up approval history, and administrator user management endpoints.

## Requirements

- PHP 8.3+
- Composer 2
- MySQL 8

## Installation

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan ai-lms:bootstrap-super-admins
php artisan serve
```

For local testing, OTP messages are written to `storage/logs/laravel.log`. Replace the log OTP sender with approved email and SMS providers before any real deployment.

The temporary super-admin authorization list in `AI_LMS_SUPER_ADMIN_PUBLIC_IDS` exists only until the `platform_roles` tables are approved and implemented.

## Testing

```bash
php artisan test
```

The current execution environment did not contain PHP or Composer, so these PHP tests require user execution. The React test/build results are recorded in the pull request.

