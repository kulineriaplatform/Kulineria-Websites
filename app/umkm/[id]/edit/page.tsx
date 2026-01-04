"use client"

import { useParams } from "next/navigation"
import { KulinerForm } from "../../kuliner-form"

export default function EditKulinerPage() {
  const params = useParams()
  return <KulinerForm editId={params.id as string} />
}