# adr 0005: entrenamiento le pregunta al catálogo por un contrato propio, y las tablas no se atan entre contextos

## decision
- entrenamiento define qué necesita saber del catálogo (solo el id del ejercicio y cómo se mide) y un adaptador se lo trae. entrenamiento acepta el modelo del catálogo tal cual, sin traducirlo.
- las tablas de entrenamiento no tienen claves foráneas hacia usuarios ni ejercicios. entre contextos se guarda solo el id.

## alternativas
- **usar directo el repositorio del catálogo adentro de los casos de uso:** descartada, mezcla un contexto con otro.
- **poner claves foráneas:** descartada, ata las tablas de un contexto a las de otro y contradice lo de "entre contextos solo por id".

## consecuencias
- que un ejercicio exista lo valida el negocio, no la base de datos.
- si algún día el catálogo borrara un ejercicio, quedarían ids sueltos. por eso el catálogo nunca borra ejercicios.