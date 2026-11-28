import { useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

/** Shows one project screenshot at a time with prev/next controls and dots. */
export function ProjectCarousel({ images, name }: { images: string[]; name: string }) {
  const [index, setIndex] = useState(0)
  const count = images.length

  if (count === 0) return null

  function goTo(next: number) {
    setIndex((next + count) % count)
  }

  return (
    <div className="mt-3">
      <div className="bg-base-200 relative overflow-hidden rounded-lg border border-base-200">
        <img
          key={images[index]}
          src={images[index]}
          alt={`${name} screenshot ${index + 1} of ${count}`}
          loading="lazy"
          className="h-56 w-full object-contain"
        />
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label={`Previous ${name} screenshot`}
              className="absolute top-1/2 left-2 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/60 p-1.5 text-white transition hover:bg-black/80"
            >
              <FiChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label={`Next ${name} screenshot`}
              className="absolute top-1/2 right-2 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/60 p-1.5 text-white transition hover:bg-black/80"
            >
              <FiChevronRight className="h-4 w-4" />
            </button>
            <span className="absolute right-2 bottom-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>
      {count > 1 && (
        <div className="mt-2 flex items-center justify-center gap-2">
          {images.map((image, position) => (
            <button
              key={image}
              type="button"
              onClick={() => goTo(position)}
              aria-label={`Show ${name} screenshot ${position + 1}`}
              aria-current={position === index}
              className={`h-2 cursor-pointer rounded-full transition-all ${
                position === index ? 'bg-brand-start w-5' : 'bg-base-content/25 w-2 hover:bg-base-content/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
