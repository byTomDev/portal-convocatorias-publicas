import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function HomePage() {
  const { user, logout } = useAuth()

  return (
    <div className="page" style={{ padding: 0 }}>
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
          <div className="header-user">
            <span className="header-email">{user?.email}</span>
            <button className="btn-outline" onClick={logout}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <h2 className="welcome-text">
          Bienvenido{user?.email ? `, ${user.email}` : ''}
        </h2>

        <div className="action-grid">
          <div className="action-card">
            <div className="action-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <h3>Buscar convocatorias</h3>
            <p>Explora procesos de contratación pública del SECOP II</p>
            <Link to="/procurements" className="btn-primary">Buscar</Link>
          </div>

          <div className="action-card">
            <div className="action-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <h3>Mis favoritos</h3>
            <p>Revisa las convocatorias que guardaste</p>
            <Link to="/bookmarks" className="btn-primary">Ver favoritos</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
