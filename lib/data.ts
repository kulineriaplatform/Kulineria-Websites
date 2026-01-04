// Path: lib/data.ts

// Gunakan environment variable untuk API URL (support localhost dan ngrok)
const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    // Client-side: gunakan NEXT_PUBLIC_API_URL dari .env atau fallback ke localhost
    return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  }
  return "http://127.0.0.1:8000"; // Server-side fallback
};

let API_BASE_URL = getApiBaseUrl() + "/api";
let APP_BASE_URL = getApiBaseUrl();

/**
 * Auto-detect API URL dari backend (untuk support ngrok)
 * Jika NEXT_PUBLIC_API_URL tidak set, coba fetch /api/config dari backend
 */
export async function initializeApiUrl() {
  if (typeof window === "undefined") return; // Skip di server-side

  const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envApiUrl) {
    // Jika sudah di-set via env variable, gunakan itu
    API_BASE_URL = envApiUrl + "/api";
    APP_BASE_URL = envApiUrl;
    return;
  }

  // Fallback: coba auto-detect dari backend
  try {
    const res = await fetch("http://127.0.0.1:8000/api/config");
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data?.app_url) {
        API_BASE_URL = json.data.api_base_url;
        APP_BASE_URL = json.data.app_url;
        console.log("API URL auto-detected:", APP_BASE_URL);
      }
    }
  } catch (error) {
    console.warn("Auto-detect API URL gagal, menggunakan default localhost");
  }
}

export const getApiBaseUrl2 = () => API_BASE_URL;
export const getAppBaseUrl = () => APP_BASE_URL;

/**
 * Meminta Cookie CSRF dari Laravel
 */
export async function getCsrfToken() {
  try {
    await fetch(`${APP_BASE_URL}/sanctum/csrf-cookie`, {
      method: "GET",
      credentials: "include",
    });
  } catch (error) {
    console.error("Gagal ambil CSRF:", error);
  }
}

/**
 * FIX: Fungsi GET API yang sekarang otomatis bawa Token (Authorization)
 */
export async function fetchFromApi<T>(endpoint: string): Promise<T | null> {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    const res = await fetch(`${getApiBaseUrl2()}${endpoint}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : "", // Kirim token buat akses Admin/UMKM
      },
      // credentials: "include" // Penting untuk session cookie
    });

    if (!res.ok) {
      console.warn(`Fetch ${endpoint} Gagal: status ${res.status}`);
      return null;
    }

    const json = await res.json();
    
    // Handle wrapped response { success: true, data: {...} }
    if (json.success !== undefined) {
      return json.success ? json.data : null;
    }
    
    // Handle unwrapped response (direct user object)
    // If response has typical user/data properties, return it directly
    if (json.id || json.email || json.name) {
      return json;
    }
    
    return null;
  } catch (error) {
    console.error(`API Fetch Error pada ${endpoint}:`, error);
    return null;
  }
}

/**
 * Fungsi POST API (Bawa CSRF & Token)
 */
export async function postToApi(endpoint: string, body: any) {
  try {
    await getCsrfToken();
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    const res = await fetch(`${getApiBaseUrl2()}${endpoint}`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(body),
      credentials: "include",
    });

    const json = await res.json();
    
    return {
      status: res.status,
      success: json.success || (res.status >= 200 && res.status < 300),
      message: json.message,
      data: json.data,
      token: json.token,
      role: json.role,
      user: json.user,
      errors: json.errors
    };
  } catch (error) {
    console.error(`API Post Error pada ${endpoint}:`, error);
    return { success: false, message: "Gagal terhubung ke server." };
  }
}

/**
 * Fungsi PUT API (Bawa CSRF & Token)
 */
export async function putToApi(endpoint: string, body: any) {
  try {
    await getCsrfToken();
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    const res = await fetch(`${getApiBaseUrl2()}${endpoint}`, {
      method: "PUT",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(body),
      credentials: "include",
    });

    const json = await res.json();
    
    return {
      status: res.status,
      success: json.success || (res.status >= 200 && res.status < 300),
      message: json.message,
      data: json.data,
      token: json.token,
      role: json.role,
      user: json.user,
      errors: json.errors
    };
  } catch (error) {
    console.error(`API Put Error pada ${endpoint}:`, error);
    return { success: false, message: "Gagal terhubung ke server." };
  }
}

/**
 * Fungsi DELETE API (Bawa CSRF & Token)
 */
export async function deleteToApi(endpoint: string) {
  try {
    await getCsrfToken();
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    const res = await fetch(`${getApiBaseUrl2()}${endpoint}`, {
      method: "DELETE",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : "",
      },
      credentials: "include",
    });

    const json = await res.json();
    
    return {
      status: res.status,
      success: json.success || (res.status >= 200 && res.status < 300),
      message: json.message,
      data: json.data,
      errors: json.errors
    };
  } catch (error) {
    console.error(`API Delete Error pada ${endpoint}:`, error);
    return { success: false, message: "Gagal terhubung ke server." };
  }
}

export async function loadAllFromDatabase() {
  try {
    const dbCulinaries = await fetchFromApi<any[]>("/culinaries");
    
    const [resProv, resKat] = await Promise.all([
      fetch("/mock/home/provinsi_kota.json").then(r => r.json()).catch(() => ({})),
      fetch("/mock/home/kategori.json").then(r => r.json()).catch(() => [])
    ]);

    const sanitized = (dbCulinaries || []).map((item: any) => ({
      ...item,
      id: item.id.toString(),
      title: item.nama,
      rating: parseFloat(item.rating) || 0,
      images: Array.isArray(item.images) ? item.images : ["/placeholder.svg"]
    }));

    return {
      provKota: resProv,
      kategori: resKat,
      kuliner: sanitized,
      popular: sanitized.map((c: any) => c.id),
      baru: sanitized,
    };
  } catch (error) {
    console.error("Load All Gagal:", error);
    return { provKota: {}, kategori: [], kuliner: [], popular: [], baru: [] };
  }
}

export async function loadJSON<T>(path: string): Promise<T> {
  const res = await fetch(path);
  return res.json();
}