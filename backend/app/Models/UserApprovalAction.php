<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class UserApprovalAction extends Model { public $timestamps=false; protected $fillable=['user_approval_request_id','actor_user_id','action','from_status','to_status','comments','created_at']; protected function casts(): array{return ['created_at'=>'datetime'];} }

