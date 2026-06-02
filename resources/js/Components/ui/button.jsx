import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

const variants = {
  default: "bg-azul-institucional text-white hover:bg-azul-institucional-light shadow-sm",
  destructive: "bg-rojo-urgencia text-white hover:bg-red-700 shadow-sm",
  outline: "border border-gris-borde bg-white hover:bg-gris-fondo shadow-sm",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 shadow-sm",
  ghost: "hover:bg-gray-100",
  link: "text-azul-institucional underline-offset-4 hover:underline",
}

const sizes = {
  default: "h-9 px-4 py-2",
  sm: "h-8 rounded-md px-3 text-xs",
  lg: "h-10 rounded-md px-8",
  icon: "h-9 w-9",
  "icon-sm": "h-7 w-7",
}

const Button = React.forwardRef(({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
