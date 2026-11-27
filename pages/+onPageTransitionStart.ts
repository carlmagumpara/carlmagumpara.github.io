import type { PageContextClient } from 'vike/types'
import { beginPageSlide } from '../lib/page-transition'

export async function onPageTransitionStart(pageContext: Partial<PageContextClient>) {
  await beginPageSlide(pageContext.isBackwardNavigation)
}
