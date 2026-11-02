# Cambios al informe
Pendientes de volcar al PDF:
- Pasos 5 y 6 (eventos, comandos y políticas) con: Registrar sesión pasada, Corregir sesión, Eliminar sesión; Iniciar sesión ya no recibe fecha..
- Glosario: "serie completada", "evolución", nombreRutina.
- Decisiones tomadas y pendientes.
- Código: CatalogoModule implementado; GET /api/ejercicios sin guard hasta que exista Identidad.
- Paso 11, POST /api/auth/registro: el formato inválido de la contraseña (menos de 8 o más de 72 caracteres) o del body responde 400, no 422, para respetar la convención "400 = formato". El email mal formado sí responde 422 (lo valida el value object Email).
- Paso 12 (decisión tomada): política de contraseña = entre 8 y 72 caracteres (el máximo por limitación de bcrypt).
- Paso 12: el email se normaliza (minúsculas, sin espacios) antes de validar unicidad.
- Paso 12: el 401 del login no distingue "email inexistente" de "clave incorrecta".
- Código: IdentidadModule implementado; el guard global cubre también GET /api/ejercicios (deuda temporal saldada).
- Paso 4/arquitectura: los decoradores @Publico y @UsuarioActual viven en compartido/presentacion, porque los usan todos los contextos.
- R6 (CAMBIO PROPUESTO): en la serie planificada de un ejercicio con carga, la carga objetivo es opcional (exige repeticiones y prohíbe duración). Motivo: las rutinas predefinidas son plantillas y no pueden fijar un peso. La serie realizada sigue exigiendo carga (R20).
- Paso 12: límites provisorios (ver limites.ts).
- Paso 11: se definió el cuerpo de la rutina en las respuestas: { id, nombre, origen, ejercicios: [{ orden, ejercicio_id, series: [{ orden, repeticiones, carga, duracion_segundos }] }] }. Un id con formato inválido en la ruta responde 400.
- Paso 11: PUT o DELETE sobre una rutina ajena responde 404 (R11), y sobre una predefinida 403 (R8).
- Paso 7: la serie planificada se identifica por su posición dentro del ejercicio.
- Código: EntrenamientoModule con el agregado Rutina implementado (CU4 a CU10); tres rutinas predefinidas de ejemplo en la migración.