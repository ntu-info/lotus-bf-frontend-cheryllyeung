import { API_BASE } from '../api'
import { useEffect, useMemo, useState } from 'react'

export function Studies ({ query }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [sortKey, setSortKey] = useState('year')
  const [sortDir, setSortDir] = useState('desc') // 'asc' | 'desc'
  const [page, setPage] = useState(1)
  const pageSize = 20

  useEffect(() => { setPage(1) }, [query])

  useEffect(() => {
    if (!query) return
    let alive = true
    const ac = new AbortController()
    ;(async () => {
      setLoading(true)
      setErr('')
      try {
        const url = `${API_BASE}/query/${encodeURIComponent(query)}/studies`
        const res = await fetch(url, { signal: ac.signal })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
        if (!alive) return
        const list = Array.isArray(data?.results) ? data.results : []
        setRows(list)
      } catch (e) {
        if (!alive) return
        setErr(`Unable to fetch studies: ${e?.message || e}`)
        setRows([])
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false; ac.abort() }
  }, [query])

  const changeSort = (key) => {
    if (key === sortKey) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const sorted = useMemo(() => {
    const arr = [...rows]
    const dir = sortDir === 'asc' ? 1 : -1
    arr.sort((a, b) => {
      const A = a?.[sortKey]
      const B = b?.[sortKey]
      // Numeric comparison for year; string comparison for other fields
      if (sortKey === 'year') return (Number(A || 0) - Number(B || 0)) * dir
      return String(A || '').localeCompare(String(B || ''), 'en') * dir
    })
    return arr
  }, [rows, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className='studies'>
      {/* Removed internal border and title to match Terms component structure */}


      {query && loading && (
        <div className='studies__skeleton'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='studies__skeleton-row' />
          ))}
        </div>
      )}

      {query && err && (
        <div className='alert alert--error'>
          {err}
        </div>
      )}

      {query && !loading && !err && (
        <div className='studies__table-wrapper'>
          <table className='studies__table'>
            <thead>
              <tr>
                {[
                  { key: 'year', label: 'Year' },
                  { key: 'journal', label: 'Journal' },
                  { key: 'title', label: 'Title' },
                  { key: 'authors', label: 'Authors' }
                ].map(({ key, label }) => (
                  <th key={key} onClick={() => changeSort(key)}>
                    <span className='studies__th-content'>
                      {label}
                      <span className='studies__sort-icon'>{sortKey === key ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr><td colSpan={4} className='studies__empty'>No data</td></tr>
              ) : (
                pageRows.map((r, i) => (
                  <tr key={i}>
                    <td className='studies__cell studies__cell--year'>{r.year ?? ''}</td>
                    <td className='studies__cell'>{r.journal || ''}</td>
                    <td className='studies__cell studies__cell--title'><div className='studies__title-text' title={r.title}>{r.title || ''}</div></td>
                    <td className='studies__cell'>{r.authors || ''}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {query && !loading && !err && (
        <div className='studies__pagination'>
          <div>Total <b>{sorted.length}</b> records, page <b>{page}</b>/<b>{totalPages}</b></div>
          <div className='flex items-center gap-2'>
            <button disabled={page <= 1} onClick={() => setPage(1)} className='pagination-btn'>⏮</button>
            <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className='pagination-btn'>Previous</button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className='pagination-btn'>Next</button>
            <button disabled={page >= totalPages} onClick={() => setPage(totalPages)} className='pagination-btn'>⏭</button>
          </div>
        </div>
      )}
    </div>
  )
}

