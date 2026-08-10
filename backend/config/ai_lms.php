<?php
return [
    'identity_hmac_key' => env('AI_LMS_IDENTITY_HMAC_KEY', env('APP_KEY')),
    'super_admin_public_ids' => array_values(array_filter(array_map('trim', explode(',', (string) env('AI_LMS_SUPER_ADMIN_PUBLIC_IDS', ''))))),
    'otp' => ['driver' => env('AI_LMS_OTP_DRIVER', 'log'), 'ttl_minutes' => (int) env('AI_LMS_OTP_TTL_MINUTES', 5), 'max_attempts' => (int) env('AI_LMS_OTP_MAX_ATTEMPTS', 5)],
];

