# cambios al informe

todo lo que el código cambió o definió y que falta pasar al pdf, ordenado por paso.

## paso 4 y arquitectura

- los decoradores `@Publico` y `@UsuarioActual` viven en `compartido/presentacion`, porque los usan todos los contextos.
- identidad, catálogo, entrenamiento y estadísticas ya están implementados como módulos.

## paso 12 (no funcionales y decisiones)

**decisiones tomadas**
- el email se normaliza (minúsculas, sin espacios) antes de validar que sea único.
- decidido: front con ionic + angular + capacitor (adr 0013).
- identidad visual definida en adr 0014.


## código implementado hasta ahora

- identidad: registro, login, jwt, guard global y filtro de errores.
- catálogo: cu3.
- entrenamiento, rutinas: cu4 a cu10, con tres rutinas predefinidas de ejemplo en la migración.
- entrenamiento, sesiones: cu11 a cu22.
- estadísticas: cu23 y cu24.
- el back cubre todos los casos de uso (cu1 a cu24).
