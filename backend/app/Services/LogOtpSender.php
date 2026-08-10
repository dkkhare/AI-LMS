<?php
namespace App\Services;
use App\Contracts\OtpSender;
use Illuminate\Support\Facades\Log;
final class LogOtpSender implements OtpSender
{
    public function send(string $channel, string $destination, string $otp, string $purpose): void
    {
        if (! app()->isLocal() && ! app()->runningUnitTests()) throw new \RuntimeException('Configure a production OTP sender.');
        Log::notice('LOCAL TEST OTP', compact('channel', 'destination', 'otp', 'purpose'));
    }
}

