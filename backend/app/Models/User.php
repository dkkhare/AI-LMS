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
    protected $fillable = ['public_id','identity_region','first_name','middle_name','last_name','display_name','email_encrypted','email_hash','email_masked','phone_encrypted','phone_hash','phone_masked','password','status','account_type','preferred_language','timezone','email_verified_at','phone_verified_at','mfa_required','must_change_password','password_changed_at','temporary_password_expires_at','credentials_version','failed_login_count','locked_until','last_login_at','last_activity_at','registered_via','registration_started_at','registration_completed_at','verification_expires_at','activated_at','activation_method','suspended_at','suspended_by','suspension_reason','created_by','updated_by'];
    protected $hidden = ['email_encrypted','email_hash','phone_encrypted','phone_hash','password','remember_token'];
    protected function casts(): array { return ['email_verified_at'=>'datetime','phone_verified_at'=>'datetime','registration_started_at'=>'datetime','registration_completed_at'=>'datetime','verification_expires_at'=>'datetime','activated_at'=>'datetime','suspended_at'=>'datetime','last_activity_at'=>'datetime','must_change_password'=>'boolean','mfa_required'=>'boolean','password'=>'hashed']; }
    public function uniqueIds(): array { return ['public_id']; }
    public function getRouteKeyName(): string { return 'public_id'; }
    public function approvalRequests(): HasMany { return $this->hasMany(UserApprovalRequest::class, 'subject_user_id'); }
    public function tenantMemberships(): HasMany { return $this->hasMany(TenantMembership::class); }
    public function isTenantAdministrator(): bool { return $this->tenantMemberships()->where('role_code','tenant_admin')->where('status','active')->exists(); }
    public function isSuperAdministrator(): bool { return in_array($this->public_id, config('ai_lms.super_admin_public_ids'), true); }
}
