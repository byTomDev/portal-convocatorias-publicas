import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getBookmarks } from '../api/client'

const formatCurrency = (val) => {
  if (!val) return '—'
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(Number(val))
}

export default function BookmarksPage() {
  const [allBookmarks, setAllBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 10

  useEffect(() => {
    getBookmarks()
      .then((data) => {
        setAllBookmarks(data)
        setLoading(false)
      })
      .catch(() => {
        setError('No se pudieron cargar los favoritos. Intenta de nuevo.')
        setLoading(false)
      })
  }, [])

  const totalPages = Math.max(1, Math.ceil(allBookmarks.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const bookmarks = allBookmarks.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handleOpen = (b) => setSelected(b.procurement)
  const handleClose = () => setSelected(null)

  return (
    <div className="page">
      <header className="header-bar">
        <div className="header-content">
          <div className="header-brand">
            <Link to="/home">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span>Portal de Convocatorias</span>
            </Link>
          </div>
          <nav className="header-nav">
            <Link to="/home" className="btn-primary">Regresar a inicio</Link>
            <Link to="/procurements" className="btn-outline">Buscar</Link>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Mis favoritos</h1>
          <div className="page-header-nav">
            <Link to="/home" className="btn-outline">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',verticalAlign:'middle',marginRight:'4px'}}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Regresar a inicio
            </Link>
            <Link to="/procurements" className="btn-primary">Buscar convocatorias</Link>
          </div>
        </div>

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
            <p className="results-count">
              Mostrando {bookmarks.length} de {allBookmarks.length} favorito{allBookmarks.length !== 1 ? 's' : ''} — Página {safePage} de {totalPages}
            </p>
            <ul className="procurement-list">
              {bookmarks.map((b) => (
                <li key={b.id} className="procurement-item" onClick={() => handleOpen(b)}>
                  <div className="procurement-name">
                    {b.procurement?.nombre_del_procedimiento || b.referencia_del_proceso || 'Sin nombre'}
                  </div>
                  <div className="procurement-meta">
                    <span>{b.procurement?.entidad || '—'}</span>
                    <span>•</span>
                    <span>{b.procurement?.fecha_de_publicacion_del ? new Date(b.procurement.fecha_de_publicacion_del).toLocaleDateString('es-CO') : '—'}</span>
                    <span>•</span>
                    <span>{b.procurement?.estado_del_procedimiento || '—'}</span>
                  </div>
                </li>
              ))}
            </ul>
            {totalPages > 1 && (
              <div className="pagination-bar">
                <button
                  className="btn-outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                >
                  ← Anterior
                </button>
                <span className="pagination-info">Página {safePage} de {totalPages}</span>
                <button
                  className="btn-outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {selected && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{selected.nombre_del_procedimiento || 'Detalle de convocatoria'}</h2>
            <div className="modal-fields">
              <div className="modal-field">
                <span className="modal-field-label">Entidad</span>
                <span className="modal-field-value">{selected.entidad || '—'}</span>
              </div>
              <div className="modal-field">
                <span className="modal-field-label">Referencia</span>
                <span className="modal-field-value">{selected.referencia_del_proceso || '—'}</span>
              </div>
              <div className="modal-field">
                <span className="modal-field-label">Estado</span>
                <span className="modal-field-value">{selected.estado_del_procedimiento || '—'}</span>
              </div>
              <div className="modal-field">
                <span className="modal-field-label">Fecha de publicación</span>
                <span className="modal-field-value">
                  {selected.fecha_de_publicacion_del?.split('T')[0] || '—'}
                </span>
              </div>
              <div className="modal-field">
                <span className="modal-field-label">Modalidad</span>
                <span className="modal-field-value">{selected.modalidad_de_contratacion || '—'}</span>
              </div>
              <div className="modal-field">
                <span className="modal-field-label">Precio base</span>
                <span className="modal-field-value">{formatCurrency(selected.precio_base)}</span>
              </div>
              <div className="modal-field">
                <span className="modal-field-label">Tipo de contrato</span>
                <span className="modal-field-value">{selected.tipo_de_contrato || '—'}</span>
              </div>
              <div className="modal-field">
                <span className="modal-field-label">Departamento</span>
                <span className="modal-field-value">{selected.departamento_entidad || '—'}</span>
              </div>
              <div className="modal-field">
                <span className="modal-field-label">Ciudad</span>
                <span className="modal-field-value">{selected.ciudad_entidad || '—'}</span>
              </div>
              <div className="modal-field">
                <span className="modal-field-label">ID del proceso</span>
                <span className="modal-field-value">{selected.id_del_proceso || '—'}</span>
              </div>
            </div>
            <div className="modal-actions">
              {selected.url_proceso && (
                <a
                  href={selected.url_proceso}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',verticalAlign:'middle',marginRight:'6px'}}>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  Revisar proceso
                </a>
              )}
              <button className="btn-secondary" onClick={handleClose}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
