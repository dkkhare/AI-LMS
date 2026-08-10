<?php
namespace App\Contracts;
interface OtpSender { public function send(string $channel, string $destination, string $otp, string $purpose): void; }

