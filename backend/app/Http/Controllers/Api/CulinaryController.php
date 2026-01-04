<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Culinary;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class CulinaryController extends Controller
{
    /**
     * Helper: Ensure data is array
     */
    private function ensureArray($data)
    {
        if (is_array($data)) {
            return array_filter($data, fn($item) => !empty(trim((string)$item)));
        }
        if (is_string($data)) {
            $decoded = json_decode($data, true);
            if (is_array($decoded)) {
                return array_filter($decoded, fn($item) => !empty(trim((string)$item)));
            }
        }
        return [];
    }

    /**
     * Tampilan Publik (Homepage) - Hanya yang Published
     */
    public function index()
    {
        $data = Culinary::where('status', 'published')->latest()->get();
        return response()->json(['success' => true, 'data' => $data]);
    }

    /**
     * Tampilan Khusus UMKM - Hanya milik dia sendiri
     */
    public function myCulinaries(Request $request)
    {
        $data = Culinary::where('user_id', $request->user()->id)->latest()->get();
        return response()->json(['success' => true, 'data' => $data]);
    }

    /**
     * Tampilan Khusus Admin - Semua kuliner dari semua UMKM
     */
    public function adminIndex()
    {
        $data = Culinary::with('user')->latest()->get();
        return response()->json(['success' => true, 'data' => $data]);
    }

    /**
     * Simpan Kuliner Baru
     */
    public function store(Request $request)
    {
        try {
            // Log request data untuk debug
            \Log::info('========== STORE CULINARY REQUEST ==========');
            \Log::info('User ID: ' . ($request->user()?->id ?? 'NO USER'));
            \Log::info('Request Headers: ' . json_encode($request->headers->all()));
            \Log::info('Request Body: ' . json_encode($request->all()));

            $validator = Validator::make($request->all(), [
                'nama' => 'required|string|max:255',
                'kategori' => 'required|string',
                'deskripsi_ringkas' => 'required|string|max:255',
                'deskripsi_lengkap' => 'required|string',
                'provinsi' => 'required|string',
                'kota' => 'required|string',
                'harga_min' => 'required|numeric',
                'harga_max' => 'required|numeric',
                'bahan' => 'required|array',
                'langkah' => 'required|array',
                'images' => 'required|array', // Menerima array URL foto
                'google_maps_link' => 'nullable|url',
                'shopee_food_link' => 'nullable|url',
                'grabfood_link' => 'nullable|url',
                'gofood_link' => 'nullable|url',
            ]);

            if ($validator->fails()) {
                \Log::warning('Validation Error: ' . json_encode($validator->errors()->toArray()));
                return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
            }

            // Debug: Check user authentication
            if (!$request->user()) {
                \Log::error('Unauthorized - No user found');
                return response()->json(['success' => false, 'message' => 'Unauthorized - No user found'], 401);
            }

            $user = $request->user();
            \Log::info('User Info: ' . json_encode(['id' => $user->id, 'email' => $user->email, 'role' => $user->role]));

            $culinary = Culinary::create([
                'user_id' => $user->id,
                'nama' => $request->nama,
                'slug' => Str::slug($request->nama) . '-' . Str::random(5),
                'kategori' => $request->kategori,
                'deskripsi_ringkas' => $request->deskripsi_ringkas,
                'deskripsi_lengkap' => $request->deskripsi_lengkap,
                'provinsi' => $request->provinsi,
                'kota' => $request->kota,
                'harga_min' => (int)$request->harga_min,
                'harga_max' => (int)$request->harga_max,
                'bahan' => $this->ensureArray($request->bahan),
                'langkah' => $this->ensureArray($request->langkah),
                'images' => $this->ensureArray($request->images),
                'status' => 'published',
                'google_maps_link' => $request->google_maps_link,
                'shopee_food_link' => $request->shopee_food_link,
                'grabfood_link' => $request->grabfood_link,
                'gofood_link' => $request->gofood_link,
            ]);

            \Log::info('Store Culinary Success: ' . json_encode(['culinary_id' => $culinary->id]));
            return response()->json(['success' => true, 'message' => 'Kuliner berhasil diterbitkan!', 'data' => $culinary]);
        } catch (\Exception $e) {
            \Log::error('========== STORE CULINARY ERROR ==========');
            \Log::error('Message: ' . $e->getMessage());
            \Log::error('File: ' . $e->getFile() . ' Line: ' . $e->getLine());
            \Log::error('Trace: ' . $e->getTraceAsString());
            return response()->json(['success' => false, 'message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update Kuliner
     */
    public function update(Request $request, $id)
    {
        $culinary = Culinary::findOrFail($id);

        // Pastikan hanya pemilik yang bisa update
        if ($culinary->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'nama' => 'required|string|max:255',
            'kategori' => 'required|string',
            'deskripsi_ringkas' => 'required|string|max:255',
            'deskripsi_lengkap' => 'required|string',
            'provinsi' => 'required|string',
            'kota' => 'required|string',
            'harga_min' => 'required|numeric',
            'harga_max' => 'required|numeric',
            'bahan' => 'required|array',
            'langkah' => 'required|array',
            'images' => 'required|array',
            'google_maps_link' => 'nullable|url',
            'shopee_food_link' => 'nullable|url',
            'grabfood_link' => 'nullable|url',
            'gofood_link' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $culinary->update([
            'nama' => $request->nama,
            'slug' => Str::slug($request->nama) . '-' . Str::random(5),
            'kategori' => $request->kategori,
            'deskripsi_ringkas' => $request->deskripsi_ringkas,
            'deskripsi_lengkap' => $request->deskripsi_lengkap,
            'provinsi' => $request->provinsi,
            'kota' => $request->kota,
            'harga_min' => (int)$request->harga_min,
            'harga_max' => (int)$request->harga_max,
            'bahan' => $this->ensureArray($request->bahan),
            'langkah' => $this->ensureArray($request->langkah),
            'images' => $this->ensureArray($request->images),
            'google_maps_link' => $request->google_maps_link,
            'shopee_food_link' => $request->shopee_food_link,
            'grabfood_link' => $request->grabfood_link,
            'gofood_link' => $request->gofood_link,
        ]);

        return response()->json(['success' => true, 'message' => 'Kuliner berhasil diperbarui!', 'data' => $culinary]);
    }
    public function show($id)
    {
        $culinary = Culinary::where('id', $id)->orWhere('slug', $id)->first();
        
        if (!$culinary) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        }

        return response()->json(['success' => true, 'data' => $culinary]);
    }

    public function destroy($id)
    {
        $culinary = Culinary::findOrFail($id);
        $culinary->delete();
        return response()->json(['success' => true, 'message' => 'Berhasil dihapus']);
    }
}