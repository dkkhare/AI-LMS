<?php
namespace App\Models;use Illuminate\Database\Eloquent\Model;class TenantRegistrationDocument extends Model{protected $fillable=['document_type','document_number_encrypted','document_number_hash','masked_number','issuing_country_code','verification_status'];protected $hidden=['document_number_encrypted','document_number_hash'];}
