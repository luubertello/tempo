# Deuda técnica
| Atajo | Motivo | Cuándo pagarla |
|---|---|---|
| Sin offline-first (guardado progresivo) | MVP, complejidad de sync | Si el uso real en gimnasios sin señal lo exige |
| Sin auditoría de correcciones de sesión | No hay necesidad real en el MVP | Si se agregan entrenadores |
| Sin paginación del historial | Volumen bajo | Al superar cientos de sesiones por usuario |
| Sin lastre en ejercicios de peso corporal | Fuera de alcance | Evolución de tipos de medición |
| GET /api/ejercicios sin autenticación (temporal) | Identidad todavía no existe | Al implementar el guard JWT |
| Credenciales en .env sin gestor de secretos | MVP | Antes de cualquier despliegue real |