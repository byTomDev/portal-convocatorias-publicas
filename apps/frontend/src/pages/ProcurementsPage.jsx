import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProcurements } from '../api/client'

export default function ProcurementsPage() {
  const { user, logout } = useAuth()
  const [filters, setFilters] = useState({
    entity: '',
    status: '',
    start_date: '',
    end_date: '',
  })
  const [procurements, setProcurements] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const [sortField, setSortField] = useState('fecha_desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)

  const sortOptions = [
    { value: 'fecha_desc', label: 'Fecha (recientes)' },
    { value: 'fecha_asc', label: 'Fecha (antiguos)' },
    { value: 'entidad_asc', label: 'Entidad (A-Z)' },
    { value: 'entidad_desc', label: 'Entidad (Z-A)' },
  ]

  const applySort = (data) => {
    return [...data].sort((a, b) => {
      if (sortField === 'fecha_desc') {
        return new Date(b.fecha_de_publicacion_del) - new Date(a.fecha_de_publicacion_del)
      }
      if (sortField === 'fecha_asc') {
        return new Date(a.fecha_de_publicacion_del) - new Date(b.fecha_de_publicacion_del)
      }
      if (sortField === 'entidad_asc') {
        return (a.entidad || '').localeCompare(b.entidad || '')
      }
      if (sortField === 'entidad_desc') {
        return (b.entidad || '').localeCompare(a.entidad || '')
      }
      return 0
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'sort') {
      setSortField(value)
      if (searched) setCurrentPage(1)
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setError('')
    setSearched(true)
    setLoading(true)
    setCurrentPage(1)

    const params = {
      limit: 10,
      offset: 0,
    }
    if (filters.entity) params.entity = filters.entity
    if (filters.status) params.status = filters.status
    if (filters.start_date) params.start_date = filters.start_date
    if (filters.end_date) params.end_date = filters.end_date

    getProcurements(params)
      .then((data) => {
        setProcurements(applySort(data))
        setHasNext(data.length === 10)
      })
      .catch(() => {
        setError('No se pudieron cargar las convocatorias. Intenta de nuevo.')
        setProcurements([])
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleClear = () => {
    setFilters({ entity: '', status: '', start_date: '', end_date: '' })
    setProcurements([])
    setError('')
    setSearched(false)
    setCurrentPage(1)
    setHasNext(false)
  }

  const fetchPage = (page) => {
    setLoading(true)
    const params = {
      limit: 10,
      offset: (page - 1) * 10,
    }
    if (filters.entity) params.entity = filters.entity
    if (filters.status) params.status = filters.status
    if (filters.start_date) params.start_date = filters.start_date
    if (filters.end_date) params.end_date = filters.end_date

    getProcurements(params)
      .then((data) => {
        setProcurements(applySort(data))
        setCurrentPage(page)
        setHasNext(data.length === 10)
      })
      .catch(() => {
        setError('No se pudieron cargar las convocatorias.')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handlePrev = () => {
    if (currentPage > 1) fetchPage(currentPage - 1)
  }

  const handleNext = () => {
    fetchPage(currentPage + 1)
  }

  return (
    <div className="page" style={{ padding: 0 }}>
      <header className="header-bar">
        <div className="header-content">
          <div className="header-brand">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <span>Portal de Convocatorias</span>
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
          <Link to="/home" className="back-link">
            ← Volver al inicio
          </Link>
          <h1>Buscar convocatorias</h1>
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

        <section className="results-section">
          {loading && <p className="text-muted text-center">Cargando convocatorias...</p>}

          {error && <p className="text-error text-center">{error}</p>}

          {!loading && !error && searched && procurements.length === 0 && (
            <p className="text-muted text-center">No se encontraron convocatorias con esos filtros.</p>
          )}

          {!loading && !error && procurements.length > 0 && (
            <>
              <div className="results-header">
                <p className="results-count">{procurements.length} resultado{procurements.length !== 1 ? 's' : ''}</p>
                <div className="sort-bar">
                  <span className="sort-label">Ordenar por:</span>
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      className={`sort-btn${sortField === opt.value ? ' sort-btn--active' : ''}`}
                      onClick={() => {
                        setSortField(opt.value)
                        setCurrentPage(1)
                      }}
                    >
                      {opt.label.replace(/\(.*\)/, '').trim()}
                      {sortField === opt.value && (
                        opt.value.includes('desc') ? ' ↓' : ' ↑'
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <ul className="procurement-list">
                {procurements.map((p) => (
                  <li key={p.id_del_proceso} className="procurement-item">
                    <div className="procurement-name">{p.nombre_del_procedimiento}</div>
                    <div className="procurement-meta">
                      <span>{p.entidad}</span>
                      <span>{p.fecha_de_publicacion_del?.split('T')[0]}</span>
                      <span className="status-badge">{p.estado_del_procedimiento}</span>
                    </div>
                  </li>
                ))}
              </ul>

              {hasNext || currentPage > 1 ? (
                <div className="pagination">
                  <button
                    className="btn-secondary"
                    onClick={handlePrev}
                    disabled={loading || currentPage === 1}
                  >
                    ← Anterior
                  </button>
                  <span className="pagination-info">Página {currentPage}</span>
                  <button
                    className="btn-secondary"
                    onClick={handleNext}
                    disabled={loading || !hasNext}
                  >
                    Siguiente →
                  </button>
                </div>
              ) : null}
            </>
          )}
        </section>
      </main>
    </div>
  )
}
