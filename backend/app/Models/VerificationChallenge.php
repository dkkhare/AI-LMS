<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class VerificationChallenge extends Model
{
    protected $fillable=['public_id','user_id','channel','purpose','destination_hash','otp_hash','status','expires_at','maximum_attempts','attempt_count','sent_count','last_sent_at','request_ip'];
    protected function casts(): array { return ['expires_at'=>'datetime','verified_at'=>'datetime','invalidated_at'=>'datetime','last_sent_at'=>'datetime']; }
}

