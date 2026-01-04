"use client"

import { useState, useEffect } from "react"
import { 
  Check, 
  X, 
  Star, 
  MessageSquare, 
  Search, 
  Trash2,
  AlertCircle,
  Clock,
  Edit,
  Save
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { fetchFromApi, postToApi, putToApi, deleteToApi } from "@/lib/data"

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ rating: 0, comment: "", status: "" })
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    setLoading(true)
    const res = await fetchFromApi<any[]>("/admin/reviews")
    setReviews(res || [])
    setLoading(false)
  }

  const handleStatusChange = async (id: number, status: string) => {
    const res = await postToApi(`/admin/reviews/${id}/status`, { status })
    if (res.success) {
      setErrorMsg("")
      loadReviews() // Reload data setelah update
    } else {
      setErrorMsg("Gagal update status ulasan: " + (res.message || "Unknown error"))
    }
  }

  const handleEdit = (review: any) => {
    setEditingId(review.id)
    setEditForm({
      rating: review.rating,
      comment: review.comment,
      status: review.status
    })
  }

  const handleSaveEdit = async () => {
    if (!editingId) return

    // Validate before sending
    if (editForm.rating < 1 || editForm.rating > 5) {
      setErrorMsg("Rating harus antara 1-5")
      return
    }
    if (editForm.comment.trim().length < 5) {
      setErrorMsg("Komentar harus minimal 5 karakter")
      return
    }

    setErrorMsg("")
    console.log("Saving edit with data:", editForm)
    
    const res = await putToApi(`/admin/reviews/${editingId}`, editForm)
    console.log("Response from server:", res)
    
    if (res.success) {
      setEditingId(null)
      setErrorMsg("")
      loadReviews()
    } else {
      const errorText = res.message || "Gagal update ulasan"
      setErrorMsg(errorText)
      console.error("Update failed:", res)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Hapus ulasan ini?")) {
      const res = await deleteToApi(`/admin/reviews/${id}`)
      if (res.success) {
        setErrorMsg("")
        loadReviews()
      } else {
        setErrorMsg("Gagal hapus ulasan: " + (res.message || "Unknown error"))
      }
    }
  }

  const filtered = reviews.filter(rev => 
    rev.culinary?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rev.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rev.comment.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="p-10 text-center font-serif text-[#a64029]">Menarik Ulasan Visitor...</div>

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare className="text-[#a64029]" />
            Moderasi Ulasan
          </h2>
          <p className="text-gray-500 text-sm mt-1">Tinjau ulasan masuk. Hanya status 'Approved' yang tampil di halaman kuliner.</p>
        </div>
        <Badge className="bg-yellow-50 text-yellow-700 h-10 px-4 rounded-xl border border-yellow-200 gap-2 font-bold">
          <Clock size={16} /> {reviews.filter(r => r.status === 'pending').length} Perlu Tinjauan
        </Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Cari makanan, pengulas, atau kata kunci..."
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#a64029] outline-none shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg("")} className="ml-auto text-red-500 hover:text-red-700">
            <X size={18} />
          </button>
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((rev) => (
          <Card key={rev.id} className="p-6 bg-white border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <Badge className="bg-[#dfaf2b] text-[#3b2f2f] hover:bg-[#dfaf2b] border-none font-bold px-3">
                    {rev.culinary?.nama || "Menu Dihapus"}
                  </Badge>
                  <div className="flex items-center text-yellow-500 gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < rev.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-800 flex items-center gap-2">
                    {rev.user?.name} 
                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-400 uppercase tracking-tighter">Visitor</span>
                  </h4>
                  {editingId === rev.id ? (
                    <div className="mt-3 space-y-3">
                      <div>
                        <label className="text-xs font-bold text-gray-600">Rating:</label>
                        <select
                          value={editForm.rating}
                          onChange={(e) => setEditForm(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        >
                          {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} Bintang</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600">Komentar:</label>
                        <Textarea
                          value={editForm.comment}
                          onChange={(e) => setEditForm(prev => ({ ...prev, comment: e.target.value }))}
                          className="mt-1 text-sm"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600">Status:</label>
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600 italic mt-2 text-sm bg-gray-50 p-3 rounded-xl border border-gray-100">
                      "{rev.comment}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-row md:flex-col items-center justify-end gap-3 md:min-w-[150px] border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                <div className="text-center">
                   {rev.status === 'pending' && <span className="text-[10px] font-bold text-yellow-600 uppercase">Menunggu</span>}
                   {rev.status === 'approved' && <span className="text-[10px] font-bold text-green-600 uppercase">Terbit</span>}
                   {rev.status === 'rejected' && <span className="text-[10px] font-bold text-red-600 uppercase">Ditolak</span>}
                </div>

                <div className="flex gap-2">
                  {editingId === rev.id ? (
                    <>
                      <button onClick={handleSaveEdit} className="p-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-sm"><Save size={18} /></button>
                      <button onClick={() => setEditingId(null)} className="p-2.5 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all shadow-sm"><X size={18} /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(rev)} className="p-2.5 bg-[#a64029] text-white rounded-xl hover:bg-[#85311e] transition-all shadow-sm"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(rev.id)} className="p-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-sm"><Trash2 size={18} /></button>
                      {rev.status === 'pending' ? (
                        <>
                          <button onClick={() => handleStatusChange(rev.id, 'approved')} className="p-2.5 bg-[#4e5b31] text-white rounded-xl hover:bg-[#3a4323] transition-all shadow-sm"><Check size={18} /></button>
                          <button onClick={() => handleStatusChange(rev.id, 'rejected')} className="p-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-sm"><X size={18} /></button>
                        </>
                      ) : (
                        <button onClick={() => handleStatusChange(rev.id, 'pending')} className="text-xs font-bold text-gray-400 hover:text-[#a64029] underline">Reset</button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-300">
            <AlertCircle className="text-gray-200 w-12 h-12 mx-auto mb-2" />
            <p className="text-gray-400 font-medium">Tidak ada ulasan ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  )
}