# adr 0001: typeorm, pero con las tablas separadas de las clases del negocio

## decision
usamos typeorm para hablar con la base de datos. pero las clases que tienen las reglas del negocio (rutina, sesión, etc.) no saben nada de typeorm. las tablas se describen en archivos aparte (los "schema") y hay un "traductor" que convierte filas de la base en clases del negocio y al revés.

## alternativas
- **prisma:** lo descartamos. te obliga a hacer el traductor igual, así que no ganábamos nada, y typeorm ya lo conocemos.
- **poner los decoradores de typeorm directo en las clases del negocio:** es más corto, pero ahí las reglas quedan pegadas a la base de datos.

## consecuencias
- hay que escribir más código (los traductores).
- a cambio, las reglas del negocio se pueden probar sin tener una base de datos andando.