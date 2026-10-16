import { ImageIcon } from 'lucide-react'

type ProductImagePlaceholderProps = {
  productName: string
  className: string
}

export function ProductImagePlaceholder({
  productName,
  className,
}: ProductImagePlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={`No image available for ${productName}`}
      className={`flex items-center justify-center bg-[#e5d8cb] text-[#26352d]/45 ${className}`}
    >
      <div className="flex flex-col items-center gap-2 px-3 text-center">
        <ImageIcon aria-hidden="true" size={28} strokeWidth={1.25} />
        <span className="text-[9px] tracking-[0.12em] uppercase">Image coming soon</span>
      </div>
    </div>
  )
}
