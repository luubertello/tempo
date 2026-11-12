# adr 0006: la rutina no se edita "por partes", se reemplaza completa

## decision
- modificar una rutina no cambia la que ya existe, devuelve una rutina nueva con el mismo id.
- el `PUT /api/rutinas/:id` manda la rutina entera. el servidor borra el contenido viejo y guarda el nuevo, todo junto (si algo falla, no se guarda nada).

## alternativas
- **endpoints para tocar un ejercicio o una serie sueltos:** descartada, serían muchos más endpoints y se podrían dejar rutinas a medias.
- **cambiar la rutina "en el lugar":** descartada, es más fácil dejarla en un estado inválido.

## consecuencias
- las reglas de la rutina se validan todas juntas, una sola vez.
- el front siempre tiene que mandar la rutina completa.
- si dos dispositivos editan a la vez, gana el último que guarda (queda en deuda técnica).