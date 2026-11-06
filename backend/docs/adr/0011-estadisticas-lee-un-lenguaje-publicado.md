# adr 0011: estadísticas no toca la sesión, lee un "formato publicado" que ofrece entrenamiento

## decision
- entrenamiento ofrece un servicio de consulta (`SesionesFinalizadas`) que devuelve las sesiones finalizadas de un usuario en un formato chico y estable: la fecha y, por cada ejercicio, las series que se completaron (repeticiones, carga o duración). en ddd esto es un open host service + published language.
- estadísticas solo puede importar ese formato (la carpeta `entrenamiento/publicado`). nunca la clase sesión ni las tablas.
- el formato ya viene filtrado: solo sesiones finalizadas, y solo series completadas. se arma siempre desde lo que hay hoy en la base, no se guardan copias.

## alternativas
- **que estadísticas lea las tablas o la clase sesión directo:** descartada. si algún día cambia cómo se guarda una sesión, se rompe estadísticas sin que nadie se dé cuenta.

## consecuencias
- se puede cambiar el modelo interno de la sesión sin tocar estadísticas, mientras el formato se mantenga.
- los cálculos de estadísticas se prueban con sesiones armadas a mano, sin base de datos.
- el publicador hoy carga las sesiones completas y filtra en memoria (queda en deuda técnica).