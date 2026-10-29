# ADR 0003: Errores de dominio por categoría + filtro global
- Decisión: el dominio lanza errores que extienden una categoría (NoAutenticado, Prohibido, NoEncontrado, Conflicto, ReglaViolada). Un filtro global en presentación los traduce a 401/403/404/409/422 y da el formato { "error": "..." }.
- Alternativas: lanzar HttpException desde el dominio (descartada: acopla dominio a HTTP); chequear códigos a mano en cada controller (descartada: se repite y se desincroniza del contrato).
- Consecuencias: un solo lugar mapea errores a códigos; los casos de uso se testean sin HTTP.