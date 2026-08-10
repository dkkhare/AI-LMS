<?php
use App\Http\Controllers\Api\V1\AdminTenantRegistrationController;use App\Http\Controllers\Api\V1\AdminUserController;use App\Http\Controllers\Api\V1\AuthController;use App\Http\Controllers\Api\V1\TenantRegistrationController;use App\Http\Controllers\Api\V1\VerificationController;use Illuminate\Support\Facades\Route;
Route::prefix('v1')->group(function(){
 Route::post('tenant-registrations',[TenantRegistrationController::class,'store'])->middleware('throttle:3,60');
 Route::post('tenant-registrations/{registration}/verify',[TenantRegistrationController::class,'verify'])->middleware('throttle:10,1');
 Route::post('auth/login',[AuthController::class,'login'])->middleware('throttle:5,1');
 Route::post('auth/logout',[AuthController::class,'logout'])->middleware('auth:sanctum');
 Route::middleware(['auth:sanctum','super_admin'])->prefix('admin')->group(function(){
  Route::get('users',[AdminUserController::class,'index']); Route::post('users',[AdminUserController::class,'store']);
  Route::post('users/{user}/approve',[AdminUserController::class,'approve']); Route::post('users/{user}/reject',[AdminUserController::class,'reject']); Route::post('users/{user}/suspend',[AdminUserController::class,'suspend']); Route::post('users/{user}/reactivate',[AdminUserController::class,'reactivate']);
  Route::post('users/{user}/verification/send',[VerificationController::class,'send']); Route::post('users/{user}/verification/verify',[VerificationController::class,'verify']);
  Route::get('tenant-registrations',[AdminTenantRegistrationController::class,'index']);Route::post('tenant-registrations/{registration}/approve',[AdminTenantRegistrationController::class,'approve']);Route::post('tenant-registrations/{registration}/reject',[AdminTenantRegistrationController::class,'reject']);
 });
});
