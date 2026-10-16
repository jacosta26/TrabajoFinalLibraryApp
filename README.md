# Library App

Aplicación web para la gestión de una biblioteca: administración de categorías, libros y clientes, junto con un módulo de reservas y búsqueda avanzada de las mismas.

El proyecto está dividido en dos aplicaciones independientes:

- **`libraryapp-backend`**: API REST (Java + Spring Boot).
- **`libraryapp-frontend`**: SPA (Angular + Angular Material).

---

## Tecnologías utilizadas

### Backend (`libraryapp-backend`)

| Tecnología | Versión / Detalle |
| --- | --- |
| Java | 25 |
| Spring Boot | 4.1.1 |
| Spring Web MVC | API REST |
| Spring Data JPA | Persistencia |
| Hibernate | ORM (`ddl-auto: update`) |
| PostgreSQL | Base de datos (Supabase) |
| ModelMapper | Mapeo DTO ↔ Entidad (3.x) |
| Bean Validation | Validación de request bodies |
| Lombok | Reducción de código boilerplate |
| Maven | Gestión de dependencias y build |

### Frontend (`libraryapp-frontend`)

| Tecnología | Versión / Detalle |
| --- | --- |
| Angular | 22.x (standalone components, signals) |
| Angular Material / CDK | 22.x |
| TypeScript | 6.0 |
| RxJS | 7.8 |
| Vitest + jsdom | Pruebas unitarias |
| Prettier | Formato de código |
| npm | Gestor de paquetes |

---

## Funcionalidades

### Backend — API REST (`/v1`)

| Recurso | Endpoint base | Operaciones |
| --- | --- | --- |
| Categorías | `GET/POST /v1/categories`, `GET/PUT/DELETE /v1/categories/{id}`, `GET /v1/categories/pageable` | CRUD + paginación |
| Libros | `GET/POST /v1/books`, `GET/PUT/DELETE /v1/books/{id}`, `GET /v1/books/pageable` | CRUD + paginación |
| Clientes | `GET/POST /v1/clientes`, `GET/PUT/DELETE /v1/clientes/{id}`, `GET /v1/clientes/pageable` | CRUD + paginación |
| Reservas | `GET/POST /v1/reservations`, `GET/PUT/DELETE /v1/reservations/{id}` | CRUD |
| Reservas | `POST /v1/reservations/search/others`, `GET /v1/reservations/search/dates` | Búsqueda por cédula/nombre y por rango de fechas |
| Reservas | `GET /v1/reservations/pageable` | Paginación |
| Idiomas | `GET /v1/languages/change/{language}` | Cambio de locale (`en`/`us` → inglés, resto → por defecto) |

Además:

- **Manejo global de errores** (`ResponseExceptionHandler`) con mensajes i18n desde `messages.properties` / `messages_en.properties`.
- **CORS** habilitado para `http://localhost:4200` mediante el filtro `CORS`.
- **Relaciones JPA**: `Reserva` → `Cliente` (ManyToOne) y `Reserva` → `DetalleReserva` (OneToMany); `Libro` → `Categoria` (ManyToOne).

### Frontend

- **Layout principal** con `mat-sidenav` y barra de herramientas, con navegación a cada módulo.
- **Categorías**: listado paginado, creación, edición y eliminación.
- **Libros**: listado, alta/edición mediante diálogo (`libro-dialog`) y eliminación.
- **Clientes**: listado, creación y edición.
- **Búsqueda de reservas**: pestañas para buscar por cédula/nombre o por rango de fechas, con tabla de resultados y diálogo de detalle.
- **Wizard de reserva**: registro de reservas paso a paso con `mat-stepper`, selección de cliente y de libro.
- **Notificaciones** tipo snackbar, diálogo de confirmación reutilizable e interceptor HTTP para manejo de errores.
- Estado manejado con **signals/stores** por feature.

---

## Cómo levantar el proyecto

### Requisitos previos

- **JDK 25** para el backend.
- **Node.js 20.19+, 22.12+ o 24+** y **npm** para el frontend.
- Acceso a la base de datos PostgreSQL (por defecto apunta a Supabase).

### 1. Backend

```bash
cd libraryapp-backend
./mvnw spring-boot:run
```

En Windows:

```bash
cd libraryapp-backend
mvnw.cmd spring-boot:run
```

El servicio queda disponible en **http://localhost:8080**.

La conexión a la base de datos se configura por variables de entorno (con valores por defecto en `application.yaml`):

| Variable | Descripción |
| --- | --- |
| `DB_URL` | URL JDBC de PostgreSQL |
| `DB_USERNAME` | Usuario de la base de datos |
| `DB_PASSWORD` | Contraseña de la base de datos |

Ejemplo:

```bash
DB_URL="jdbc:postgresql://<host>:5432/postgres" \
DB_USERNAME="<usuario>" \
DB_PASSWORD="<password>" \
./mvnw spring-boot:run
```

Compilar y ejecutar tests:

```bash
cd libraryapp-backend
./mvnw clean test
```

### 2. Frontend

```bash
cd libraryapp-frontend
npm install
npm start
```

La aplicación queda disponible en **http://localhost:4200** y recarga automáticamente al modificar el código.

La URL del backend se configura en `src/environments/environment.ts` y `environment.development.ts` mediante la propiedad `HOST` (por defecto `http://localhost:8080`).

Build de producción y tests:

```bash
cd libraryapp-frontend
npm run build
npm test
```

---

## Estructura del repositorio

```
.
├── libraryapp-backend/    # API REST con Spring Boot
│   └── src/main/java/com/mitocode/
│       ├── controller/    # Endpoints REST
│       ├── service/       # Lógica de negocio (+ impl/)
│       ├── repository/    # Repositorios Spring Data JPA
│       ├── model/         # Entidades JPA
│       ├── dto/           # Data Transfer Objects
│       ├── config/        # Configuración (Mapper, mensajes, paginación)
│       └── util/          # Utilidades (filtro CORS)
└── libraryapp-frontend/   # SPA con Angular
    └── src/app/
        ├── pages/         # Componentes por feature
        ├── forms/         # Definición de formularios
        ├── store/         # Estado con signals
        ├── services/      # Servicios HTTP
        ├── model/         # Interfaces del dominio
        └── shared/        # Componentes y utilidades comunes
```
