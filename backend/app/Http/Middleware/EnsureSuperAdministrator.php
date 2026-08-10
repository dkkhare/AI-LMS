<?php
namespace App\Http\Middleware;
use Closure; use Illuminate\Http\Request; use Symfony\Component\HttpFoundation\Response;
class EnsureSuperAdministrator { public function handle(Request $request, Closure $next): Response { abort_unless($request->user()?->isSuperAdministrator(),403,'Super administrator approval is required.'); return $next($request); } }

