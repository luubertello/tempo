# adr 0002: la base de datos se pide a través de "contratos", y los casos de uso no usan cosas de nest

## decision
- el negocio define qué necesita ("buscame un ejercicio por id", "guardame esta rutina") como un contrato vacío. después otro archivo lo cumple usando typeorm.
- los casos de uso (crear rutina, finalizar sesión, etc.) son clases comunes, sin decoradores de nest. nest los arma en el módulo, pasándole a cada uno lo que necesita.

## alternativas
- **que los casos de uso usen typeorm directo:** más rápido de escribir, pero las reglas quedan atadas a la base.
- **ponerle `@Injectable()` a todo:** funciona, pero mete nest en lugares donde no hace falta.

## consecuencias
- el negocio y los casos de uso no dependen de nest ni de typeorm.
- se pueden probar con "bases de mentira" guardadas en memoria.
- hay un poco más de configuración en cada módulo.