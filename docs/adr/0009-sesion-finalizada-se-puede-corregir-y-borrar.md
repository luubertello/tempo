# adr 0009: una sesión finalizada se puede corregir y borrar

## decision
- una sesión en curso o finalizada se puede corregir: cambiar la fecha, editar una serie, marcarla como no hecha, quitar una serie o quitar un ejercicio.
- una sesión abandonada no se corrige, pero cualquier sesión se puede borrar.
- aunque la corrijas, una sesión finalizada siempre tiene al menos una serie completada y todos sus ejercicios tienen al menos una serie. si una corrección rompe eso, da error y no se guarda.
- borrar es borrar de verdad (no queda nada guardado).

## alternativas
- **que sea inmutable, como el pedido confirmado del ejemplo del profe:** descartada. un pedido es un compromiso con otra persona; una sesión es un registro personal. y si cargás 80 kg en vez de 8, el dato falso te arruina la carga máxima para siempre.
- **corregible con auditoría (guardar quién cambió qué y cuándo):** descartada por ahora. es lo más prolijo pero agrega mucho laburo y el mvp no lo necesita.
- **borrado lógico (marcarla como borrada):** descartada, porque nada más depende de la sesión y las estadísticas se recalculan solas.

## consecuencias
- las estadísticas pueden cambiar hacia atrás (si corregís un peso, la carga máxima cambia) y no queda registro del valor anterior. lo aceptamos a conciencia.
- no se pueden agregar ejercicios ni series nuevas a una sesión finalizada (queda en deuda técnica).