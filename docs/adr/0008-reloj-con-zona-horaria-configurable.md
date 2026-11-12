# adr 0008: la fecha de "hoy" la da un reloj propio, con zona horaria configurable

## decision
el negocio no pregunta la hora directo al sistema. usa un "reloj" que devuelve la fecha de hoy en la zona horaria `ZONA_HORARIA` (por defecto, buenos aires).

## alternativas
- **usar `new Date()` en los casos de uso:** descartada. el servidor en docker usa hora utc, y a las 22:00 en argentina ya sería "mañana". además no se puede probar bien.
- **que el front mande la fecha:** descartada, porque la regla dice que una sesión iniciada en el momento lleva la fecha de hoy.

## consecuencias
- la fecha de la sesión es la que el usuario espera, sin importar a qué hora entrene.
- en las pruebas se puede fijar la fecha con un reloj de mentira.
- hay una sola zona horaria para toda la app (queda en deuda técnica).