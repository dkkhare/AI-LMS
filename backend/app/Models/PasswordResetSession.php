<?php
namespace App\Models;use Illuminate\Database\Eloquent\Model;
class PasswordResetSession extends Model{protected $fillable=['public_id','user_id','session_token_hash','reset_token_hash','email_verified_at','phone_verified_at','expires_at','reset_token_expires_at','consumed_at','request_ip'];protected $hidden=['session_token_hash','reset_token_hash'];protected function casts():array{return['email_verified_at'=>'datetime','phone_verified_at'=>'datetime','expires_at'=>'datetime','reset_token_expires_at'=>'datetime','consumed_at'=>'datetime'];}}
