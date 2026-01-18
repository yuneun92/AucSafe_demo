"use client"

import { createContext, useContext, useEffect, useState } from "react"
import Script from "next/script"

declare global {
  interface Window {
    kakao: typeof kakao
  }
}

const KakaoMapContext = createContext<boolean>(false)

interface KakaoMapLoaderProps {
  children: React.ReactNode
}

export function KakaoMapLoader({ children }: KakaoMapLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY

  useEffect(() => {
    // Check if already loaded (for HMR/navigation)
    if (typeof window !== "undefined" && window.kakao?.maps?.Map) {
      setIsLoaded(true)
    }
  }, [])

  const handleScriptLoad = () => {
    if (window.kakao?.maps) {
      window.kakao.maps.load(() => {
        setIsLoaded(true)
      })
    }
  }

  if (!apiKey) {
    console.warn("NEXT_PUBLIC_KAKAO_MAP_API_KEY is not set")
    return <KakaoMapContext.Provider value={false}>{children}</KakaoMapContext.Provider>
  }

  return (
    <KakaoMapContext.Provider value={isLoaded}>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=clusterer&autoload=false`}
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />
      {children}
    </KakaoMapContext.Provider>
  )
}

export function useKakaoMapLoaded() {
  const contextValue = useContext(KakaoMapContext)
  const [isLoaded, setIsLoaded] = useState(contextValue)

  useEffect(() => {
    if (contextValue) {
      setIsLoaded(true)
      return
    }

    // Fallback: check if kakao.maps.Map exists (means load() was called)
    const checkKakao = () => {
      if (typeof window !== "undefined" && window.kakao?.maps?.Map) {
        setIsLoaded(true)
        return true
      }
      return false
    }

    if (checkKakao()) return

    const interval = setInterval(() => {
      if (checkKakao()) {
        clearInterval(interval)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [contextValue])

  return isLoaded
}
