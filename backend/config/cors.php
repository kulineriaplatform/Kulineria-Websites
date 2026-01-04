<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'register', 'logout'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:80', 'http://localhost'],
    'allowed_origins_patterns' => [
        '#^https://.*\.ngrok-free\.dev$#',  // Izinkan semua ngrok domain
        '#^https://.*\.ngrok\.io$#',        // Izinkan ngrok.io juga
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true, // WAJIB TRUE
];