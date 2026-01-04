<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Culinary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    /**
     * Ambil ulasan yang sudah di-approve untuk hidangan spesifik
     */
    public function index($culinary_id)
    {
        try {
            $reviews = Review::with('user')
                ->where('culinary_id', $culinary_id)
                ->where('status', 'approved')
                ->latest()
                ->get();

            return response()->json([
                'success' => true,
                'data' => $reviews
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil ulasan'
            ], 500);
        }
    }

    /**
     * Simpan ulasan baru (Wajib Login & Status Pending)
     */
    public function store(Request $request)
    {
        \Log::info('Review store request:', [
            'user_id' => $request->user()?->id,
            'culinary_id' => $request->culinary_id,
            'rating' => $request->rating,
            'comment_length' => strlen($request->comment ?? '')
        ]);

        // PERBAIKAN: Validasi manual agar pesan error lebih akurat
        $validator = Validator::make($request->all(), [
            'culinary_id' => 'required|integer',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:5',
        ]);

        if ($validator->fails()) {
            \Log::warning('Review validation failed:', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'message' => 'Data tidak lengkap atau format salah.',
                'errors' => $validator->errors()
            ], 422);
        }

        // Cek apakah kuliner beneran ada di DB
        $culinary = Culinary::find((int)$request->culinary_id);
        if (!$culinary) {
            \Log::warning('Culinary not found:', ['culinary_id' => $request->culinary_id]);
            return response()->json([
                'success' => false,
                'message' => 'Maaf, menu kuliner ini tidak ditemukan di database kami.'
            ], 404);
        }

        try {
            $review = Review::create([
                'user_id' => $request->user()->id, 
                'culinary_id' => (int)$request->culinary_id,
                'rating' => (int)$request->rating,
                'comment' => $request->comment,
                'status' => 'pending', 
            ]);

            \Log::info('Review created successfully:', ['review_id' => $review->id, 'culinary_id' => $review->culinary_id]);

            return response()->json([
                'success' => true,
                'message' => 'Ulasan Terkirim, dalam tinjauan admin. Terima kasih!'
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Review creation failed:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan ulasan. Silakan coba lagi.'
            ], 500);
        }
    }

    public function adminIndex()
    {
        $reviews = Review::with(['user', 'culinary'])->latest()->get();
        return response()->json(['success' => true, 'data' => $reviews]);
    }

    public function updateStatus(Request $request, $id)
    {
        try {
            $review = Review::findOrFail($id);
            $oldStatus = $review->status;
            $review->update(['status' => $request->status]);

            \Log::info('Review status updated:', [
                'review_id' => $id,
                'old_status' => $oldStatus,
                'new_status' => $request->status,
                'culinary_id' => $review->culinary_id
            ]);

            // Jika status berubah menjadi 'approved', update rating culinary
            if ($request->status === 'approved' && $oldStatus !== 'approved') {
                $this->updateCulinaryRating($review->culinary_id);
            }

            // Jika status berubah dari 'approved' ke lain, update rating culinary
            if ($oldStatus === 'approved' && $request->status !== 'approved') {
                $this->updateCulinaryRating($review->culinary_id);
            }

            return response()->json(['success' => true, 'message' => 'Status ulasan berhasil diperbarui']);
        } catch (\Exception $e) {
            \Log::error('Update status failed:', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Gagal memperbarui status'], 500);
        }
    }

    /**
     * Hitung dan update rating kuliner berdasarkan ulasan yang approved
     */
    private function updateCulinaryRating($culinary_id)
    {
        try {
            $culinary = Culinary::find($culinary_id);
            if (!$culinary) return;

            // Hitung rata-rata rating dari review yang approved
            $avgRating = Review::where('culinary_id', $culinary_id)
                ->where('status', 'approved')
                ->avg('rating');

            // Update field rating di culinary
            $culinary->update([
                'rating' => $avgRating ?? 0
            ]);

            \Log::info('Culinary rating updated:', [
                'culinary_id' => $culinary_id,
                'new_rating' => $avgRating ?? 0
            ]);
        } catch (\Exception $e) {
            \Log::error('Rating update failed:', ['error' => $e->getMessage()]);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $review = Review::findOrFail($id);

            // Pastikan hanya admin yang bisa update
            if ($request->user()->role !== 'admin') {
                \Log::warning('Unauthorized update attempt', ['user_id' => $request->user()->id, 'role' => $request->user()->role]);
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            \Log::info('Attempting to update review', ['review_id' => $id, 'data' => $request->all()]);

            $validator = Validator::make($request->all(), [
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'required|string|min:5',
                'status' => 'required|in:pending,approved,rejected'
            ]);

            if ($validator->fails()) {
                \Log::warning('Validation failed for review update', ['errors' => $validator->errors()->toArray()]);
                return response()->json(['success' => false, 'message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
            }

            $oldStatus = $review->status;
            $review->update([
                'rating' => (int)$request->rating,
                'comment' => $request->comment,
                'status' => $request->status
            ]);

            \Log::info('Review updated successfully', ['review_id' => $id, 'old_status' => $oldStatus, 'new_status' => $request->status]);

            // Update rating jika status berubah menjadi approved atau dari approved
            if ($request->status === 'approved' || $oldStatus === 'approved') {
                $this->updateCulinaryRating($review->culinary_id);
            }

            return response()->json(['success' => true, 'message' => 'Ulasan berhasil diperbarui']);
        } catch (\Exception $e) {
            \Log::error('Review update error', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['success' => false, 'message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        $review = Review::findOrFail($id);
        $culinary_id = $review->culinary_id;
        $wasApproved = $review->status === 'approved';

        $review->delete();

        // Jika review yang dihapus adalah approved, update rating
        if ($wasApproved) {
            $this->updateCulinaryRating($culinary_id);
        }

        return response()->json(['success' => true, 'message' => 'Ulasan berhasil dihapus']);
    }
}