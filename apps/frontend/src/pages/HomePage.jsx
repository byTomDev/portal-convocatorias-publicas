import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function HomePage() {
  const { user, logout } = useAuth()

  return (
    <div className="page">
      <h1>Portal de Convocatorias Públicas</h1>
      <p>Bienvenido{user?.email ? `, ${user.email}` : ''}</p>
      <nav>
        <Link to="/procurements">Buscar convocatorias</Link>
        {' | '}
        <Link to="/bookmarks">Mis favoritos</Link>
      </nav>
      <button onClick={logout} style={{ marginTop: '1rem' }}>
        Cerrar sesión
      </button>
    </div>
  )
}
