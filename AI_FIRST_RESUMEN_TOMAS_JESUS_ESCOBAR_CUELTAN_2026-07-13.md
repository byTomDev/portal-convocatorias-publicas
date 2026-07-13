# Resumen AI First — Tomás Jesús Escobar Cuéllan

**Proyecto:** Portal de Convocatorias Públicas
**Fecha:** 2026-07-13
**Repositorio:** https://github.com/byTomDev/portal-convocatorias-publicas

---

## Introducción

Ya contaba con experiencia previa usando agentes, LLMs y prompt engineering. Ese conocimiento previo no hizo el proyecto más fácil en sí, pero sí redujo la curva de fricción inicial: entendía que un buen contexto, buenos skills y saber programar hacen la diferencia cuando se trabaja con un agente que no tiene visibilidad directa del código.

Trabajo en bloques cortos de tiempo. Durante las dos últimas semanas simultaneé el desarrollo del portal con la operación diaria, así que los espacios para trabajar fueron breves y no siempre consecutivos. Eso influyó en cómo estructuré las sesiones: dividía las tareas en unidades pequeñas, las enviaba a Hermes y revisaba los resultados cuando podía dedicarle tiempo.

La combinación de experiencia previa, contexto bien definido (AGENTS.md, skills, estructura del repo) y una estrategia de trabajo por partes fue lo que permitió avanzar sin bloqueos prolongados.

---

## 1. Proyecto

El **Portal de Convocatorias Públicas** es una aplicación web que permite a usuarios registrados consultar, filtrar y guardar convocatorias públicas colombianas del SECOP II, obtenidas desde datos.gov.co.

Problema que resuelve: centralizar el acceso a procesos de contratación pública colombiana con autenticación, búsqueda con filtros y persistencia de favoritos, sin que el frontend dependa directamente de la API externa.

---

## 2. Stack y Arquitectura

**Stack definido en AGENTS.md:**

- Frontend: React + Vite
- Backend: Python + FastAPI
- Base de datos: PostgreSQL
- ORM: SQLAlchemy o SQLModel
- Autenticación: JWT + hash de contraseñas
- API externa: datos.gov.co / SODA API
- Contenedores: Docker + Docker Compose

**Flujo de una consulta:**

```
Usuario → Frontend (React) → Backend (FastAPI) → datos.gov.co
                 ↑                                  ↓
                 └──────── PostgreSQL ←─────────────┘
```

**Módulos backend:** auth (registro, login, JWT), users, procurements (consulta externa + filtros), bookmarks (gestión de favoritos).

---

## 3. Cómo Usé Hermes y los LLMs

### Skills disponibles en el proyecto

El repo expone `.agents/skills/` con patrones de referencia: prompt-engineering-patterns, frontend-design, api-design-principles, error-handling-patterns, systematic-debugging, postgresql-table-design, interface-design, brainstorming, company-commit-standards, vercel-react-best-practices, changelog-generator.

### Estrategia de prompts

- **Prompts cortos bajo plantilla:** objetivo claro, tarea específica, restricciones y formato de respuesta esperado.
- **Divide y vencerás:** una tarea por prompt para evitar divagación o mezcla de responsabilidades entre módulos.
- **AGENTS.md como contexto estable:** antes de cada sesión o decisión técnica, revisar el documento maestro para no contradecir reglas existentes.

### Qué funcionó bien

- Revisar commits recientes (`git log --oneline -20`) para entender el estado real del código y detectar qué se había implementado recientemente.
- Revisar estructura de archivos antes de pedir cambios (`apps/backend/app/modules/`, `apps/frontend/src/pages/`).
- Pedir al agente que revisara `AGENTS.md` y `.agents/skills/` antes de generar código.
- Usar `git diff --stat HEAD~10..HEAD` para ver qué archivos cambiaron en las últimas iteraciones y enfocar la revisión.

### Iteraciones frecuentes (evidencia por commits)

1. **Filtros de favoritos** (`533e84d`): agregar filtros por entidad, estado y fecha a la página de favoritos con paginación en el backend.
2. **Paginación de favoritos** (`5379f55`): paginar lista de favoritos con 10 por página y botones Anterior/Siguiente en frontend.
3. **Errores de API externa** (`6ec3ead`): propagar errores de datos.gov.co al frontend en lugar de devolver lista vacía.
4. **Modal de detalle en favoritos** (`c7414a8`, `ebed73a`): agregar modal con enlace "Revisar proceso" al favorito.
5. **Normalización de URL** (`3b48858`): corregir acceso a `url_proceso` que llegaba como objeto y no como string directo.
6. **Validación de email duplicado** (`3d68b65`): mostrar mensaje claro en vez de error genérico 500.
7. **Botón limpiar filtros**: pequeño ajuste en la UI de búsqueda para resetear filtros sin recargar.
8. **Logout funcional en todas las vistas**: asegurar que el cierre de sesión funcionara consistentemente desde cualquier página privada.

---

## 4. Decisiones y Trade-offs

### Decisión: FastAPI en backend

**Razón:**  
FastAPI ofrece validación de tipos con Pydantic, documentación automática con OpenAPI y rendimiento comparable a Node.js. Elegí un framework que ya conocía para no invertir tiempo en aprender herramientas nuevas.

**Trade-off:**  
Se ganó velocidad de desarrollo y seguridad de tipos en la API. Se aceptó trabajar con un framework asíncrono que requiere manejar `async/await` correctamente, especialmente en las llamadas HTTP externas a datos.gov.co.

**Resultado:**  
El backend quedó estructurado en módulos claros (auth, procurements, bookmarks) con rutas protegidas por JWT. La documentación de la API se generó automáticamente, lo que facilitó verificar los endpoints sin herramientas adicionales.

---

### Decisión: React + Vite en frontend

**Razón:**  
Vite ofrece tiempos de arranque rápidos y hot module replacement, lo que mejora la experiencia durante desarrollo. React tiene un ecosistema maduro de componentes y hooks que cubre las necesidades del proyecto.

**Trade-off:**  
Se ganó productividad en desarrollo. Se aceptó la complejidad adicional de gestionar estado con hooks y context (en lugar de un framework más opinado como Next.js), lo que requirió algo de código repetitivo para cosas como el estado de autenticación global.

**Resultado:**  
El frontend se organizó en `api/`, `components/`, `pages/`, `routes/`, `hooks/` y `context/`. La separación fue suficiente para el alcance actual; si el proyecto crece, podría evaluarse React Query o un gestor de estado más robusto.

---

### Decisión: PostgreSQL como base de datos

**Razón:**  
PostgreSQL es la base de datos recomendada en AGENTS.md. Soporta JSON, tiene buen rendimiento con Docker y es ampliamente usada en proyectos similares.

**Trade-off:**  
Se ganó robustez y compatibilidad con el stack definido. Se aceptó la necesidad de configurar y mantener un contenedor de base de datos, aunque Docker Compose lo simplificó.

**Resultado:**  
Tres tablas principales: `users`, `procurements` y `bookmarks`. La tabla `procurements` solo almacena favoritos guardados, no el dataset completo de datos.gov.co.

---

### Decisión: Frontend sin consumo directo de datos.gov.co

**Razón:**  
Mantener todas las llamadas a la API externa en el backend permite transformar los datos antes de enviarlos al frontend, evitar que el frontend dependa de la estructura del dataset externo, y centralizar el manejo de errores de la API externa en un solo lugar.

**Trade-off:**  
Se ganó desacoplamiento y estabilidad en la interfaz. Se aceptó que cada consulta de convocatorias requiere un salto adicional (frontend → backend → datos.gov.co → backend → frontend), lo que añade latencia.

**Resultado:**  
El backend transforma la respuesta de datos.gov.co a un formato interno estable (`external_id`, `entity`, `procedure_name`, etc.). Si la estructura del dataset externo cambia, solo hay que ajustar la transformación en el backend.

---

### Decisión: Búsqueda en favoritos desde el backend

**Razón:**  
Los favoritos se guardan en PostgreSQL, no en la API externa. Filtrarlos desde el backend permite usar la misma lógica de filtros que se aplica en la consulta de convocatorias, y mantener la paginación del lado del servidor.

**Trade-off:**  
Se ganó consistencia entre filtros de búsqueda y de favoritos, y la capacidad de paginar favoritos sin cargar todos los registros en memoria. Se aceptó会增加 algo de carga en PostgreSQL al ejecutar consultas con filtros sobre la tabla de favoritos, aunque para el volumen esperado del MVP es despreciable.

**Resultado:**  
`GET /bookmarks` acepta los mismos parámetros de filtro que `GET /procurements` (`entity`, `status`, `start_date`, `end_date`, `limit`, `offset`). La paginación funciona consistentemente en ambas vistas.

---

### Decisión: Botón Buscar manual en lugar de búsqueda automática contra la API pública

**Razón:**  
Cada llamada a datos.gov.co consume recursos de la API pública. Una búsqueda automática (tipo Google) generaría muchas llamadas innecesarias, especialmente si el usuario refine los filtros varias veces antes de encontrar lo que busca. Además, existe riesgo de bloqueo o consumo indebido si se hacen demasiadas solicitudes.

**Trade-off:**  
Se ganó control sobre el uso de la API externa y reducción de llamadas innecesarias. Se aceptó que el usuario debe hacer clic explícitamente en "Buscar" cada vez que cambia un filtro, lo que puede ser menos fluido en experiencia.

**Resultado:**  
El usuario aplica filtros y presiona "Buscar". El backend recibe la solicitud, construye la consulta filtrada a datos.gov.co, y devuelve los resultados. Los filtros se mantienen entre solicitudes de paginación.

---

### Decisión: Prompts cortos bajo plantilla

**Razón:**  
Los prompts largos tienden a perder foco. Usar plantillas con objetivo, tarea, restricciones y respuesta esperada redujo la divagación y aumentó la precisión de los resultados.

**Trade-off:**  
Se ganó claridad y menor tasa de iteración por error. Se aceptó que requiere más disciplina para estructurar cada prompt, especialmente cuando la tarea involucra múltiples archivos o cambios interdependientes.

**Resultado:**  
Las iteraciones por commit muestran cambios pequeños y focales: un fix a la vez, una funcionalidad a la vez. No hubo grandes refactors que rompieran múltiples cosas simultáneamente.

---

### Decisión: Uso de skills y contexto del proyecto

**Razón:**  
Los skills disponibles en `.agents/skills/` y el documento AGENTS.md proporcionan estructura, patrones y reglas que no es necesario repetir en cada prompt. Usarlos reduce el contexto necesario en cada mensaje y aumenta la consistencia.

**Trade-off:**  
Se ganó productividad y adherence a estándares del proyecto. Se aceptó la necesidad de mantener esos archivos actualizados cuando las decisiones técnicas cambian, para que no se conviertan en documentación obsoleta.

**Resultado:**  
Cada nueva sesión comenzaba con revisión de AGENTS.md y estructura del proyecto. Eso permitió pedir cambios que respetaran la arquitectura existente sin necesidad de explicar el stack completo en cada prompt.

---

## 5. Bloqueos y Cómo los Resolví

- **`urlproceso` como objeto en lugar de string:** la API de datos.gov.co devolvía `urlproceso` como `{url: "..."}` en vez de string directo. Se resolvió extrayendo `urlproceso.url` en el backend antes de enviar al frontend.

- **API externa devolvía lista vacía silenciosamente:** cuando datos.gov.co fallaba, el backend devolvía `[]` sin indicar error, confundiendo al usuario. Se cambió para propagar el error HTTP 502 con mensaje amigable.

- **Email duplicado mostraba error genérico:** el registro con email ya existente lanzaba una excepción no manejada. Se agregó validación específica que retorna HTTP 409 con mensaje claro.

- **Paginación de favoritos no existía:** el backend no soportaba paginación en `/bookmarks`, lo que hacía la lista impráctica con muchos registros. Se implementó con `limit`/`offset` tanto en backend como en frontend.

- **Filtros no existían en la vista de favoritos:** se agregaron filtros por entidad, estado y fecha que se aplican desde el backend sobre los favoritos ya guardados.

- **Logout inconsistente entre vistas:** el botón de cierre de sesión no funcionaba en todas las páginas privadas. Se unificó la gestión del estado de autenticación en `AuthContext` y se aseguró que cada página privada lo usara correctamente.

---

## 6. Qué Mejoraría o Pediría

### Mejoras internas

- **Tests de integración más completos:** cubrir el flujo completo registro → login → consulta → favorito con tests automatizados.
- **Validación de fechas en filtros:** actualmente no se valida que `start_date` sea anterior a `end_date`.
- **Interceptor de token expirado:** cuando el JWT expira, el usuario queda en una zona privada sin saber que necesita re-autenticarse. Un interceptor que detecte 401 y redirija a login mejoraría la UX.
- **Rate limiting en endpoints públicos:** el endpoint de registro/login no tiene protección contra fuerza bruta.

### Lo que pediría a nivel de infraestructura

- **Cola de jobs para sincronización:** si se quisiera cachear convocatorias o hacer sync periódico, una cola (Celery + Redis) permitiría trabajos en background sin bloquear requests.
- **Monitoreo de la API externa:** un dashboard simple que registre disponibilidad y tiempos de respuesta de datos.gov.co permitiría detectar degradación antes de quejarse el usuario.
- **Logs centralizados:** centralizar logs de backend (no solo en consola) facilitaría debugging en producción.

### Contexto que faltó registrar

- Tiempo estimado vs. tiempo real por tarea (no se trackeó con rigor).
- Decisiones de diseño que se descartaron y por qué (no hay log de decisiones más allá de commits).
- Volumen real de uso: sin métricas de uso es difícil priorizar qué mejorar primero.

---

## 7. Enlace al Repositorio

https://github.com/byTomDev/portal-convocatorias-publicas

---

## Nota sobre el documento

Este resumen se basa en revisión de: commits recientes (`git log`), diff de últimos cambios (`git diff --stat HEAD~10..HEAD`), estructura del proyecto (`apps/backend`, `apps/frontend`), AGENTS.md y skills disponibles en `.agents/skills/`.

Los puntos mencionados reflejan evidencia real del proceso de desarrollo según los commits y la arquitectura documentada. No se inventan resultados ni se exageran logros.
