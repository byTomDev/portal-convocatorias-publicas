import { Link } from 'react-router-dom'

export default function LoginPage() {
  return (
    <div className="page">
      <div className="card">
        <h1>Iniciar sesión</h1>

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
              placeholder="Tu contraseña"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            Iniciar sesión
          </button>
        </form>

        <p className="text-center text-muted mt-3">
          ¿No tienes cuenta?{' '}
          <Link to="/register">Regístrate</Link>
        </p>
      </div>
    </div>
  )
}
