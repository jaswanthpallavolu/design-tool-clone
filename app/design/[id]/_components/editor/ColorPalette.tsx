import type { ColorSwatch } from "./types"

export function ColorPalette({
  swatches,
  onColorSelect,
}: {
  swatches: ColorSwatch[]
  onColorSelect: (colorId: string) => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 pt-1">
      {swatches.map((swatch: ColorSwatch) => (
        <div
          key={swatch.id}
          onClick={() => onColorSelect(swatch.id)}
          className={`cursor-pointer bg-gradient-to-br transition-transform hover:scale-125 ${
            swatch.isActive
              ? "h-7 w-7 rounded-lg shadow-lg ring-2 ring-white ring-offset-2 ring-offset-slate-800 scale-110"
              : "h-6 w-6 rounded-lg shadow-md opacity-85 hover:opacity-100"
          } ${swatch.className}`}
        />
      ))}
    </div>
  )
}

// Made with Bob
