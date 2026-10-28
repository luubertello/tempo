# ADR 0002: Repositorios como puertos (clases abstractas) y casos de uso sin decoradores
- Decisión: el dominio define el puerto; los casos de uso se registran con useFactory en el módulo.
- Consecuencia: aplicación y dominio no importan NestJS ni TypeORM.