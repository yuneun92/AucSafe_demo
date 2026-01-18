"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Map, MapMarker, MarkerClusterer, CustomOverlayMap, useMap } from "react-kakao-maps-sdk"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ZoomIn, ZoomOut, Layers, Navigation, Building2, School, ShoppingBag, Train, Locate } from "lucide-react"
import { useKakaoMapLoaded } from "./kakao-map-loader"
import { MapInfowindow } from "./map-infowindow"
import { MapFilterOverlay, type MapFilterState } from "./map-filter-overlay"
import type { AuctionProperty } from "@/lib/mock-data"

interface MapViewProps {
  properties: AuctionProperty[]
  onPropertyClick: (property: AuctionProperty) => void
  selectedPropertyId?: string
  onBoundsChange?: (bounds: {
    sw: { lat: number; lng: number }
    ne: { lat: number; lng: number }
  }) => void
}

// Default center: Seoul
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.9780 }
const DEFAULT_LEVEL = 8

// Custom marker component
function PropertyMarker({
  property,
  isSelected,
  onClick,
}: {
  property: AuctionProperty
  isSelected: boolean
  onClick: () => void
}) {
  const getMarkerColor = (score: number) => {
    if (score >= 80) return "#22c55e" // primary green
    if (score >= 60) return "#f59e0b" // warning yellow
    return "#ef4444" // destructive red
  }

  return (
    <button
      onClick={onClick}
      className={`relative flex items-center justify-center transition-transform ${
        isSelected ? "scale-125 z-50" : "hover:scale-110"
      }`}
      style={{ transform: "translate(-50%, -100%)" }}
    >
      {/* Marker pin */}
      <div
        className={`relative flex items-center justify-center w-10 h-10 rounded-full shadow-lg ${
          isSelected ? "ring-2 ring-white ring-offset-2" : ""
        }`}
        style={{ backgroundColor: getMarkerColor(property.riskScore) }}
      >
        <span className="text-white text-xs font-bold">{property.riskScore}</span>
      </div>
      {/* Pin tail */}
      <div
        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0"
        style={{
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: `8px solid ${getMarkerColor(property.riskScore)}`,
        }}
      />
    </button>
  )
}

// Map controller for zoom
function MapController({
  onZoomIn,
  onZoomOut,
  onReset,
  onLocate,
}: {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  onLocate: () => void
}) {
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
      <Button
        size="icon"
        variant="secondary"
        className="h-9 w-9 bg-card/90 backdrop-blur border border-border"
        onClick={onZoomIn}
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="secondary"
        className="h-9 w-9 bg-card/90 backdrop-blur border border-border"
        onClick={onZoomOut}
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="secondary"
        className="h-9 w-9 bg-card/90 backdrop-blur border border-border"
        onClick={onReset}
      >
        <Navigation className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="secondary"
        className="h-9 w-9 bg-card/90 backdrop-blur border border-border"
        onClick={onLocate}
      >
        <Locate className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Layer control component
function LayerControl({
  activeLayers,
  onToggleLayer,
}: {
  activeLayers: string[]
  onToggleLayer: (layerId: string) => void
}) {
  const [showLayers, setShowLayers] = useState(false)

  const layers = [
    { id: "properties", label: "매물", icon: Building2 },
    { id: "schools", label: "학교/학원", icon: School },
    { id: "shopping", label: "상권", icon: ShoppingBag },
    { id: "transport", label: "교통", icon: Train },
  ]

  return (
    <div className="absolute top-[180px] right-4 z-10">
      <Button
        size="icon"
        variant={showLayers ? "default" : "secondary"}
        className="h-9 w-9 bg-card/90 backdrop-blur border border-border"
        onClick={() => setShowLayers(!showLayers)}
      >
        <Layers className="h-4 w-4" />
      </Button>

      {showLayers && (
        <Card className="absolute right-12 top-0 w-40 shadow-xl">
          <CardContent className="p-2 space-y-1">
            {layers.map((layer) => (
              <button
                key={layer.id}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                  activeLayers.includes(layer.id) ? "bg-primary/10 text-primary" : "hover:bg-secondary"
                }`}
                onClick={() => onToggleLayer(layer.id)}
              >
                <layer.icon className="h-4 w-4" />
                {layer.label}
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Legend component
function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur border border-border rounded-lg p-3 text-xs space-y-2 z-10">
      <div className="font-medium mb-2">AI 안전점수</div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span>80점 이상 (추천)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
        <span>60~79점 (보통)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <span>60점 미만 (주의)</span>
      </div>
    </div>
  )
}

// Inner map content component (must be inside Map)
function MapContent({
  properties,
  selectedPropertyId,
  onPropertyClick,
  onBoundsChange,
  level,
  setLevel,
  center,
  setCenter,
}: {
  properties: AuctionProperty[]
  selectedPropertyId?: string
  onPropertyClick: (property: AuctionProperty) => void
  onBoundsChange?: (bounds: { sw: { lat: number; lng: number }; ne: { lat: number; lng: number } }) => void
  level: number
  setLevel: (level: number) => void
  center: { lat: number; lng: number }
  setCenter: (center: { lat: number; lng: number }) => void
}) {
  const map = useMap()
  const [infoWindowProperty, setInfoWindowProperty] = useState<AuctionProperty | null>(null)
  const boundsChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle bounds change with debounce
  const handleBoundsChange = useCallback(() => {
    if (!map || !onBoundsChange) return

    if (boundsChangeTimeoutRef.current) {
      clearTimeout(boundsChangeTimeoutRef.current)
    }

    boundsChangeTimeoutRef.current = setTimeout(() => {
      const bounds = map.getBounds()
      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()

      onBoundsChange({
        sw: { lat: sw.getLat(), lng: sw.getLng() },
        ne: { lat: ne.getLat(), lng: ne.getLng() },
      })
    }, 300)
  }, [map, onBoundsChange])

  useEffect(() => {
    if (!map) return

    // Listen for bounds change events
    kakao.maps.event.addListener(map, "bounds_changed", handleBoundsChange)
    kakao.maps.event.addListener(map, "zoom_changed", () => {
      setLevel(map.getLevel())
    })
    kakao.maps.event.addListener(map, "center_changed", () => {
      const center = map.getCenter()
      setCenter({ lat: center.getLat(), lng: center.getLng() })
    })

    // Initial bounds emit
    handleBoundsChange()

    return () => {
      kakao.maps.event.removeListener(map, "bounds_changed", handleBoundsChange)
      if (boundsChangeTimeoutRef.current) {
        clearTimeout(boundsChangeTimeoutRef.current)
      }
    }
  }, [map, handleBoundsChange, setLevel, setCenter])

  const handleMarkerClick = (property: AuctionProperty) => {
    setInfoWindowProperty(property)
  }

  const handleInfoWindowClose = () => {
    setInfoWindowProperty(null)
  }

  const handleViewDetails = () => {
    if (infoWindowProperty) {
      onPropertyClick(infoWindowProperty)
      setInfoWindowProperty(null)
    }
  }

  // Cluster styles
  const clusterStyles = [
    {
      width: "40px",
      height: "40px",
      background: "rgba(34, 197, 94, 0.9)",
      borderRadius: "50%",
      color: "#fff",
      textAlign: "center" as const,
      fontWeight: "bold",
      lineHeight: "40px",
      fontSize: "14px",
    },
    {
      width: "50px",
      height: "50px",
      background: "rgba(245, 158, 11, 0.9)",
      borderRadius: "50%",
      color: "#fff",
      textAlign: "center" as const,
      fontWeight: "bold",
      lineHeight: "50px",
      fontSize: "16px",
    },
    {
      width: "60px",
      height: "60px",
      background: "rgba(239, 68, 68, 0.9)",
      borderRadius: "50%",
      color: "#fff",
      textAlign: "center" as const,
      fontWeight: "bold",
      lineHeight: "60px",
      fontSize: "18px",
    },
  ]

  return (
    <>
      <MarkerClusterer
        averageCenter={true}
        minLevel={5}
        styles={clusterStyles}
        calculator={[10, 30, 50]}
      >
        {properties.map((property) => (
          <CustomOverlayMap
            key={property.id}
            position={{ lat: property.coordinates.lat, lng: property.coordinates.lng }}
            zIndex={selectedPropertyId === property.id ? 100 : 1}
          >
            <PropertyMarker
              property={property}
              isSelected={selectedPropertyId === property.id}
              onClick={() => handleMarkerClick(property)}
            />
          </CustomOverlayMap>
        ))}
      </MarkerClusterer>

      {/* Info Window */}
      {infoWindowProperty && (
        <CustomOverlayMap
          position={{
            lat: infoWindowProperty.coordinates.lat,
            lng: infoWindowProperty.coordinates.lng,
          }}
          zIndex={200}
          yAnchor={1.5}
        >
          <MapInfowindow
            property={infoWindowProperty}
            onClose={handleInfoWindowClose}
            onViewDetails={handleViewDetails}
          />
        </CustomOverlayMap>
      )}
    </>
  )
}

export function MapView({ properties, onPropertyClick, selectedPropertyId, onBoundsChange }: MapViewProps) {
  const isKakaoLoaded = useKakaoMapLoaded()
  const [level, setLevel] = useState(DEFAULT_LEVEL)
  const [center, setCenter] = useState(DEFAULT_CENTER)
  const [activeLayers, setActiveLayers] = useState<string[]>(["properties"])
  const [filters, setFilters] = useState<MapFilterState>({
    propertyTypes: [],
    priceRange: [0, 30],
    minSafetyScore: 0,
  })
  const mapRef = useRef<kakao.maps.Map | null>(null)

  // Filter properties based on map filters
  const filteredProperties = properties.filter((property) => {
    // Property type filter
    if (filters.propertyTypes.length > 0 && !filters.propertyTypes.includes(property.propertyType)) {
      return false
    }

    // Price range filter (in 억 units)
    const priceInBillion = property.minimumBidPrice / 100000000
    if (priceInBillion < filters.priceRange[0] || priceInBillion > filters.priceRange[1]) {
      return false
    }

    // Safety score filter
    if (property.riskScore < filters.minSafetyScore) {
      return false
    }

    return true
  })

  const toggleLayer = (layerId: string) => {
    setActiveLayers((prev) => (prev.includes(layerId) ? prev.filter((l) => l !== layerId) : [...prev, layerId]))
  }

  const handleZoomIn = () => {
    if (mapRef.current) {
      const currentLevel = mapRef.current.getLevel()
      mapRef.current.setLevel(currentLevel - 1)
    }
  }

  const handleZoomOut = () => {
    if (mapRef.current) {
      const currentLevel = mapRef.current.getLevel()
      mapRef.current.setLevel(currentLevel + 1)
    }
  }

  const handleReset = () => {
    if (mapRef.current) {
      mapRef.current.setCenter(new kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng))
      mapRef.current.setLevel(DEFAULT_LEVEL)
    }
  }

  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          if (mapRef.current) {
            mapRef.current.setCenter(new kakao.maps.LatLng(latitude, longitude))
            mapRef.current.setLevel(5)
          }
        },
        (error) => {
          console.warn("Geolocation error:", error)
          alert("위치 정보를 가져올 수 없습니다.")
        }
      )
    } else {
      alert("브라우저가 위치 정보를 지원하지 않습니다.")
    }
  }

  // Loading state
  if (!isKakaoLoaded) {
    return (
      <div className="relative w-full h-full bg-secondary rounded-none overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">지도를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-secondary rounded-none overflow-hidden">
      <Map
        center={center}
        level={level}
        style={{ width: "100%", height: "100%" }}
        onCreate={(map) => {
          mapRef.current = map
        }}
      >
        <MapContent
          properties={filteredProperties}
          selectedPropertyId={selectedPropertyId}
          onPropertyClick={onPropertyClick}
          onBoundsChange={onBoundsChange}
          level={level}
          setLevel={setLevel}
          center={center}
          setCenter={setCenter}
        />
      </Map>

      {/* Map Controls */}
      <MapController
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        onLocate={handleLocate}
      />

      {/* Layer Control */}
      <LayerControl activeLayers={activeLayers} onToggleLayer={toggleLayer} />

      {/* Filter Overlay */}
      <div className="absolute top-4 left-4 z-10 w-64">
        <MapFilterOverlay
          filters={filters}
          onFiltersChange={setFilters}
          totalCount={properties.length}
          filteredCount={filteredProperties.length}
        />
      </div>

      {/* Legend */}
      <MapLegend />
    </div>
  )
}
