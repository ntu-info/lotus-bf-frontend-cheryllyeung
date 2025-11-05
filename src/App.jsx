
import { useCallback, useRef, useState } from 'react'
import { Terms } from './components/Terms'
import { QueryBuilder } from './components/QueryBuilder'
import { Studies } from './components/Studies'
import { NiiViewer } from './components/NiiViewer'
import { useUrlQueryState } from './hooks/useUrlQueryState'
import insideOutImage from './assets/inside out.jpg'
import './App.css'

export default function App () {
  const [query, setQuery] = useUrlQueryState('q')
  const [hasEntered, setHasEntered] = useState(false)

  const handlePickTerm = useCallback((t) => {
    setQuery((q) => (q ? `${q} ${t}` : t))
  }, [setQuery])

  const handleEnter = () => {
    setHasEntered(true)
  }

  // --- resizable panes state ---
  const gridRef = useRef(null)
  const [sizes, setSizes] = useState([28, 44, 28]) // [left, middle, right]
  const MIN_PX = 240

  const startDrag = (which, e) => {
    e.preventDefault()
    const startX = e.clientX
    const rect = gridRef.current.getBoundingClientRect()
    const total = rect.width
    const curPx = sizes.map(p => (p / 100) * total)

    const onMouseMove = (ev) => {
      const dx = ev.clientX - startX
      if (which === 0) {
        let newLeft = curPx[0] + dx
        let newMid = curPx[1] - dx
        if (newLeft < MIN_PX) { newMid -= (MIN_PX - newLeft); newLeft = MIN_PX }
        if (newMid < MIN_PX) { newLeft -= (MIN_PX - newMid); newMid = MIN_PX }
        const s0 = (newLeft / total) * 100
        const s1 = (newMid / total) * 100
        const s2 = 100 - s0 - s1
        setSizes([s0, s1, Math.max(s2, 0)])
      } else {
        let newMid = curPx[1] + dx
        let newRight = curPx[2] - dx
        if (newMid < MIN_PX) { newRight -= (MIN_PX - newMid); newMid = MIN_PX }
        if (newRight < MIN_PX) { newMid -= (MIN_PX - newRight); newRight = MIN_PX }
        const s1 = (newMid / total) * 100
        const s2 = (newRight / total) * 100
        const s0 = (curPx[0] / total) * 100
        setSizes([s0, s1, Math.max(s2, 0)])
      }
    }
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  // Welcome page - before entering
  if (!hasEntered) {
    return (
      <div className="app welcome-page">
        <div className="welcome__container">
          <header className="welcome__header">
            <h1 className="welcome__title">LoTUS-BF</h1>
            <div className="welcome__subtitle">Location-or-Term Unified Search for Brain Functions</div>
          </header>

          <section className="welcome__portal" onClick={handleEnter}>
            <div className="welcome__image-container">
              <img src={insideOutImage} alt="Inside Out - Explore Brain Functions" className="welcome__image" />
              <div className="welcome__overlay">
                <div className="welcome__loading">
                  <div className="welcome__loading-text">Entering Brain Headquarters...</div>
                  <div className="welcome__loading-bar">
                    <div className="welcome__loading-progress"></div>
                  </div>
                  <div className="welcome__loading-hint">Click to Start</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    )
  }

  // Main application - after entering
  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">LoTUS-BF</h1>
        <div className="app__subtitle">Location-or-Term Unified Search for Brain Functions</div>
      </header>

      <main className="control-panels">
        <section className="card card--full">
          <QueryBuilder query={query} setQuery={setQuery} />
        </section>

        <div className="app__grid" ref={gridRef}>
          <section className="card" style={{ flexBasis: `${sizes[0]}%` }}>
            <div className="card__title">Terms</div>
            <Terms onPickTerm={handlePickTerm} />
          </section>

          <div className="resizer" aria-label="Resize left/middle" onMouseDown={(e) => startDrag(0, e)} />

          <section className="card" style={{ flexBasis: `${sizes[1]}%` }}>
            <div className="card__title">Studies</div>
            <Studies query={query} />
          </section>

          <div className="resizer" aria-label="Resize middle/right" onMouseDown={(e) => startDrag(1, e)} />

          <section className="card" style={{ flexBasis: `${sizes[2]}%` }}>
            <div className="card__title">NifTi Viewer</div>
            <NiiViewer query={query} />
          </section>
        </div>
      </main>
    </div>
  )
}
