# Script untuk test API Kuliner

$baseUrl = "http://127.0.0.1:8000"
$apiUrl = "$baseUrl/api"

# Step 1: Register UMKM
Write-Host "=== STEP 1: Register UMKM ===" -ForegroundColor Cyan
$timestamp = Get-Date -Format 'HHmmss'
$randomNum = Get-Random
$registerPayload = @{
    name = "Test UMKM $timestamp"
    email = "test$randomNum@example.com"
    password = "password123456"
    nama_usaha = "Toko Test"
    nik_ktp = "1234567890123456"
    kategori_usaha = "Makanan"
} | ConvertTo-Json

Write-Host "Register Payload: $registerPayload"

$registerResponse = Invoke-WebRequest -Uri "$apiUrl/register/umkm" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $registerPayload `
    -UseBasicParsing `
    -ErrorAction Stop

$registerData = $registerResponse.Content | ConvertFrom-Json
Write-Host "Register Status: $($registerResponse.StatusCode)"
Write-Host "Register Response: $($registerData | ConvertTo-Json -Depth 3)"

# Step 2: Use token dari register response
if ($registerData.success) {
    Write-Host "`n=== STEP 2: Create Kuliner ===" -ForegroundColor Cyan
    $token = $registerData.token
    Write-Host "Token: $token"

    $kulinariPayload = @{
        nama = "Sate Ayam Test $timestamp"
        kategori = "Makanan"
        deskripsi_ringkas = "Sate ayam lezat"
        deskripsi_lengkap = "Sate ayam yang dipanggang dengan bumbu spesial dari resep keluarga"
        provinsi = "Jawa Barat"
        kota = "Bandung"
        harga_min = 10000
        harga_max = 25000
        bahan = @("Ayam 500g", "Bumbu sate", "Tusuk sate")
        langkah = @("Potong ayam menjadi potongan kecil", "Tusuk dengan tusuk sate", "Panggang hingga matang")
        images = @("https://via.placeholder.com/300x200?text=Sate+Ayam")
        google_maps_link = ""
        shopee_food_link = ""
        grabfood_link = ""
        gofood_link = ""
    } | ConvertTo-Json -Depth 5

    Write-Host "Kuliner Payload: $kulinariPayload`n"

    try {
        $kulinariResponse = Invoke-WebRequest -Uri "$apiUrl/culinaries" `
            -Method POST `
            -Headers @{
                "Content-Type" = "application/json"
                "Authorization" = "Bearer $token"
            } `
            -Body $kulinariPayload `
            -UseBasicParsing `
            -ErrorAction Stop

        Write-Host "Kuliner Status: $($kulinariResponse.StatusCode)" -ForegroundColor Green
        $kulinariData = $kulinariResponse.Content | ConvertFrom-Json
        Write-Host "Kuliner Response: $($kulinariData | ConvertTo-Json -Depth 3)" -ForegroundColor Green
    } catch {
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Response: $($_.Exception.Response.Content)" -ForegroundColor Red
    }
} else {
    Write-Host "Register gagal: $($registerData.message)" -ForegroundColor Red
}
