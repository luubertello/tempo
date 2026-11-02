# Deuda técnica
| Atajo | Motivo | Cuándo pagarla |
|---|---|---|
| Sin offline-first (guardado progresivo) | MVP, complejidad de sync | Si el uso real en gimnasios sin señal lo exige |
| Sin auditoría de correcciones de sesión | No hay necesidad real en el MVP | Si se agregan entrenadores |
| Sin paginación del historial | Volumen bajo | Al superar cientos de sesiones por usuario |
| Sin lastre en ejercicios de peso corporal | Fuera de alcance | Evolución de tipos de medición |
| Credenciales en .env sin gestor de secretos | MVP | Antes de cualquier despliegue real |
| Token JWT sin revocación ni refresh token | MVP; vence en JWT_EXPIRES_IN | Si hace falta cerrar sesión en todos los dispositivos o bajar la duración del token |
| Login más rápido cuando el email no existe (diferencia de tiempo) | No se compara contra un hash falso | Antes de un despliegue público |
| Registro revela si un email ya existe (409) | Lo exige el contrato; es el comportamiento esperado | Si se prioriza privacidad sobre usabilidad |
| Sin límite de intentos de login | MVP | Antes de un despliegue público (rate limiting) |
| Límites de valores provisorios (30 ejercicios, 20 series, 1000 reps, 1000 kg, 6 h) | Decisión pendiente del paso 12 | Al definirlos con el negocio; están en un solo archivo (limites.ts) |
| Seed de rutinas predefinidas busca ejercicios por nombre | Los ids del catálogo se generan al crear la base | Si el catálogo se carga por otra vía, pasar a ids fijos |
| Sin control de concurrencia al editar una rutina (last-write-wins) | Un solo usuario por rutina, uso en un dispositivo | Si se usa desde varios dispositivos a la vez |
| Listados de rutinas sin paginación | Volumen bajo | Junto con la paginación del historial |
| Sin tests de Entrenamiento | Reparto de tareas | Antes de la entrega |
| Sin FK entre contextos (ADR 0005) | Aislamiento de contextos | Si se necesitara integridad referencial fuerte |