# Arquitectura Inicial - Portal de Convocatorias Públicas

## 1. Propósito del sistema

El Portal de Convocatorias Públicas es una aplicación web para consultar, filtrar y guardar procesos de contratación pública colombiana obtenidos desde datos.gov.co.

El sistema permite que usuarios autenticados busquen convocatorias, consulten resultados paginados y gestionen una lista personal de favoritos.

## 2. Stack tecnológico

```txt
Frontend: React + Vite
Backend: Python + FastAPI
Base de datos: PostgreSQL
ORM: SQLAlchemy o SQLModel
Autenticación: JWT + hash de contraseñas
API externa: datos.gov.co / SODA API
Contenedores: Docker + Docker Compose
```

## 3. Diagrama general

```txt
Usuario
   ↓
Frontend React + Vite
   ↓
Backend FastAPI
   ↓
PostgreSQL

Backend FastAPI
   ↓
datos.gov.co / SECOP
```

## 4. Separación de responsabilidades

```txt
Frontend: interfaz, navegación, estado de sesión y consumo de API interna.
Backend: autenticación, reglas de negocio, integración externa y acceso a datos.
PostgreSQL: persistencia de usuarios y favoritos.
datos.gov.co: fuente externa de convocatorias públicas.
```

El frontend no consulta directamente datos.gov.co.

## 5. Frontend

El frontend debe implementar las vistas necesarias para:

* Registro de usuario.
* Inicio de sesión.
* Inicio privado.
* Búsqueda de convocatorias.
* Visualización de resultados.
* Gestión de favoritos.

Responsabilidades:

* Consumir únicamente la API interna expuesta por FastAPI.
* Enviar credenciales al backend para registro e inicio de sesión.
* Mantener el estado de autenticación del usuario.
* Enviar parámetros de búsqueda y filtros al backend.
* Mostrar una primera consulta de máximo 10 resultados.
* Solicitar más resultados conservando los filtros aplicados.
* Guardar convocatorias como favoritas.
* Listar favoritos del usuario autenticado.
* Eliminar favoritos.
* Manejar estados de carga, error y listas vacías.
* Redirigir usuarios no autenticados al login.
* Permitir cierre de sesión.

## 6. Backend

El backend debe exponer una API REST con FastAPI.

Responsabilidades:

* Registrar usuarios.
* Validar datos de entrada.
* Cifrar contraseñas.
* Autenticar usuarios.
* Generar tokens JWT.
* Validar tokens JWT.
* Proteger rutas privadas.
* Consultar datos.gov.co.
* Construir consultas externas con filtros.
* Manejar paginación mediante `limit` y `offset`.
* Transformar respuestas externas antes de enviarlas al frontend.
* Gestionar favoritos.
* Evitar favoritos duplicados por usuario.
* Garantizar que cada usuario solo acceda a sus propios favoritos.
* Manejar errores de forma consistente.
* Comunicarse con PostgreSQL mediante SQLAlchemy o SQLModel.

## 7. Base de datos

PostgreSQL debe almacenar únicamente información propia del sistema.

Entidades iniciales:

```txt
users
bookmarks
```

Datos de usuarios:

* Identificador único.
* Correo electrónico.
* Contraseña cifrada.
* Fecha de creación.
* Fecha de actualización, si aplica.

Datos de favoritos:

* Identificador único.
* Identificador del usuario propietario.
* Identificador o referencia del proceso externo.
* Entidad.
* Nombre del procedimiento.
* Fecha de publicación.
* Estado del procedimiento.
* Precio base, si existe.
* Modalidad de contratación, si existe.
* URL del proceso, si existe.
* Fecha de creación.

La base de datos no debe almacenar todas las convocatorias externas de datos.gov.co.

## 8. Integración con datos.gov.co

Endpoint base:

```txt
https://www.datos.gov.co/resource/p6dx-8zbt.json
```

La integración con datos.gov.co debe ejecutarse desde el backend.

Campos relevantes del dataset:

```txt
entidad
id_del_proceso
nombre_del_procedimiento
fecha_de_publicacion_del
estado_del_procedimiento
precio_base
modalidad_de_contratacion
estado_de_apertura_del_proceso
urlproceso
```

Filtros iniciales soportados:

```txt
entidad
fecha_de_publicacion_del
estado_del_procedimiento
```

Parámetros de paginación:

```txt
$limit
$offset
```

Reglas de integración:

* Toda consulta debe incluir parámetros de paginación.
* La primera consulta debe solicitar máximo 10 resultados.
* Las consultas posteriores deben permitir solicitar más resultados.
* Las consultas posteriores deben conservar los filtros aplicados.
* El backend debe construir las consultas hacia datos.gov.co.
* El backend debe transformar la respuesta externa a un formato interno estable.
* El backend debe manejar respuestas vacías.
* El backend debe manejar errores de conexión.
* El backend no debe exponer al frontend detalles innecesarios de la API externa.

## 9. Autenticación

Flujo:

```txt
Usuario
   ↓
Frontend
   ↓
FastAPI
   ↓
PostgreSQL
   ↓
FastAPI genera JWT
   ↓
Frontend consume rutas privadas con JWT
```

Reglas:

1. El usuario se registra con correo, contraseña y confirmación de contraseña.
2. El backend valida el formato del correo.
3. El backend valida que la contraseña y la confirmación coincidan.
4. El backend verifica que el correo no exista previamente.
5. El backend cifra la contraseña.
6. El backend guarda el usuario en PostgreSQL.
7. El usuario inicia sesión con correo y contraseña.
8. El backend valida las credenciales.
9. El backend genera un JWT.
10. Las rutas privadas requieren JWT válido.

## 10. Búsqueda de convocatorias

Flujo:

```txt
Usuario autenticado
   ↓
Frontend
   ↓
FastAPI
   ↓
datos.gov.co
   ↓
FastAPI transforma respuesta
   ↓
Frontend muestra resultados
```

Reglas:

1. La búsqueda requiere usuario autenticado.
2. El frontend solicita convocatorias al backend.
3. El backend consulta datos.gov.co.
4. El backend aplica filtros cuando existan.
5. El backend usa `limit` y `offset`.
6. El backend transforma la respuesta externa.
7. El frontend muestra los resultados.

Primera consulta:

```txt
limit = 10
offset = 0
```

## 11. Filtros

Filtros iniciales:

* Entidad.
* Fecha de publicación.
* Estado del procedimiento.

Reglas:

1. Al cambiar filtros, el frontend reinicia la lista de resultados.
2. Al cambiar filtros, la consulta reinicia con `offset = 0`.
3. El backend consulta datos.gov.co con los filtros aplicados.
4. La primera respuesta filtrada debe retornar máximo 10 resultados.
5. Si no hay resultados, el frontend muestra un estado vacío.

## 12. Solicitud de más resultados

La carga incremental debe manejarse con `limit` y `offset`.

```txt
Primera consulta:
limit = 10
offset = 0

Segunda consulta:
limit = 10
offset = 10

Tercera consulta:
limit = 10
offset = 20
```

Reglas:

1. El frontend conserva los filtros actuales.
2. El frontend aumenta el `offset`.
3. El backend consulta datos.gov.co con el nuevo `offset`.
4. El frontend agrega o presenta los nuevos resultados según la decisión de interfaz.
5. Si no hay más resultados, el frontend muestra un estado claro o deshabilita la acción correspondiente.

## 13. Favoritos

Flujo:

```txt
Usuario autenticado
   ↓
Frontend
   ↓
FastAPI
   ↓
PostgreSQL
```

Reglas:

1. El usuario debe estar autenticado para gestionar favoritos.
2. El frontend envía la solicitud al backend.
3. El backend valida el JWT.
4. El backend identifica al usuario autenticado.
5. El backend verifica que el favorito no exista previamente para ese usuario.
6. El backend guarda el favorito en PostgreSQL.
7. El usuario solo puede listar sus propios favoritos.
8. El usuario solo puede eliminar sus propios favoritos.

## 14. Módulos del backend

```txt
auth
users
procurements
bookmarks
```

### auth

Responsabilidades:

* Registro.
* Login.
* Hash de contraseñas.
* Generación de JWT.
* Validación de JWT.
* Dependencias para proteger rutas privadas.

### users

Responsabilidades:

* Modelo de usuario.
* Consulta del usuario autenticado.
* Operaciones internas relacionadas con usuarios.

### procurements

Responsabilidades:

* Consulta de convocatorias desde datos.gov.co.
* Aplicación de filtros.
* Manejo de `limit` y `offset`.
* Transformación de respuestas externas.
* Manejo de errores de la API externa.

### bookmarks

Responsabilidades:

* Guardar favoritos.
* Listar favoritos del usuario autenticado.
* Eliminar favoritos.
* Evitar duplicados.
* Validar propiedad del favorito.

## 15. Estructura del backend

```txt
apps/backend/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   └── security.py
│   ├── database/
│   │   ├── session.py
│   │   └── models.py
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── procurements/
│   │   └── bookmarks/
│   └── shared/
│       └── exceptions.py
├── requirements.txt
└── Dockerfile
```

## 16. Estructura del frontend

```txt
apps/frontend/
├── src/
│   ├── api/
│   ├── components/
│   ├── pages/
│   ├── routes/
│   ├── hooks/
│   ├── context/
│   └── main.jsx
├── package.json
└── Dockerfile
```

## 17. Variables de entorno

El proyecto debe incluir un archivo `.env.example`.

```txt
DATABASE_URL=
JWT_SECRET=
JWT_ALGORITHM=
ACCESS_TOKEN_EXPIRE_MINUTES=
DATOS_GOV_API_URL=
FRONTEND_URL=
```

El archivo `.env` real no debe subirse al repositorio.

## 18. Reglas arquitectónicas

1. El frontend no consulta directamente datos.gov.co.
2. El frontend consume únicamente la API interna del backend.
3. El backend concentra autenticación, reglas de negocio e integración externa.
4. PostgreSQL almacena usuarios y favoritos.
5. PostgreSQL no almacena todas las convocatorias externas.
6. Las contraseñas se almacenan cifradas.
7. La autenticación usa JWT.
8. Las rutas privadas requieren JWT válido.
9. Los favoritos pertenecen a un usuario autenticado.
10. Un usuario no puede acceder a favoritos de otro usuario.
11. La primera consulta de búsqueda solicita máximo 10 resultados.
12. La solicitud de más resultados conserva los filtros aplicados.
13. La paginación se maneja con `limit` y `offset`.
14. El backend transforma la respuesta de datos.gov.co antes de enviarla al frontend.
15. El proyecto expone una API REST.
16. El proyecto se ejecuta con Docker Compose.
