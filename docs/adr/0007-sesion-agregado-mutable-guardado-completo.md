# adr 0007: la sesión sí se modifica en el lugar, y se guarda entera cada vez

## decision
- la sesión tiene operaciones chicas (registrar una serie, omitir un ejercicio, finalizar...). cada una chequea las reglas antes de cambiar algo, así la sesión nunca queda a medias.
- después de cada operación se guarda la sesión completa, en una sola transacción.

## alternativas
- **hacerla inmutable como la rutina:** descartada, con tantas operaciones chicas, armar una sesión nueva en cada una no aportaba nada.
- **guardar solo lo que cambió (por ejemplo, solo la serie nueva):** descartada, más código y más chances de que algo quede inconsistente.

## consecuencias
- es simple y consistente: o se guarda todo o no se guarda nada.
- cada serie registrada reescribe muchas filas.
- si dos dispositivos escriben a la vez, gana el último (queda en deuda técnica).
- es lo que hace posible el guardado progresivo: si se corta la conexión, queda guardado hasta donde llegaste.