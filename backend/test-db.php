<?php
require __DIR__ . '/vendor/autoload.php';

// Create app instance
$app = require_once __DIR__ . '/bootstrap/app.php';

// Run the application
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Query users
$users = \Illuminate\Support\Facades\DB::table('users')
    ->select('id', 'email', 'name', 'role', 'is_verified')
    ->limit(5)
    ->get();

echo "=== Users in Database ===\n";
foreach ($users as $user) {
    echo "ID: {$user->id}, Email: {$user->email}, Name: {$user->name}, Role: {$user->role}, Verified: {$user->is_verified}\n";
}

// Check culinaries count
$count = \Illuminate\Support\Facades\DB::table('culinaries')->count();
echo "\n=== Culinaries Count: $count ===\n";

// Check errors
$errors = \Illuminate\Support\Facades\DB::table('culinaries')
    ->orderByDesc('created_at')
    ->limit(3)
    ->get();

if (count($errors) > 0) {
    echo "\n=== Last 3 Culinaries ===\n";
    foreach ($errors as $item) {
        echo "ID: {$item->id}, Nama: {$item->nama}, User: {$item->user_id}, Created: {$item->created_at}\n";
    }
}
