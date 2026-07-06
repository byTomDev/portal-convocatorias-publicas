import { Link } from 'react-router-dom'

export default function RegisterPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Registrarse</h1>
      {/* TODO: connect form to AuthContext + backend */}
      <p>Formulario de registro próximamente.</p>
      <Link to="/login">¿Ya tienes cuenta? Inicia sesión</Link>
    </div>
  )
}
