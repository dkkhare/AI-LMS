<?php
namespace App\Models;use Illuminate\Database\Eloquent\Model;class TenantMembership extends Model{protected $fillable=['public_id','tenant_id','user_id','role_code','status','assigned_by','approved_at'];protected function casts():array{return['approved_at'=>'datetime'];}}
