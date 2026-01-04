"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  User,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  Settings,
  Edit,
  Save,
  X,
  Bookmark,
  BookOpen
} from "lucide-react"
import { fetchFromApi, postToApi } from "@/lib/data"
import { KulinerCard } from "@/components/kuliner-card"

export default function VisitorProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [msg, setMsg] = useState({ type: "", text: "" })
  const [user, setUser] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<"profile" | "saved">("profile")
  const [savedKuliner, setSavedKuliner] = useState<any[]>([])
  const [loadingSaved, setLoadingSaved] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: ""
  })
  const router = useRouter()

  useEffect(() => {
    setMounted(true)

    // Cek apakah visitor sudah login
    const visitorToken = localStorage.getItem("auth_token")
    const userRole = localStorage.getItem("user_role")
    const userInfo = localStorage.getItem("user_info")

    console.log("Profile Page Debug:", {
      visitorToken: visitorToken ? "exists" : "missing",
      userRole,
      userInfo: userInfo ? "exists" : "missing"
    })

    if (!visitorToken || userRole !== "visitor") {
      console.log("Not authenticated or not visitor, redirecting to login")
      router.replace("/login")
      return
    }

    loadUserProfile()
  }, [router])

  // Load saved kuliner ketika tab berubah
  useEffect(() => {
    if (activeTab === "saved") {
      loadSavedKuliner()
    }
  }, [activeTab])

  const loadSavedKuliner = async () => {
    setLoadingSaved(true)
    try {
      // Ambil daftar ID kuliner yang disimpan dari localStorage
      const savedIds = JSON.parse(localStorage.getItem("kulinerFavorites") || "[]")
      
      if (savedIds.length === 0) {
        setSavedKuliner([])
        setLoadingSaved(false)
        return
      }

      // Fetch semua kuliner dari API
      const allKuliner = await fetchFromApi<any[]>("/culinaries")
      
      if (allKuliner) {
        // Filter hanya kuliner yang disimpan
        const saved = allKuliner.filter((k: any) => 
          savedIds.includes(k.id.toString())
        )
        setSavedKuliner(saved)
      }
    } catch (error) {
      console.error("Gagal load saved kuliner:", error)
      setMsg({ type: "error", text: "Gagal memuat kuliner yang disimpan" })
    }
    setLoadingSaved(false)
  }

  const loadUserProfile = async () => {
    try {
      console.log("Loading user profile from API...")
      const data = await fetchFromApi<any>("/user")
      console.log("API Response:", data)
      
      if (data) {
        console.log("Setting user from API")
        setUser(data)
        setFormData({
          name: data.name || "",
          email: data.email || "",
          password: "",
          confirm_password: ""
        })
      } else {
        console.log("API returned null, trying localStorage fallback...")
        // Jika API gagal, coba ambil dari localStorage
        const info = localStorage.getItem("user_info")
        if (info) {
          const parsed = JSON.parse(info)
          console.log("Using localStorage fallback:", parsed)
          setUser(parsed)
          setFormData({
            name: parsed.name || "",
            email: parsed.email || "",
            password: "",
            confirm_password: ""
          })
        } else {
          // Jika tidak ada data sama sekali, redirect ke login
          console.log("No data found, redirecting to login")
          setMsg({ type: "error", text: "Gagal memuat data profil. Silakan login kembali." })
          setTimeout(() => router.replace("/login"), 2000)
        }
      }
    } catch (error) {
      console.error("Error loading profil:", error)
      // Fallback ke localStorage jika ada error
      const info = localStorage.getItem("user_info")
      if (info) {
        const parsed = JSON.parse(info)
        console.log("Using localStorage after error:", parsed)
        setUser(parsed)
        setFormData({
          name: parsed.name || "",
          email: parsed.email || "",
          password: "",
          confirm_password: ""
        })
      } else {
        console.log("No localStorage data, redirecting to login")
        setMsg({ type: "error", text: "Gagal memuat data profil. Silakan login kembali." })
        setTimeout(() => router.replace("/login"), 2000)
      }
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMsg({ type: "", text: "" })

    if (formData.password && formData.password !== formData.confirm_password) {
      setMsg({ type: "error", text: "Password tidak cocok" })
      setIsLoading(false)
      return
    }

    const updateData: any = {
      name: formData.name,
      email: formData.email
    }

    if (formData.password) {
      updateData.password = formData.password
    }

    const res = await postToApi("/user/update", updateData)

    if (res.success) {
      setMsg({ type: "success", text: "Profil berhasil diperbarui" })
      setIsEditing(false)
      // Update localStorage jika nama berubah
      const info = localStorage.getItem("user_info")
      if (info) {
        const parsed = JSON.parse(info)
        parsed.name = formData.name
        localStorage.setItem("user_info", JSON.stringify(parsed))
      }
      loadUserProfile() // Reload data
    } else {
      setMsg({ type: "error", text: res.message || "Gagal update profil" })
    }

    setIsLoading(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      confirm_password: ""
    })
    setMsg({ type: "", text: "" })
  }

  if (!mounted) return null

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f4e8d1]">
        <div className="text-center">
          <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-[#a64029] border-t-transparent mx-auto"></div>
          <p className="font-serif text-[#a64029] text-xl animate-pulse">Memuat Profil...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Header />
      <main className="bg-[#f4e8d1] min-h-screen py-12 font-sans">
        <div className="container mx-auto px-5 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-bold text-[#3b2f2f] mb-2">Profil Saya</h1>
            <p className="text-[#6e5849]">Kelola informasi akun dan kuliner favorit Anda</p>
          </div>

          {/* Tabs Navigation */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                activeTab === "profile"
                  ? "bg-[#a64029] text-white shadow-lg shadow-[#a64029]/20"
                  : "bg-white text-[#3b2f2f] border-2 border-gray-200 hover:border-[#a64029]"
              }`}
            >
              <Settings className="w-5 h-5" />
              Pengaturan Profil
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                activeTab === "saved"
                  ? "bg-[#a64029] text-white shadow-lg shadow-[#a64029]/20"
                  : "bg-white text-[#3b2f2f] border-2 border-gray-200 hover:border-[#a64029]"
              }`}
            >
              <Bookmark className="w-5 h-5" />
              Kuliner Tersimpan ({savedKuliner.length})
            </button>
          </div>

          {/* Profile Tab Content */}
          {activeTab === "profile" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sidebar Info */}
              <div className="lg:col-span-1">
                <Card className="p-6 bg-white rounded-[32px] border-none shadow-sm">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-[#a64029] rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-[#3b2f2f] mb-1">{user.name}</h2>
                    <p className="text-[#6e5849] text-sm mb-4">Pengunjung</p>
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Akun Terverifikasi</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Form Edit */}
              <div className="lg:col-span-2">
                <Card className="p-8 bg-white rounded-[32px] border-none shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Settings className="w-6 h-6 text-[#a64029]" />
                      <h2 className="text-2xl font-serif font-bold text-[#3b2f2f]">Pengaturan Profil</h2>
                    </div>
                    {!isEditing && (
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-[#a64029] hover:bg-[#85311e] text-white"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profil
                      </Button>
                    )}
                  </div>

                  {msg.text && (
                    <div className={`p-4 rounded-2xl mb-6 flex items-center gap-2 ${
                      msg.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                      {msg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                      <span className="font-medium">{msg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[#3b2f2f] flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Nama Lengkap
                      </label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditing}
                        className="py-6 rounded-xl border-[#ddd]"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[#3b2f2f] flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        className="py-6 rounded-xl border-[#ddd]"
                        required
                      />
                    </div>

                    {isEditing && (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-[#3b2f2f] flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Password Baru (Opsional)
                          </label>
                          <Input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="Kosongkan jika tidak ingin mengubah"
                            className="py-6 rounded-xl border-[#ddd]"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold text-[#3b2f2f] flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Konfirmasi Password Baru
                          </label>
                          <Input
                            type="password"
                            value={formData.confirm_password}
                            onChange={(e) => setFormData(prev => ({ ...prev, confirm_password: e.target.value }))}
                            placeholder="Konfirmasi password baru"
                            className="py-6 rounded-xl border-[#ddd]"
                          />
                        </div>
                      </>
                    )}

                    {isEditing && (
                      <div className="flex gap-4 pt-4">
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="bg-[#a64029] hover:bg-[#85311e] text-white px-8 py-3 rounded-2xl font-bold"
                        >
                          {isLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                              Menyimpan...
                            </div>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Simpan Perubahan
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          onClick={handleCancel}
                          variant="outline"
                          className="px-8 py-3 rounded-2xl border-gray-200 font-bold"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Batal
                        </Button>
                      </div>
                    )}
                  </form>
                </Card>
              </div>
            </div>
          )}

          {/* Saved Kuliner Tab Content */}
          {activeTab === "saved" && (
            <div>
              {loadingSaved ? (
                <div className="py-20 text-center">
                  <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-[#a64029] border-t-transparent mx-auto"></div>
                  <p className="font-serif text-[#a64029] text-lg animate-pulse">Memuat kuliner tersimpan...</p>
                </div>
              ) : savedKuliner.length === 0 ? (
                <Card className="p-16 bg-white rounded-[40px] border-none shadow-sm text-center">
                  <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-serif font-bold text-[#3b2f2f] mb-2">Belum Ada Kuliner Tersimpan</h3>
                  <p className="text-[#6e5849] mb-6">Mulai jelajahi dan simpan kuliner favorit Anda!</p>
                  <Button 
                    onClick={() => window.location.href = "/"}
                    className="bg-[#a64029] hover:bg-[#85311e] text-white px-8 py-3 rounded-2xl font-bold"
                  >
                    Jelajahi Kuliner
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedKuliner.map((culinary: any) => (
                    <KulinerCard
                      key={culinary.id}
                      id={culinary.id.toString()}
                      title={culinary.nama}
                      kategori={culinary.kategori}
                      hargaMin={culinary.harga_min}
                      hargaMax={culinary.harga_max}
                      rating={culinary.rating || 0}
                      images={culinary.images}
                      kota={culinary.kota}
                      provinsi={culinary.provinsi}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}