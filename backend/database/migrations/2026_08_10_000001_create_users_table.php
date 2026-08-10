<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
 public function up(): void { Schema::create('users', function(Blueprint $table){
  $table->id(); $table->char('public_id',26)->unique(); $table->string('identity_region',30);
  $table->string('first_name',100); $table->string('middle_name',100)->nullable(); $table->string('last_name',100)->nullable(); $table->string('display_name',200);
  $table->binary('email_encrypted'); $table->char('email_hash',64)->unique(); $table->string('email_masked',254);
  $table->binary('phone_encrypted'); $table->char('phone_hash',64)->unique(); $table->string('phone_masked',30);
  $table->string('password')->nullable(); $table->string('status',30)->default('pending_verification')->index(); $table->string('account_type',30)->default('human');
  $table->string('preferred_language',10)->default('en'); $table->string('timezone',50)->default('UTC');
  $table->dateTime('email_verified_at',6)->nullable(); $table->dateTime('phone_verified_at',6)->nullable(); $table->boolean('mfa_required')->default(false); $table->dateTime('mfa_enabled_at',6)->nullable();
  $table->boolean('must_change_password')->default(false); $table->dateTime('password_changed_at',6)->nullable(); $table->dateTime('temporary_password_expires_at',6)->nullable(); $table->unsignedInteger('credentials_version')->default(1);
  $table->unsignedSmallInteger('failed_login_count')->default(0); $table->dateTime('locked_until',6)->nullable(); $table->dateTime('last_login_at',6)->nullable(); $table->binary('last_login_ip')->nullable();
  $table->string('registered_via',30); $table->unsignedBigInteger('created_by')->nullable(); $table->unsignedBigInteger('updated_by')->nullable();
  $table->dateTime('registration_started_at',6); $table->dateTime('registration_completed_at',6)->nullable(); $table->dateTime('verification_expires_at',6)->nullable(); $table->dateTime('activated_at',6)->nullable(); $table->string('activation_method',30)->nullable();
  $table->dateTime('suspended_at',6)->nullable(); $table->unsignedBigInteger('suspended_by')->nullable(); $table->string('suspension_reason',500)->nullable(); $table->dateTime('last_activity_at',6)->nullable();
  $table->timestamps(6); $table->softDeletes('deleted_at',6); $table->index(['identity_region','status']); $table->index('last_activity_at');
 }); }
 public function down(): void { Schema::dropIfExists('users'); }
};

