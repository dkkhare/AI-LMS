<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller; use App\Models\User; use App\Services\ContactIdentity; use Illuminate\Http\JsonResponse; use Illuminate\Http\Request; use Illuminate\Support\Facades\Hash;
class AuthController extends Controller
{
 public function login(Request $request, ContactIdentity $identity): JsonResponse { $data=$request->validate(['email'=>'required|email','password'=>'required|string']);$email=$identity->email($data['email']);$user=User::where('email_hash',$email['hash'])->first();abort_unless($user&&$user->password&&Hash::check($data['password'],$user->password),422,'The supplied credentials are invalid.');abort_unless(in_array($user->status,['active','pending_activation'],true),403,'This account is not active.');abort_unless($user->isSuperAdministrator(),403,'Super administrator access is required.');$user->update(['last_login_at'=>now(),'last_activity_at'=>now(),'failed_login_count'=>0]);return response()->json(['token'=>$user->createToken('admin-web')->plainTextToken,'user'=>$user]); }
 public function logout(Request $request): JsonResponse { $request->user()->currentAccessToken()?->delete();return response()->json(['message'=>'Signed out.']); }
}
