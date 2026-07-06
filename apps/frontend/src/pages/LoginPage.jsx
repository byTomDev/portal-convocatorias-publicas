import { Link } from 'react-router-dom'

export default function LoginPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Iniciar sesión</h1>
      {/* TODO: connect form to AuthContext + backend */}
      <p>Formulario de login próximamente.</p>
      <Link to="/register">¿No tienes cuenta? Regístrate</Link>
    </div>
  )
}
