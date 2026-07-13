import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getBookmarks, deleteBookmark } from '../api/client'

const formatCurrency = (val) => {
  if (!val) return '—'
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(Number(val))
}

export default function BookmarksPage() {
  const { user, logout } = useAuth()
  const [filters, setFilters] = useState({
    entity: '',
    status: '',
    start_date: '',
    end_date: '',
  })
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [selected, setSelected] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [toast, setToast] = useState(null)

  const LIMIT = 10

  const handleChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const buildParams = (page) => {
    const params = { limit: LIMIT, offset: (page - 1) * LIMIT }
    if (filters.entity) params.entity = filters.entity
    if (filters.status) params.status = filters.status
    if (filters.start_date) params.start_date = filters.start_date
    if (filters.end_date) params.end_date = filters.end_date
    return params
  }

  const fetchPage = (page) => {
    setLoading(true)
    getBookmarks(buildParams(page))
      .then((data) => {
        setBookmarks(data)
        setCurrentPage(page)
        setHasNext(data.length === LIMIT)
        setInitialized(true)
      })
      .catch(() => {
        setError('No se pudieron cargar los favoritos. Intenta de nuevo.')
        setBookmarks([])
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setError('')
    setSearched(true)
    fetchPage(1)
  }

  const handleClear = () => {
    setFilters({ entity: '', status: '', start_date: '', end_date: '' })
    setError('')
    setCurrentPage(1)
    setHasNext(false)
    // Llamada directa con params limpios — no depende de filters stale via closure
    setLoading(true)
    getBookmarks({ limit: LIMIT, offset: 0 })
      .then((data) => {
        setBookmarks(data)
        setCurrentPage(1)
        setHasNext(data.length === LIMIT)
        setInitialized(true)
      })
      .catch(() => {
        setError('No se pudieron cargar los favoritos. Intenta de nuevo.')
        setBookmarks([])
      })
      .finally(() => setLoading(false))
  }

  const handlePrev = () => {
    if (currentPage > 1) fetchPage(currentPage - 1)
  }

  const handleNext = () => {
    fetchPage(currentPage + 1)
  }

  const handleOpen = (b) => setSelected(b)
  const handleClose = () => setSelected(null)

  const handleDelete = async (b) => {
    setDeletingId(b.id)
    try {
      await deleteBookmark(b.id)
      setSelected(null)
      setToast({ type: 'success', message: 'Eliminado de favoritos' })
      setTimeout(() => setToast(null), 3000)
      // Refrescar la página actual
      fetchPage(currentPage)
    } catch {
      setToast({ type: 'error', message: 'No se pudo eliminar. Intenta de nuevo.' })
      setTimeout(() => setToast(null), 3000)
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    setSearched(true)
    fetchPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  return (
    <div className="page" style={{ padding: 0 }}>
      <header className="header-bar">
        <div className="header-content">
          <div className="header-brand">
            <Link to="/home">Portal de Convocatorias Públicas</Link>
          </div>
          <div className="header-user">
            <span className="header-email">{user?.email}</span>
            <button className="btn-outline" onClick={logout}>
              Cerrar sesión
            </button>
          </div>
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

        <form className="filters-form" onSubmit={handleSearch}>
          <div className="filter-row">
            <div className="filter-field">
              <label htmlFor="entity">Entidad</label>
              <input
                type="text"
                id="entity"
                name="entity"
                placeholder="Ej: DANE"
                value={filters.entity}
                onChange={handleChange}
              />
            </div>

            <div className="filter-field">
              <label htmlFor="status">Estado</label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleChange}
              >
                <option value="">Todos</option>
                <option value="Seleccionado">Seleccionado</option>
                <option value="Publicado">Publicado</option>
                <option value="Evaluación">Evaluación</option>
                <option value="Cancelado">Cancelado</option>
                <option value="Borrador">Borrador</option>
                <option value="Abierto">Abierto</option>
                <option value="Aprobado">Aprobado</option>
                <option value="En aprobación">En aprobación</option>
                <option value="Suspendido">Suspendido</option>
              </select>
            </div>

            <div className="filter-field">
              <label htmlFor="start_date">Fecha inicio</label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={filters.start_date}
                onChange={handleChange}
              />
            </div>

            <div className="filter-field">
              <label htmlFor="end_date">Fecha fin</label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={filters.end_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="filter-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
            <button type="button" className="btn-secondary" onClick={handleClear}>
              Limpiar
            </button>
          </div>
        </form>

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

        {!loading && !error && searched && initialized && bookmarks.length === 0 && (
          <div className="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <p>No se encontraron favoritos con esos filtros.</p>
          </div>
        )}

        {!loading && !error && !initialized && bookmarks.length === 0 && (
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
              {bookmarks.length} favorito{bookmarks.length !== 1 ? 's' : ''}
              {hasNext ? '+' : ''} — Página {currentPage}
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
            {(hasNext || currentPage > 1) && (
              <div className="pagination-bar">
                <button
                  className="btn-outline"
                  onClick={handlePrev}
                  disabled={loading || currentPage <= 1}
                >
                  ← Anterior
                </button>
                <span className="pagination-info">Página {currentPage}</span>
                <button
                  className="btn-outline"
                  onClick={handleNext}
                  disabled={loading || !hasNext}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {toast && (
        <div className={`toast toast--${toast.type}`}>
          {toast.message}
        </div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{selected.procurement?.nombre_del_procedimiento || 'Detalle de convocatoria'}</h2>
            <div className="modal-fields">
              <div className="modal-field">
                <span className="modal-field-label">Entidad</span>
                <span className="modal-field-value">{selected.procurement?.entidad || '—'}</span>
              </div>
              <div className="modal-field">
                <span className="modal-field-label">Referencia</span>
                <span className="modal-field-value">{selected.procurement?.referencia_del_proceso || '—'}</span>
              </div>
              <div className="modal-field">
                <span className="modal-field-label">Estado</span>
                <span className="modal-field-value">{selected.procurement?.estado_del_procedimiento || '—'}</span>
              </div>
              <div className="modal-field">
                <span className="modal-field-label">Fecha de publicación</span>
                <span className="modal-field-value">
                  {selected.procurement?.fecha_de_publicacion_del?.split('T')[0] || '—'}
                </span>
              </div>
              <div className="modal-field">
                <span className="modal-field-label">Modalidad</span>
                <span className="modal-field-value">{selected.procurement?.modalidad_de_contratacion || '—'}</span>
              </div>
              <div className="modal-field">
                <span className="modal-field-label">Precio base</span>
                <span className="modal-field-value">{formatCurrency(selected.procurement?.precio_base)}</span>
              </div>
              <div className="modal-field">
                <span className="modal-field-label">Tipo de contrato</span>
                <span className="modal-field-value">{selected.procurement?.tipo_de_contrato || '—'}</span>
              </div>
              <div className="modal-field">
                <span className="modal-field-label">Departamento</span>
                <span className="modal-field-value">{selected.procurement?.departamento_entidad || '—'}</span>
              </div>
              <div className="modal-field">
                <span className="modal-field-label">Ciudad</span>
                <span className="modal-field-value">{selected.procurement?.ciudad_entidad || '—'}</span>
              </div>
              <div className="modal-field">
                <span className="modal-field-label">ID del proceso</span>
                <span className="modal-field-value">{selected.procurement?.id_del_proceso || '—'}</span>
              </div>
              {selected.procurement?.url_proceso && (
                <div className="modal-field-link">
                  <a
                    href={selected.procurement.url_proceso}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',verticalAlign:'middle',marginRight:'6px'}}>
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    Revisar proceso en datos.gov.co
                  </a>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button
                className="btn-danger"
                onClick={() => handleDelete(selected)}
                disabled={deletingId !== null}
              >
                {deletingId ? 'Eliminando...' : 'Eliminar de favoritos'}
              </button>
              <button className="btn-secondary" onClick={handleClose}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
