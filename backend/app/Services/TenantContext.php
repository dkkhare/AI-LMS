<?php
namespace App\Services;
use App\Models\Tenant;use App\Models\User;use Illuminate\Http\Request;
class TenantContext
{
 public function forAdministrator(Request $request):Tenant{$memberships=$request->user()->tenantMemberships()->with('tenant')->where('role_code','tenant_admin')->where('status','active')->get();abort_if($memberships->isEmpty(),403,'No active tenant assignment.');$requested=(string)($request->header('X-Tenant-ID')?:$request->input('tenant_public_id'));if($requested){$membership=$memberships->first(fn($m)=>$m->tenant?->public_id===$requested);abort_unless($membership,403,'You are not assigned to this tenant.');return $membership->tenant;}abort_if($memberships->count()>1,422,'X-Tenant-ID is required when you administer more than one tenant.');return $memberships->first()->tenant;}
 public function assertTeacher(Tenant $tenant,User $user):void{abort_unless($user->tenantMemberships()->where('tenant_id',$tenant->id)->where('role_code','teacher')->exists(),404);}
}
