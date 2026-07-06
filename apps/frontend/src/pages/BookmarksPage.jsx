import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getBookmarks } from '../api/client'

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getBookmarks()
      .then((data) => {
        setBookmarks(data)
        setLoading(false)
      })
      .catch(() => {
        setError('No se pudieron cargar los favoritos. Intenta de nuevo.')
        setLoading(false)
      })
  }, [])

  return (
    <div className="page">
      <header className="header-bar">
        <div className="header-content">
          <div className="header-brand">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <span>Portal de Convocatorias</span>
          </div>
          <nav className="header-nav">
            <Link to="/home" className="btn-outline">Inicio</Link>
            <Link to="/procurements" className="btn-outline">Buscar</Link>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <h1 className="page-title">Mis favoritos</h1>

        {loading && (
          <div className="loading-state">
            <div className="spinner" />
            <p>Cargando favoritos...</p>
          </div>
        )}

        {error && (
          <div className="error-banner">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && bookmarks.length === 0 && (
          <div className="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <p>No tienes favoritos guardados.</p>
            <Link to="/procurements" className="btn-primary">Buscar convocatorias</Link>
          </div>
        )}

        {!loading && !error && bookmarks.length > 0 && (
          <div className="results-list-container">
            <p className="results-count">{bookmarks.length} favorito{bookmarks.length !== 1 ? 's' : ''}</p>
            <ul className="procurement-list">
              {bookmarks.map((b) => (
                <li key={b.id} className="procurement-item">
                  <div className="procurement-name">{b.procurement?.nombre_del_procedimiento || b.referencia_del_proceso || 'Sin nombre'}</div>
                  <div className="procurement-meta">
                    <span>{b.procurement?.entidad || '—'}</span>
                    <span>•</span>
                    <span>{b.procurement?.fecha_de_publicacion_del ? new Date(b.procurement.fecha_de_publicacion_del).toLocaleDateString('es-CO') : '—'}</span>
                    <span>•</span>
                    <span>{b.procurement?.estado_del_procedimiento || '—'}</span>
                  </div>
                  {b.procurement?.url_proceso && (
                    <a
                      href={b.procurement.url_proceso}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="procurement-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Ver proceso →
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  )
}
