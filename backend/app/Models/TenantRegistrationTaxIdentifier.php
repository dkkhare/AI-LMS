<?php
namespace App\Models;use Illuminate\Database\Eloquent\Model;class TenantRegistrationTaxIdentifier extends Model{protected $fillable=['identifier_type','country_code','identifier_encrypted','identifier_hash','masked_value','registered_legal_name','verification_status'];protected $hidden=['identifier_encrypted','identifier_hash'];}
