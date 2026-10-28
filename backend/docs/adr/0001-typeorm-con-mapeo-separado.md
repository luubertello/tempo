# ADR 0001: TypeORM con mapeo separado del dominio
- Decisión: TypeORM con EntitySchema; las clases de dominio no llevan decoradores de BD. Mappers en infraestructura.
- Alternativas: Prisma (descartado: tipos generados obligan a mappers igual, sin ganar nada; menos familiaridad).
- Consecuencias: más código de mapeo; dominio testeable sin base de datos.