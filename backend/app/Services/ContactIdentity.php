<?php
namespace App\Services;
use Illuminate\Support\Facades\Crypt;
final class ContactIdentity
{
    public function email(string $value): array
    {
        $normalized = mb_strtolower(trim($value));
        return ['encrypted' => Crypt::encryptString($normalized), 'hash' => $this->hash($normalized), 'masked' => preg_replace('/(^.).*(@.*$)/', '$1***$2', $normalized)];
    }
    public function phone(string $value): array
    {
        $normalized = preg_replace('/[^+0-9]/', '', trim($value));
        return ['encrypted' => Crypt::encryptString($normalized), 'hash' => $this->hash($normalized), 'masked' => substr($normalized, 0, min(3, strlen($normalized))).' ******'.substr($normalized, -4)];
    }
    private function hash(string $value): string
    {
        $key = (string) config('ai_lms.identity_hmac_key');
        if ($key === '') throw new \RuntimeException('AI_LMS_IDENTITY_HMAC_KEY is not configured.');
        return hash_hmac('sha256', $value, $key);
    }
}

