"use client"

import { Suspense } from "react"
import { UnifiedWorkspace } from "@/components/unified-workspace"
import { LoadingFallback } from "@/components/loading-fallback"

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <UnifiedWorkspace />
    </Suspense>
  )
}
