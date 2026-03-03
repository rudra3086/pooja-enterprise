"use client"

import { useEffect, useRef } from "react"

type Location = {
  latitude: number
  longitude: number
}

type LocationPickerProps = {
  value?: Location
  onChange: (location: Location) => void
  heightClassName?: string
}

export function LocationPicker({ value, onChange, heightClassName = "h-72" }: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  useEffect(() => {
    let active = true

    const initMap = async () => {
      if (!containerRef.current || mapRef.current) return

      const existingLeafletCss = document.getElementById("leaflet-css")
      if (!existingLeafletCss) {
        const link = document.createElement("link")
        link.id = "leaflet-css"
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        link.crossOrigin = ""
        document.head.appendChild(link)
      }

      let L: typeof import("leaflet")
      try {
        L = await import(/* webpackMode: "eager" */ "leaflet")
      } catch (error) {
        console.error("Failed to load Leaflet", error)
        return
      }
      if (!active || !containerRef.current) return

      const markerIcon = L.divIcon({
        className: "",
        html: '<div style="width:18px;height:18px;border-radius:9999px;background:#111827;border:3px solid #ffffff;box-shadow:0 0 0 2px rgba(17,24,39,0.25);"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      })

      const defaultCenter: [number, number] = value
        ? [value.latitude, value.longitude]
        : [21.6338638, 73.0193249]

      const map = L.map(containerRef.current).setView(defaultCenter, value ? 14 : 7)
      mapRef.current = map

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map)

      const marker = L.marker(defaultCenter, { draggable: true, icon: markerIcon }).addTo(map)
      markerRef.current = marker

      marker.on("dragend", () => {
        const point = marker.getLatLng()
        onChange({ latitude: point.lat, longitude: point.lng })
      })

      map.on("click", (event: any) => {
        const clicked = event.latlng
        marker.setLatLng(clicked)
        onChange({ latitude: clicked.lat, longitude: clicked.lng })
      })
    }

    initMap()

    return () => {
      active = false
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!value || !mapRef.current || !markerRef.current) return
    const next: [number, number] = [value.latitude, value.longitude]
    markerRef.current.setLatLng(next)
    mapRef.current.setView(next, Math.max(mapRef.current.getZoom(), 14))
  }, [value?.latitude, value?.longitude])

  return (
    <div className={`location-picker-root w-full overflow-hidden rounded-md border border-border ${heightClassName}`}>
      <div ref={containerRef} className="location-picker-map h-full w-full" />
    </div>
  )
}
