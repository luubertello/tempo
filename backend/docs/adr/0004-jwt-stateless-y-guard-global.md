# adr 0004: login con token (jwt) y todo protegido por defecto

## decision
- al loguearse, la api devuelve un token con el id del usuario y su rol. el front lo manda en cada pedido.
- todos los endpoints exigen token, salvo registro y login, que se marcan con `@Publico()`.

## alternativas
- **guardar las sesiones de login en el servidor:** descartada, hay que guardar y limpiar estado.
- **proteger endpoint por endpoint:** descartada, porque si te olvidás de uno queda abierto. así es al revés: si te olvidás, queda cerrado.

## consecuencias
- un token no se puede "anular" antes de que venza (queda en deuda técnica).
- el resto de los módulos solo conoce el id y el rol del usuario, nada más.