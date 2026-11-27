import { createContext, useContext } from 'react'

/**
 * True once the splash loader has fully finished (including its exit fade).
 * Defaults to done so counts still animate when rendered without a loader.
 */
export const LoaderContext = createContext(true)

export function useLoaderDone() {
  return useContext(LoaderContext)
}
