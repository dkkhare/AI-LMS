<?php
namespace App\Services;use Illuminate\Support\Facades\Crypt;final class SensitiveIdentifier{public function protect(string $value):array{$v=strtoupper(preg_replace('/\s+/','',trim($value)));return['encrypted'=>Crypt::encryptString($v),'hash'=>hash_hmac('sha256',$v,(string)config('ai_lms.identity_hmac_key')),'masked'=>substr($v,0,3).str_repeat('*',max(3,strlen($v)-5)).substr($v,-2)];}}
