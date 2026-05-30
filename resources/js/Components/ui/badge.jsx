import { cn } from "@/lib/utils"

const variants = {
  default: "bg-azul-institucional text-white",
  secondary: "bg-gray-100 text-gray-800",
  success: "bg-verde-exito-light text-verde-exito",
  warning: "bg-amarillo-advertencia-light text-amarillo-advertencia",
  danger: "bg-rojo-urgencia-light text-rojo-urgencia",
  outline: "border border-gris-borde text-gray-700",
}

function Badge({ className, variant = "default", ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
