# Requisitos del MVP - Portal de Convocatorias Públicas

## 1. Propósito del documento

Este documento define los requisitos funcionales del MVP del Portal de Convocatorias Públicas.

El contenido sirve como referencia para determinar qué funcionalidades forman parte del alcance actual, qué criterios mínimos debe cumplir cada historia de usuario y qué reglas funcionales deben mantenerse durante el desarrollo.

---

## 2. Producto

El Portal de Convocatorias Públicas es una aplicación web que permite a usuarios registrados consultar, filtrar y guardar convocatorias públicas colombianas obtenidas desde datos.gov.co.

El sistema debe permitir:

* Registro de usuarios.
* Inicio de sesión.
* Acceso a una zona privada.
* Consulta de convocatorias públicas reales.
* Filtros básicos de búsqueda.
* Visualización de resultados paginados.
* Gestión de favoritos persistidos en base de datos.

---

## 3. Fuente de datos externa

La fuente de datos externa del sistema es datos.gov.co.

Dataset principal:

```txt
https://www.datos.gov.co/resource/p6dx-8zbt.json
```

La integración con esta API debe realizarse desde el backend.

El frontend no debe consultar directamente datos.gov.co.

---

## 4. Alcance funcional actual

El alcance funcional actual incluye:

* Registro simple con correo, contraseña y confirmación de contraseña.
* Inicio de sesión con correo y contraseña.
* Autenticación mediante JWT.
* Protección de rutas privadas.
* Página inicial privada para usuarios autenticados.
* Consulta de convocatorias desde datos.gov.co.
* Filtro por entidad.
* Filtro por fecha de publicación.
* Filtro por estado del procedimiento.
* Primera consulta de máximo 10 resultados.
* Solicitud de más resultados conservando filtros aplicados.
* Guardado de convocatorias como favoritas.
* Listado de favoritos del usuario autenticado.
* Eliminación de favoritos.
* Persistencia de usuarios y favoritos en PostgreSQL.

---

## 5. Fuera del alcance actual

Las siguientes funcionalidades no hacen parte del alcance actual:

* Confirmación de correo electrónico.
* Recuperación de contraseña.
* Completar perfil de usuario.
* Roles de administrador.
* Dashboard avanzado.
* Notificaciones.
* Envío de correos.
* Exportación de resultados.
* Recomendaciones personalizadas.
* Búsquedas guardadas.
* Persistencia completa de convocatorias externas.
* Indexación propia del dataset externo.

Estas funcionalidades solo deben implementarse si existe una decisión explícita y documentada que actualice el alcance del proyecto.

---

## 6. Historias de usuario del alcance actual

## HU-01: Registro simple

Como visitante, quiero registrarme con correo electrónico, contraseña y confirmación de contraseña, para crear una cuenta en el portal.

### Criterios de aceptación

* El formulario debe solicitar correo electrónico.
* El formulario debe solicitar contraseña.
* El formulario debe solicitar confirmación de contraseña.
* El backend debe validar el formato del correo.
* El backend debe validar que la contraseña y la confirmación coincidan.
* El backend debe rechazar correos duplicados.
* El backend debe almacenar la contraseña cifrada.
* Al registrarse correctamente, el usuario debe poder iniciar sesión.
* El sistema debe mostrar errores claros cuando el registro falle.

---

## HU-02: Inicio de sesión

Como usuario registrado, quiero iniciar sesión con correo y contraseña, para acceder a mi cuenta.

### Criterios de aceptación

* El formulario debe solicitar correo electrónico.
* El formulario debe solicitar contraseña.
* El backend debe validar las credenciales.
* El backend debe rechazar credenciales inválidas.
* El backend debe generar un JWT cuando las credenciales sean correctas.
* El frontend debe gestionar el token para consumir rutas privadas.
* El sistema debe mostrar errores claros cuando el login falle.

---

## HU-03: Inicio privado

Como usuario autenticado, quiero acceder a una página principal privada, para usar las funcionalidades del portal.

### Criterios de aceptación

* Solo usuarios autenticados pueden acceder a la página privada.
* Usuarios no autenticados deben ser redirigidos al login.
* La página privada debe permitir navegar hacia búsqueda de convocatorias.
* La página privada debe permitir navegar hacia favoritos.
* La página privada debe permitir cerrar sesión.
* El cierre de sesión debe invalidar el estado de autenticación en el frontend.

---

## HU-04: Buscar convocatorias públicas

Como usuario autenticado, quiero consultar convocatorias públicas desde datos.gov.co, para encontrar oportunidades relevantes.

### Criterios de aceptación

* La búsqueda debe requerir usuario autenticado.
* El frontend debe solicitar los resultados al backend.
* El backend debe consultar datos.gov.co.
* El frontend no debe consultar directamente datos.gov.co.
* La consulta debe usar datos reales de la API pública.
* La primera consulta debe solicitar máximo 10 resultados.
* El backend debe transformar la respuesta externa antes de enviarla al frontend.
* El frontend debe mostrar los resultados recibidos.
* El sistema debe manejar respuestas vacías.
* El sistema debe manejar errores de la API externa.

---

## HU-05: Filtrar convocatorias

Como usuario autenticado, quiero filtrar convocatorias por entidad, fecha y estado, para encontrar resultados más precisos.

### Criterios de aceptación

* El sistema debe permitir filtrar por entidad.
* El sistema debe permitir filtrar por fecha de publicación.
* El sistema debe permitir filtrar por estado del procedimiento.
* Los filtros deben enviarse al backend.
* El backend debe construir la consulta correspondiente hacia datos.gov.co.
* Al cambiar filtros, la búsqueda debe reiniciar desde `offset = 0`.
* La primera respuesta filtrada debe solicitar máximo 10 resultados.
* Si no hay resultados, el frontend debe mostrar un estado vacío.
* Si ocurre un error, el frontend debe mostrar un estado de error.

---

## HU-06: Solicitar más resultados

Como usuario autenticado, quiero solicitar más resultados de búsqueda, para continuar explorando convocatorias sin perder los filtros aplicados.

### Criterios de aceptación

* El sistema debe permitir solicitar resultados adicionales.
* Las solicitudes adicionales deben conservar los filtros actuales.
* Las solicitudes adicionales deben usar `limit` y `offset`.
* El backend debe consultar datos.gov.co usando el nuevo `offset`.
* El frontend debe mostrar o agregar los nuevos resultados según la decisión de interfaz.
* Si no hay más resultados, el frontend debe mostrar un estado claro o deshabilitar la acción correspondiente.
* La solicitud de más resultados no debe reiniciar los filtros aplicados.

---

## HU-07: Guardar convocatoria como favorita

Como usuario autenticado, quiero guardar una convocatoria como favorita, para revisarla más tarde.

### Criterios de aceptación

* Solo usuarios autenticados pueden guardar favoritos.
* El frontend debe enviar la solicitud al backend.
* El backend debe validar el JWT.
* El backend debe identificar al usuario autenticado.
* El backend debe asociar el favorito al usuario autenticado.
* El backend debe evitar favoritos duplicados para el mismo usuario.
* El favorito debe persistirse en PostgreSQL.
* El favorito debe guardar información básica suficiente para mostrarse posteriormente.
* El sistema debe mostrar confirmación o cambio visual al guardar.

---

## HU-08: Ver favoritos

Como usuario autenticado, quiero ver mis convocatorias favoritas, para hacer seguimiento a oportunidades guardadas.

### Criterios de aceptación

* Solo usuarios autenticados pueden consultar favoritos.
* El backend debe validar el JWT.
* El backend debe listar únicamente los favoritos del usuario autenticado.
* El frontend debe mostrar los favoritos recibidos.
* Si el usuario no tiene favoritos, el frontend debe mostrar un estado vacío.
* Un usuario no debe poder ver favoritos de otro usuario.

---

## HU-09: Eliminar favorito

Como usuario autenticado, quiero eliminar una convocatoria de mis favoritos, para mantener actualizada mi lista.

### Criterios de aceptación

* Solo usuarios autenticados pueden eliminar favoritos.
* El backend debe validar el JWT.
* El backend debe verificar que el favorito pertenece al usuario autenticado.
* El backend debe eliminar el favorito de PostgreSQL.
* El frontend debe actualizar la lista después de eliminar.
* Un usuario no debe poder eliminar favoritos de otro usuario.
* El sistema debe manejar errores de eliminación.

---

## 7. Historias futuras o nuevas HU

Esta sección se usará para agregar nuevas historias de usuario cuando el alcance del proyecto evolucione.

Las nuevas historias deben agregarse con el siguiente formato:

```md
## HU-XX: Nombre de la historia

Como [tipo de usuario], quiero [acción o funcionalidad], para [beneficio o propósito].

### Criterios de aceptación

- Criterio 1.
- Criterio 2.
- Criterio 3.
```

Reglas para agregar nuevas HU:

* Cada nueva historia debe tener un identificador único.
* Cada nueva historia debe tener criterios de aceptación.
* Si una nueva historia cambia arquitectura, debe actualizarse `docs/02-architecture.md`.
* Si una nueva historia cambia reglas técnicas, debe actualizarse `docs/03-project-rules.md`.
* Si una nueva historia afecta la integración con datos.gov.co, debe actualizarse `docs/04-secops-api-integration.md`.

---

## 8. Reglas funcionales principales

1. El registro usa correo, contraseña y confirmación de contraseña.
2. No se permite registrar dos usuarios con el mismo correo.
3. Las contraseñas se almacenan cifradas.
4. El login genera JWT.
5. Las rutas privadas requieren JWT válido.
6. La búsqueda de convocatorias requiere usuario autenticado.
7. El frontend consume únicamente la API interna del backend.
8. El backend consulta datos.gov.co.
9. La primera búsqueda solicita máximo 10 resultados.
10. Las solicitudes posteriores conservan los filtros aplicados.
11. La paginación se maneja con `limit` y `offset`.
12. Los filtros iniciales son entidad, fecha de publicación y estado del procedimiento.
13. Los favoritos pertenecen a un usuario autenticado.
14. Un usuario no puede ver favoritos de otro usuario.
15. Un usuario no puede eliminar favoritos de otro usuario.
16. No se almacenan todas las convocatorias externas.
17. Solo se almacena información básica cuando una convocatoria se guarda como favorita.

---

## 9. Criterios de finalización del alcance actual

El alcance actual se considera funcional cuando:

* Un visitante puede registrarse.
* Un usuario registrado puede iniciar sesión.
* Un usuario autenticado puede acceder a una zona privada.
* Un usuario autenticado puede consultar convocatorias reales desde datos.gov.co.
* Un usuario autenticado puede aplicar filtros básicos.
* Un usuario autenticado puede solicitar más resultados.
* Un usuario autenticado puede guardar convocatorias como favoritas.
* Un usuario autenticado puede listar sus favoritos.
* Un usuario autenticado puede eliminar favoritos.
* Los favoritos persisten en PostgreSQL.
* El frontend no consulta directamente datos.gov.co.
* El proyecto puede ejecutarse con Docker Compose.
