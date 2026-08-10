<?php
namespace App\Providers;
use App\Contracts\OtpSender;
use App\Services\LogOtpSender;
use Illuminate\Support\ServiceProvider;
class AppServiceProvider extends ServiceProvider
{
    public function register(): void { $this->app->bind(OtpSender::class, LogOtpSender::class); }
    public function boot(): void {}
}

