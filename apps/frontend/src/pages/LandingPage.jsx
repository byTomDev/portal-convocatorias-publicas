import { Link } from 'react-router-dom'

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}

function StarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}

function ListIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/>
      <line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/>
      <line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="1"/>
      <line x1="9" y1="6" x2="9.01" y2="6"/>
      <line x1="15" y1="6" x2="15.01" y2="6"/>
      <line x1="9" y1="10" x2="9.01" y2="10"/>
      <line x1="15" y1="10" x2="15.01" y2="10"/>
      <line x1="9" y1="14" x2="9.01" y2="14"/>
      <line x1="15" y1="14" x2="15.01" y2="14"/>
      <path d="M10 18h4"/>
      <line x1="10" y1="18" x2="10.01" y2="18"/>
      <line x1="14" y1="18" x2="14.01" y2="18"/>
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9 12 11 14 15 10"/>
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  )
}

export default function LandingPage() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <span className="landing-logo">Portal de Convocatorias Públicas</span>
        <div className="landing-nav-actions">
          <Link to="/login" className="btn-outline">Iniciar sesión</Link>
          <Link to="/register" className="btn-outline">Registrarme</Link>
        </div>
      </nav>

      <section className="hero">
        <h1 className="hero-title">
          Encuentra las mejores oportunidades<br />
          de contratación pública en Colombia
        </h1>
        <p className="hero-subtitle">
          Accede en tiempo real a miles de procesos del SECOP II.<br />
          Filtra por entidad, fecha o estado. Guarda tus favoritos y haz seguimiento sin complicaciones.
        </p>
        <div className="hero-cta">
          <Link to="/register" className="btn-primary btn-lg">Crear cuenta gratis</Link>
          <Link to="/login" className="btn-outline btn-lg">Ya tengo cuenta</Link>
        </div>
      </section>

      <section className="who-section">
        <h2 className="section-title">¿Para quién es este portal?</h2>
        <div className="who-grid">
          <div className="who-card">
            <div className="who-icon"><BuildingIcon /></div>
            <h3>Empresas y contratistas</h3>
            <p>Empresas pequeñas, medianas y grandes que buscan participar en licitaciones públicas y encontrar nuevas oportunidades de negocio con el Estado.</p>
          </div>
          <div className="who-card">
            <div className="who-icon"><BuildingIcon /></div>
            <h3>Consultores y profesionales</h3>
            <p>Asesores, consultores y profesionales independientes que necesitan hacer seguimiento a procesos de contratación relevantes para su sector.</p>
          </div>
          <div className="who-card">
            <div className="who-icon"><BuildingIcon /></div>
            <h3>Entidades y organizaciones</h3>
            <p>Organizaciones que quieren conocer el panorama de la contratación pública y hacer seguimiento a procesos específicos de su interés.</p>
          </div>
        </div>
      </section>

      <section className="steps-section">
        <h2 className="section-title">¿Cómo funciona?</h2>
        <div className="steps-grid">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Crea tu cuenta</h3>
              <p>Regístrate con tu correo y contraseña en menos de un minuto. Sin costos, sin procesos complejos.</p>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Busca convocatorias</h3>
              <p>Explora procesos del SECOP II. Filtra por entidad, fecha de publicación o estado del procedimiento.</p>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Guarda y haz seguimiento</h3>
              <p>Marca tus favoritas y consulta tu lista desde cualquier dispositivo, cuando lo necesites.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-icon"><ShieldIcon /></div>
            <div>
              <div className="stat-value">Datos abiertos</div>
              <div className="stat-desc">Información oficial del SECOP II</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><CheckCircleIcon /></div>
            <div>
              <div className="stat-value">Sin costo</div>
              <div className="stat-desc">Acceso gratuito para todos los usuarios</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><StarIcon /></div>
            <div>
              <div className="stat-value">Favoritos</div>
              <div className="stat-desc">Guarda y consulta tus procesos favoritos</div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Empieza a explorar convocatorias hoy mismo</h2>
        <p>Únete gratis y accede a miles de procesos públicos en segundos.</p>
        <Link to="/register" className="btn-primary btn-lg">Crear mi cuenta</Link>
      </section>

      <footer className="landing-footer">
        <p>Portal de Convocatorias Públicas &mdash; Datos abiertos de Colombia</p>
      </footer>
    </div>
  )
}
