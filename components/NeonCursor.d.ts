import type { CSSProperties, FC } from 'react'

export interface NeonCursorProps {
  /** Number of fading dots in the trail. */
  trailCount?: number
  /** How quickly the bright core catches up to the pointer (0–1). */
  followEase?: number
  /** How quickly each trail dot catches up to the one ahead of it (0–1). */
  trailEase?: number
  className?: string
  style?: CSSProperties
}

declare const NeonCursor: FC<NeonCursorProps>
export default NeonCursor
