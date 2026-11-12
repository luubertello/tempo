# adr 0012: la estadística de cada ejercicio depende de cómo se mide

## decision
- ejercicio con carga: se mira la carga más alta en una serie (unidad: kg).
- ejercicio de peso corporal (dominadas, flexiones): se mira la mayor cantidad de repeticiones en una serie (unidad: reps).
- ejercicio por tiempo (plancha): se mira la duración más larga en una serie (unidad: seg).
- en general le decimos "marca máxima". "carga máxima" es la marca máxima de los ejercicios con carga.
- la respuesta de la api incluye `unidad`, así el front sabe qué mostrar.

## alternativas
- **graficar solo ejercicios con carga y devolver vacío para el resto:** descartada. en dominadas o plancha no podrías ver si mejoraste, y son ejercicios muy comunes.
- **una métrica única (por ejemplo volumen = reps x peso):** descartada, no existe para ejercicios por tiempo y es más difícil de explicar.

## consecuencias
- estadísticas necesita saber el tipo de medición de cada ejercicio, por eso la relación catálogo → estadísticas ahora cruza nombre y tipo de medición (sigue siendo conformist).
- si algún día se agrega un tipo de medición nuevo, hay que definir su métrica en `unidad.ts` (el compilador avisa porque los `switch` quedan incompletos).
