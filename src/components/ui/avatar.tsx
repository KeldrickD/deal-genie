import * as React from "react"
import { cn } from "@/lib/utils"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Avatar({ className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  onLoadingStatusChange?: (status: "loading" | "loaded" | "error") => void
}

export function AvatarImage({
  className,
  onLoadingStatusChange,
  ...props
}: AvatarImageProps) {
  const [status, setStatus] = React.useState<"loading" | "loaded" | "error">("loading")

  React.useEffect(() => {
    onLoadingStatusChange?.(status)
  }, [onLoadingStatusChange, status])

  return (
    <img
      className={cn("aspect-square h-full w-full", className)}
      onLoad={() => setStatus("loaded")}
      onError={() => setStatus("error")}
      {...props}
    />
  )
}

export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  delayMs?: number
}

export function AvatarFallback({
  className,
  delayMs = 600,
  ...props
}: AvatarFallbackProps) {
  const [isShown, setIsShown] = React.useState(delayMs === 0)

  React.useEffect(() => {
    if (delayMs === 0) return

    const timeout = setTimeout(() => setIsShown(true), delayMs)
    return () => clearTimeout(timeout)
  }, [delayMs])

  if (!isShown) return null

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-600",
        className
      )}
      {...props}
    />
  )
} 