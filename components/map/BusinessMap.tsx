'use client'
import { useEffect, useRef, useState } from 'react'
import { MapPin, Loader2 } from 'lucide-react'
import type { Business } from '@/lib/types/business'
import { escapeHtml } from '@/lib/utils/formatters'

interface Props {
  businesses?: Business[]
  center?: { lat: number; lng: number }
  zoom?: number
  single?: Business
  height?: string
}

const SCZ = { lat: -17.7863, lng: -63.1812 }

export function BusinessMap({ businesses = [], center, zoom = 13, single, height = '400px' }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return
    if (mapInstance.current) return // already initialized

    // Inject leaflet CSS via link tag if not present
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    let cancelled = false

    const init = async () => {
      try {
        const L = (await import('leaflet')).default

        // Fix default icons
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        })

        if (cancelled || !mapRef.current) return

        const mapCenter = center ?? (single?.coordinates ?? SCZ)
        const map = L.map(mapRef.current).setView([mapCenter.lat, mapCenter.lng], zoom)
        mapInstance.current = map

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map)

        const customIcon = (emoji: string) => L.divIcon({
          className: '',
          html: `<div style="width:36px;height:36px;background:#ff4500;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center">
                   <span style="transform:rotate(45deg);font-size:16px;line-height:1">${emoji}</span>
                 </div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36],
        })

        if (single?.coordinates) {
          L.marker([single.coordinates.lat, single.coordinates.lng], { icon: customIcon('🏪') })
            .addTo(map)
            .bindPopup(`<div style="min-width:140px"><strong style="font-size:14px">${escapeHtml(single.name)}</strong><p style="font-size:12px;color:#666;margin:4px 0 0">${escapeHtml(single.address ?? '')}</p></div>`)
            .openPopup()
        }

        businesses.filter(b => b.coordinates).forEach(b => {
          L.marker([b.coordinates!.lat, b.coordinates!.lng], { icon: customIcon('🏪') })
            .addTo(map)
            .bindPopup(`
              <div style="min-width:160px;font-family:system-ui">
                <strong style="font-size:14px">${escapeHtml(b.name)}</strong>
                <p style="font-size:12px;color:#666;margin:4px 0">📍 ${escapeHtml(b.address ?? b.zone)}</p>
                <p style="font-size:12px;margin:0">⭐ ${b.rating.toFixed(1)} · ${b.reviewCount} reseñas</p>
                <a href="/business/${encodeURIComponent(b.slug)}" style="display:block;margin-top:8px;padding:5px 10px;background:#ff4500;color:#fff;border-radius:8px;text-align:center;text-decoration:none;font-size:12px;font-weight:600">Ver perfil →</a>
              </div>
            `)
        })

        if (!cancelled) setLoading(false)
      } catch (e) {
        if (!cancelled) { setError(true); setLoading(false) }
      }
    }

    init()
    return () => {
      cancelled = true
      mapInstance.current?.remove()
      mapInstance.current = null
    }
  }, [])

  if (error) return (
    <div className="flex items-center justify-center bg-muted rounded-2xl border border-border" style={{ height }}>
      <div className="text-center p-6">
        <MapPin size={28} className="mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No se pudo cargar el mapa</p>
        <p className="text-xs text-muted-foreground mt-1">Verifica tu conexión a internet</p>
      </div>
    </div>
  )

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border" style={{ height }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
          <div className="text-center">
            <Loader2 size={24} className="animate-spin text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Cargando mapa…</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}
