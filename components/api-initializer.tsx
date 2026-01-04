"use client"

import { useEffect } from "react"
import { initializeApiUrl } from "@/lib/data"

/**
 * Client-side component untuk initialize API URL saat aplikasi pertama kali load
 * Ini memastikan API URL ter-detect dengan benar baik untuk localhost maupun ngrok
 */
export default function ApiInitializer() {
  useEffect(() => {
    initializeApiUrl()
  }, [])

  return null
}
