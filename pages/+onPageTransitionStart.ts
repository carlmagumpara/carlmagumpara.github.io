import { beginPageFade } from '../lib/page-transition'

export async function onPageTransitionStart() {
  await beginPageFade()
}
