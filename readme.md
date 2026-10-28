# Tempo

Aplicación de gestión y seguimiento de entrenamientos personales.

Tempo permite organizar rutinas de entrenamiento, registrar sesiones y consultar estadísticas para realizar un seguimiento del progreso a lo largo del tiempo.

Proyecto académico desarrollado como parte de la carrera de Ingeniería de Software.

## Funcionalidades

- **Rutinas de entrenamiento:** creación y gestión de rutinas personalizadas.
- **Registro de sesiones:** registro de entrenamientos realizados y sus ejercicios.
- **Catálogo de ejercicios:** consulta de ejercicios disponibles y sus características.
- **Estadísticas:** seguimiento de la evolución del entrenamiento.

Las funcionalidades se desarrollan de manera incremental a medida que avanza el proyecto.

## Tecnologías

- **Node.js 24**
- **NestJS**
- **TypeORM**
- **PostgreSQL 16**
- **Docker**

## Arquitectura

El backend se desarrolla siguiendo principios de **Domain-Driven Design (DDD)**, organizando el sistema en contextos delimitados (*Bounded Contexts*) para separar responsabilidades y facilitar la evolución del software.

### Contextos delimitados

- **Entrenamiento:** gestión de rutinas y sesiones de entrenamiento.
- **Catalogo:** consulta del catálogo de ejercicios.
- **Identidad:** gestión de usuarios y autenticación.
- **Estadísticas:** consulta y análisis de estadísticas de entrenamiento.

Cada contexto se organiza en capas con responsabilidades diferenciadas:

- `application`: casos de uso y coordinación de operaciones.
- `domain`: entidades, objetos de valor y reglas de negocio.
- `infrastructure`: persistencia e integración con servicios externos.
- `presentation`: controladores y puntos de entrada a la aplicación.

El directorio `shared` contiene componentes compartidos entre contextos cuando corresponde.

## Requisitos previos

Para ejecutar el backend localmente, necesitás:

- [Node.js 24](https://nodejs.org/)
- npm
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Git

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/luubertello/tempo
cd tempo
```

### 2. Configurar las variables de entorno

Crear el archivo `.env` a partir de `.env.example`, ubicado en `backend/`.

Desde la raíz del proyecto, en PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

Configurar las variables necesarias para la conexión con PostgreSQL y el funcionamiento del backend.

### 3. Iniciar PostgreSQL con Docker

Desde la raíz del proyecto, acceder al directorio del backend:

```bash
cd backend
```

Construir y levantar los servicios definidos en Docker Compose:

```bash
docker compose up --build -d
```

### 4. Instalar las dependencias del backend

Si el backend se ejecuta directamente en la máquina local, abrir otra terminal en `backend/` y ejecutar:

```bash
npm install
```

### 5. Ejecutar el backend en modo desarrollo

Desde `backend/`, ejecutar:

```bash
npm run start:dev
```

El backend estará disponible en:

http://localhost:3000

La disponibilidad de la API depende de que la base de datos esté funcionando y de que las variables de entorno estén correctamente configuradas.

## Alcance

Tempo está orientado a personas que desean organizar y registrar sus propios entrenamientos de forma independiente.

El alcance contempla la gestión de rutinas, el registro de sesiones y el seguimiento del progreso. Quedan fuera de alcance la administración de gimnasios, las membresías, los turnos, la facturación y la gestión de entrenadores.

## Estado del proyecto

En desarrollo.
