<?php
namespace Tests\Feature;
use App\Models\User; use App\Models\UserApprovalRequest; use Illuminate\Foundation\Testing\RefreshDatabase; use Illuminate\Support\Str; use Laravel\Sanctum\Sanctum; use Tests\TestCase;
class UserApprovalTest extends TestCase
{
 use RefreshDatabase;
 private function user(array $overrides=[]): User {return User::create(array_merge(['public_id'=>(string)Str::ulid(),'identity_region'=>'ap-south-1','first_name'=>'Test','display_name'=>'Test User','email_encrypted'=>'encrypted','email_hash'=>hash('sha256',Str::random()),'email_masked'=>'t***@example.com','phone_encrypted'=>'encrypted','phone_hash'=>hash('sha256',Str::random()),'phone_masked'=>'+91 ******1234','status'=>'pending_approval','registered_via'=>'self','registration_started_at'=>now()],$overrides));}
 public function test_super_admin_can_approve_verified_user(): void {$admin=$this->user(['status'=>'active']);config(['ai_lms.super_admin_public_ids'=>[$admin->public_id]]);$candidate=$this->user(['email_verified_at'=>now(),'phone_verified_at'=>now()]);UserApprovalRequest::create(['public_id'=>(string)Str::ulid(),'subject_user_id'=>$candidate->id,'required_approver_level'=>'super_admin','status'=>'pending','submitted_at'=>now()]);Sanctum::actingAs($admin);$this->postJson('/api/v1/admin/users/'.$candidate->public_id.'/approve')->assertOk()->assertJsonPath('data.status','active');$this->assertDatabaseHas('user_approval_requests',['subject_user_id'=>$candidate->id,'status'=>'approved']);}
 public function test_non_super_admin_is_forbidden(): void {$user=$this->user(['status'=>'active']);Sanctum::actingAs($user);$this->getJson('/api/v1/admin/users')->assertForbidden();}
 public function test_email_and_mobile_hashes_are_unique(): void {$this->user(['email_hash'=>str_repeat('a',64),'phone_hash'=>str_repeat('b',64)]);$this->expectException(\Illuminate\Database\UniqueConstraintViolationException::class);$this->user(['email_hash'=>str_repeat('a',64)]);}
}

