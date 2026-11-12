# adr 0014: identidad visual de tempo

## decision
- el nombre es tempo y el elemento de marca es el compás: una fila de marcas que representan series, llenas las hechas y vacías las pendientes.
- un solo color de marca (azul eléctrico), fondo gris frío y texto en azul muy oscuro. versión oscura automática.
- tipografías bricolage grotesque (títulos y números) e instrument sans (texto), instaladas en la app.
- listados como filas con líneas finas, no como tarjetas. única animación: el compás del logo al abrir.
- todos los valores de color, tipografía y radios están en variables (`src/theme/variables.scss`) y se cambian en un solo lugar.

## consecuencias
- cada pantalla nueva tiene que usar esas variables y no colores sueltos, para mantener la identidad.