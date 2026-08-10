<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
class UserApprovalRequest extends Model
{
    protected $fillable=['public_id','subject_user_id','requested_by','required_approver_level','status','submitted_at','decided_at','decided_by','decision_reason'];
    protected function casts(): array { return ['submitted_at'=>'datetime','decided_at'=>'datetime']; }
    public function actions(): HasMany { return $this->hasMany(UserApprovalAction::class); }
}

