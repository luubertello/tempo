# ADR 0004: JWT sin estado y guard global con @Publico()
- Decisión: token JWT con { sub: usuarioId, rol }. Guard global; solo registro y login se marcan @Publico().
- Alternativas: sesiones en servidor (descartada: agrega estado y almacenamiento); guard por endpoint (descartada: olvidarse de uno deja un hueco).
- Consecuencias: el token no se puede revocar antes de que expire (ver deuda técnica). El resto de los contextos solo conoce usuarioId y rol (Conformist).