<?php
namespace App\Console\Commands;
use App\Models\User; use App\Services\ContactIdentity; use Illuminate\Console\Command; use Illuminate\Support\Str;
class BootstrapSuperAdmins extends Command
{
 protected $signature='ai-lms:bootstrap-super-admins {--admin1-name=} {--admin1-email=} {--admin1-phone=} {--admin2-name=} {--admin2-email=} {--admin2-phone=} {--region=ap-south-1}';
 protected $description='Create the two installation-authorized bootstrap super administrators';
 public function handle(ContactIdentity $identity): int
 {
  if(User::where('activation_method','bootstrap_installation')->exists()){ $this->error('Bootstrap administrators already exist.'); return self::FAILURE; }
  $records=[];
  foreach([1,2] as $number){$name=(string)$this->option("admin{$number}-name");$email=(string)$this->option("admin{$number}-email");$phone=(string)$this->option("admin{$number}-phone");if(!$name||!filter_var($email,FILTER_VALIDATE_EMAIL)||!preg_match('/^\+[1-9][0-9]{7,14}$/',$phone)){ $this->error("Valid name, email and E.164 phone are required for administrator {$number}."); return self::INVALID; }$records[]=compact('name','email','phone');}
  if($records[0]['email']===$records[1]['email']||$records[0]['phone']===$records[1]['phone']){$this->error('The two administrators must be distinct people.');return self::INVALID;}
  $created=[];
  foreach($records as $record){$email=$identity->email($record['email']);$phone=$identity->phone($record['phone']);$password=Str::password(20);$user=User::create(['public_id'=>(string)Str::ulid(),'identity_region'=>$this->option('region'),'first_name'=>$record['name'],'display_name'=>$record['name'],'email_encrypted'=>$email['encrypted'],'email_hash'=>$email['hash'],'email_masked'=>$email['masked'],'phone_encrypted'=>$phone['encrypted'],'phone_hash'=>$phone['hash'],'phone_masked'=>$phone['masked'],'password'=>$password,'status'=>'pending_activation','registered_via'=>'system','registration_started_at'=>now(),'registration_completed_at'=>now(),'email_verified_at'=>now(),'phone_verified_at'=>now(),'mfa_required'=>true,'must_change_password'=>true,'temporary_password_expires_at'=>now()->addHour(),'activated_at'=>now(),'activation_method'=>'bootstrap_installation']);$created[]=[$user->public_id,$record['email'],$password];}
  $this->warn('Store these one-time credentials securely. They will not be shown again.');$this->table(['Public ID','Email','One-time password'],$created);$this->line('Set AI_LMS_SUPER_ADMIN_PUBLIC_IDS to both comma-separated Public IDs, then configure MFA and change both passwords.');return self::SUCCESS;
 }
}

