# deuda técnica

## arquitectura y datos

| atajo | por qué | cuándo pagarlo |
|---|---|---|
| sin fk entre contextos (adr 0005) | aislamiento de contextos, se referencia solo por id | si hace falta integridad referencial fuerte |
| sesión: cada operación reescribe el agregado completo (adr 0007) | simplicidad | si el volumen de series o la latencia lo piden |
| sin offline-first, solo guardado progresivo | mvp, sincronizar es mucho laburo | si en el uso real del gimnasio no hay señal y se vuelve un problema |
| seed de rutinas predefinidas busca los ejercicios por nombre | los ids del catálogo se generan al crear la base | si el catálogo se carga por otro lado, pasar a ids fijos |
| límites de valores provisorios (30 ejercicios, 20 series, 1000 reps, 1000 kg, 6 h) | decisión pendiente del paso 12 | al definirlos bien, están todos en `limites.ts` |
| el publicador de sesiones finalizadas carga las sesiones completas y filtra en memoria | simplicidad (adr 0011) | si el historial de un usuario crece mucho: hacer una consulta sql directa que solo traiga lo necesario |
| estadísticas se recalcula entero en cada pedido, sin caché | volumen bajo, y así nunca queda desactualizado | si tarda: caché que se invalide al cambiar una sesión |
| el resumen y la evolución no tienen paginación | volumen bajo | junto con la paginación del historial |

## concurrencia

| atajo | por qué | cuándo pagarlo |
|---|---|---|
| sin control de concurrencia al editar rutinas | un usuario, un dispositivo | si se usa desde varios dispositivos a la vez |
| sin control de concurrencia al registrar series | un usuario, un dispositivo | idem: agregar una columna de versión |

## alcance del mvp

| atajo | por qué | cuándo pagarlo |
|---|---|---|
| sin auditoría de correcciones de sesión | no hay necesidad real en el mvp | si se agregan entrenadores |
| una sola zona horaria para todos (`ZONA_HORARIA`) | usuarios en argentina | si aparecen usuarios de otras zonas |
| listados sin paginación (historial y rutinas) | volumen bajo | al pasar de cientos de sesiones por usuario |
| el resultado de un ejercicio con series a medio hacer (algunas completadas, otras pendientes) da MODIFICADO | una serie pendiente cuenta como no cumplida | si el front necesita mostrar "en progreso" mientras la sesión está en curso |

## seguridad

| atajo | por qué | cuándo pagarlo |
|---|---|---|
| credenciales en `.env` sin gestor de secretos | mvp | antes de cualquier despliegue real |
| jwt sin revocación ni refresh token | mvp, vence en `JWT_EXPIRES_IN` | si hace falta cerrar sesión en todos los dispositivos o acortar la duración |
| el login es más rápido cuando el email no existe (diferencia de tiempo) | no se compara contra un hash falso | antes de un despliegue público |
| sin límite de intentos de login | mvp | antes de un despliegue público (rate limiting) |
| el registro revela si un email ya existe (409) | lo pide el contrato, es lo esperable | si se prioriza privacidad sobre usabilidad |

## calidad

| atajo | por qué | cuándo pagarlo |
|---|---|---|
| sin tests de entrenamiento | reparto de tareas | antes de la entrega |