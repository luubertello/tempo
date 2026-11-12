# adr 0013: el front es ionic + angular, y capacitor para llevarlo al celular

## decision
- usamos angular con ionic (componentes con aspecto de app de celular). la misma app se prueba en el navegador de la pc.
- capacitor se usa para empaquetarla como app de android cuando haga falta.
- estructura clásica de angular: core, shared y pages.

## alternativas
- **pwa sola (página web instalable):** más simple, pero se siente menos como app y no entra a las tiendas.
- **otro framework móvil (por ejemplo react native o flutter):** descartado, ya habíamos elegido angular y no queremos sumar otra tecnología.

## consecuencias
- una sola base de código para web y celular.
- ios solo se puede compilar desde una mac, así que para el proyecto alcanza con android o con el navegador.