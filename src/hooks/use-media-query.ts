import * as React from "react"

// Phone < 768px, tablet 768–1279px, desktop ≥ 1280px.
export function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false)

  React.useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [query])

  return matches
}

export const useIsDesktop = () => useMediaQuery("(min-width: 1280px)")
