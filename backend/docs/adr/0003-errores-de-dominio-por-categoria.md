# adr 0003: los errores del negocio se agrupan por categoría y un solo lugar los convierte a códigos http

## decision
cuando algo del negocio falla (email repetido, rutina que no existe, serie mal armada), el negocio tira un error con un nombre claro. cada error pertenece a una categoría: no autenticado, prohibido, no encontrado, conflicto o regla violada. hay un único filtro que mira la categoría y decide el código (401, 403, 404, 409, 422) y arma la respuesta `{ "error": "mensaje" }`.

## alternativas
- **tirar errores http desde el negocio:** descartada, porque el negocio pasaría a saber de http.
- **decidir el código a mano en cada controller:** descartada, porque se repite y tarde o temprano algún código no coincide con el contrato.

## consecuencias
- los códigos de error están definidos en un solo lugar.
- los casos de uso se pueden probar sin levantar la api.
- cada error nuevo tiene que elegir su categoría.