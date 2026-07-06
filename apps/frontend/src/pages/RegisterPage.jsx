import { Link } from 'react-router-dom'

export default function RegisterPage() {
  return (
    <div className="page">
      <div className="card">
        <h1>Registrarse</h1>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="mb-2">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="tucorreo@ejemplo.com"
              autoComplete="email"
            />
          </div>

          <div className="mb-2">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
            />
          </div>

          <div className="mb-2">
            <label htmlFor="confirm_password">Confirmar contraseña</label>
            <input
              id="confirm_password"
              type="password"
              name="confirm_password"
              placeholder="Repite tu contraseña"
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            Crear cuenta
          </button>
        </form>

        <p className="text-center text-muted mt-3">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}
