<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasUlids, Notifiable, SoftDeletes;
    protected $fillable = ['public_id','identity_region','first_name','middle_name','last_name','display_name','email_encrypted','email_hash','email_masked','phone_encrypted','phone_hash','phone_masked','password','status','account_type','preferred_language','timezone','registered_via','registration_started_at','verification_expires_at','created_by'];
    protected $hidden = ['email_encrypted','email_hash','phone_encrypted','phone_hash','password','remember_token'];
    protected function casts(): array { return ['email_verified_at'=>'datetime','phone_verified_at'=>'datetime','registration_started_at'=>'datetime','registration_completed_at'=>'datetime','verification_expires_at'=>'datetime','activated_at'=>'datetime','suspended_at'=>'datetime','last_activity_at'=>'datetime','must_change_password'=>'boolean','mfa_required'=>'boolean','password'=>'hashed']; }
    public function uniqueIds(): array { return ['public_id']; }
    public function getRouteKeyName(): string { return 'public_id'; }
    public function approvalRequests(): HasMany { return $this->hasMany(UserApprovalRequest::class, 'subject_user_id'); }
    public function isSuperAdministrator(): bool { return in_array($this->public_id, config('ai_lms.super_admin_public_ids'), true); }
}

