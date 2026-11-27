import type { PageContextClient } from 'vike/types'
import { beginBoxTransition } from '../lib/page-transition'

export async function onPageTransitionStart(pageContext: Partial<PageContextClient>) {
  await beginBoxTransition(pageContext.isBackwardNavigation)
}
