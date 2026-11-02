# ADR 0006: Agregado Rutina inmutable; PUT reemplaza todo el contenido
- Decisión: modificar() devuelve una Rutina nueva; el repositorio guarda en una transacción borrando y reinsertando ejercicios y series.
- Alternativas: PATCH por ejercicio o serie (descartada: más endpoints y más estados intermedios inválidos); mutar el agregado in situ (descartada: se puede dejar a medias una regla).
- Consecuencias: una sola validación de R2 a R7 por operación; el cliente siempre manda la rutina completa; last-write-wins ante ediciones simultáneas (ver deuda técnica).