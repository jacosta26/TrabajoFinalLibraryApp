# DB Entities — JPA model generated from the diagram

| | |
| --- | --- |
| **Status** | Draft |
| **Date** | 2026-10-08 |
| **Scope** | `libraryapp-backend` |
| **Affects** | `com.mitocode.model.*`, generated `.agents/features/dbentity/resources/schema-backup.sql` |
| **Reference** | `.agents/features/dbentity/resources/db_diagram_er.png` (source of truth for tables and relationships) |

> Specification only. Part 2 is written after the implementation.

---

# Part 1 — Specification

## Problem

The project starts practically empty: a Spring Boot application with JPA configured, and at most a couple of
entities written by hand as a demonstration. The persistence model as a whole exists only as a picture —
`db_diagram_er.png` — which no compiler can read and no one can diff.

Typing those five tables by hand is slow and, worse, silent when it goes wrong: a missing foreign key, a
`length` that does not match, a column name Hibernate derives differently. And once the entities do exist,
there is still no SQL anywhere: `ddl-auto` builds the schema in memory at boot, so recreating the database
without the source code is impossible.

## Goal

Generate the complete JPA model of `com.mitocode.model` from the diagram, and **produce the SQL script of the
resulting schema as a backup**.

Two deliverables:

1. The entity classes under `src/main/java/com/mitocode/model/`.
2. `.agents/features/dbentity/resources/schema-backup.sql` — the DDL of the schema those entities create,
   dumped from the database. The application never runs it; a person does, with one command, to rebuild the
   five tables on an empty database.

## Scope

In scope:

* The five tables of the diagram — `categoria`, `cliente`, `libro`, `reserva`, `detalle_reserva` — as five entity classes.
* Column types, lengths, nullability and named foreign keys.
* The generated SQL backup script.

Out of scope:

* DTOs, repositories, services and controllers. This feature stops at `model`.
* Anything not drawn in the diagram. No auditing columns, no soft deletes, no extra tables.
* Seed data. The tables are created empty.
* Replacing `ddl-auto` with a migration tool such as Flyway or Liquibase.

## Decisions

**The diagram is taken literally.**
Every table, column and relationship comes from `db_diagram_er.png` and nothing else. The diagram carries no
lengths and no uniqueness, so this specification fixes both in the tables below — the lengths of every
`varchar`. That is the only addition; nothing else is invented.

**The generation overwrites; it never merges.**
It is possible that `com.mitocode.model` already contains entities written prior to executing this process.
These are **completely replaced** by the generated version, even if they already appear correct.
After the run, the package contains the five files listed below; any other class written is deleted,
or Hibernate will keep creating a table the diagram does not have.

**Names are Java, columns are derived.**
Fields keep `lowerCamelCase` (`idReserva`, `fechaReserva`); Spring Boot's naming strategy turns them into
`snake_case` (`id_reserva`, `fecha_reserva`). The diagram draws a few columns in camelCase — that is the
diagram's notation, not the column name. `@Column(name = ...)` is written only when the derived name would be
wrong.

**Every foreign key is named explicitly, in lowercase.**
`@JoinColumn(..., foreignKey = @ForeignKey(name = "fk_libro_categoria"))`. An unnamed FK gets a random
Hibernate hash, which makes the generated script unreadable and its diffs unstable between runs.

The names are written lowercase because that is how they end up: PostgreSQL folds every unquoted identifier to
lowercase, so `FK_LIBRO_CATEGORY` in the annotation reads `fk_libro_categoria` in the database. Writing them
as they will be read avoids comparing two spellings of the same thing.

**Primary keys are `IDENTITY`, except in `User`, `Role` and `Menu`.**
The transactional tables — `categoria`, `cliente`, `libro`, `reserva`, `detalle_reserva` — let the
database assign the id with `@GeneratedValue(strategy = GenerationType.IDENTITY)`.

**Equality is by id only.**
Every entity carries `@EqualsAndHashCode(onlyExplicitlyIncluded = true)` with `@EqualsAndHashCode.Include` on
the id.

## Entity Model

Lengths are `@Column(length = ...)`; **NN** marks `nullable = false`.

**`Categoria`** — table `categoria`

| Field | Column | Type | Constraints |
| --- | --- | --- | --- |
| `idCategoria` | `id_categoria` | Integer | PK, identity |
| `nombre` | `nombre` | varchar(70) | NN |
| `descripcion` | `descripcion` | varchar(200) | NN |
| `estado` | `estado` | varchar(20) | NN |

**`Cliente`** — table `cliente`

| Field | Column | Type | Constraints |
| --- | --- | --- | --- |
| `idCliente` | `id_cliente` | Integer | PK, identity |
| `nombres` | `nombres` | varchar(80) | NN |
| `apellidos` | `apellidos` | varchar(120) | NN |
| `cedula` | `cedula` | varchar(20) | NN |
| `email` | `email` | varchar(100) | NN |

**`Libro`** — table `libro`

| Field | Column | Type | Constraints |
| --- | --- | --- | --- |
| `idLibro` | `id_libro` | Integer | PK, identity |
| `titulo` | `titulo` | varchar(150) | NN |
| `autor` | `autor` | varchar(150) | NN |
| `isbn` | `isbn` | varchar(50) | NN |
| `disponible` | `disponible` | boolean | NN |
| `categoria` | `id_categoria` | FK → `categoria` | NN, `@ManyToOne`, `fk_libro_categoria` |

**`Reserva`** — table `reserva`

| Field | Column | Type | Constraints |
| --- | --- | --- | --- |
| `idReserva` | `id_reserva` | Integer | PK, identity |
| `fechaReserva` | `fecha_reserva` | timestamp | NN, `LocalDateTime` |
| `cliente` | `id_cliente` | FK → `cliente` | NN, `@ManyToOne`, `fk_reserva_cliente` |
| `detalles` | — | `List<DetalleReserva>` | `@OneToMany(mappedBy = "reserva", cascade = ALL)` |

**`DetalleReserva`** — table `detalle_reserva`

| Field | Column | Type | Constraints |
| --- | --- | --- | --- |
| `idDetalleReserva` | `id_detalle_reserva` | Integer | PK, identity |
| `reserva` | `id_reserva` | FK → `reserva` | NN, `@ManyToOne`, `fk_detail_reserva` |
| `libro` | `id_libro` | FK → `libro` | NN, `@ManyToOne`, `fk_detail_reserva_libro` |


## Relationships

```
  categoria 1 ──< N libro
  cliente   1 ──< N reserva
  reserva   1 ──< N detalle_reserva
  libro     1 ──< N detalle_reserva
```

Only `Reserva` → `DetalleReserva` is navigable from both sides. Every other association is unidirectional, from
the child to the parent, which is all the diagram shows.

## Class Template

Every entity follows the same shape. `Categoria` is the canonical example:

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Integer idCategoria;

    @Column(nullable = false, length = 70)
    private String nombre;

    @Column(nullable = false, length = 200)
    private String descripcion;
}
```

Rules: package `com.mitocode.model`, imports from `jakarta.persistence.*` (never `javax`), Lombok instead of
hand-written getters and setters, no `@Table` unless the table name differs from the class name (`User` →
`user_data`), and no business logic inside the entity.

## SQL Backup Script

The script has one job: **run it against an empty database and the five tables appear**. One command, no
application, no Maven, no manual editing.

## Expected Files

| File | Role |
| --- | --- |
| `model/Categoria.java` | `categoria` |
| `model/Cliente.java` | `cliente` |
| `model/Libro.java` | `libro` + FK to categoria|
| `model/Reserva.java` | `reserva` + two FKs + detalles collection |
| `model/DetalleReserva.java` | `detalle_reserva` |
| `.agents/features/dbentity/resources/schema-backup.sql` | DDL backup, run by hand to rebuild the schema |

Five entities, five tables.

## Acceptance Criteria

* [ ] The five entities exist under `com.mitocode.model` and every column of the diagram is mapped.
* [ ] `./mvnw -DskipTests compile` passes.
* [ ] Booting creates the five tables of the diagram, with no table left over from the demonstration.
* [ ] Saving a `Reserva` with its `detalles` list persists the `detalle_reserva` rows through the cascade, and
  deleting the `Reserva` removes them.
* [ ] Inserting a `libro` with a non-existent `id_categoria` fails on the foreign key.
* [ ] Inserting a `reserva` with a non-existent `id_cliente` fails on the foreign key.
* [ ] `.agents/features/dbentity/resources/schema-backup.sql` exists and contains the five tables with their
  named foreign keys.

## Prerequisites

**1. A Spring Boot project with JPA.** `spring-boot-starter-data-jpa`, the PostgreSQL driver and Lombok on the
classpath. Nothing else is needed: this feature adds no dependency.

**2. A PostgreSQL database** reachable through `spring.datasource.*`, holding nothing worth keeping. If the
demonstration entities were already booted, their tables are in there — and `ddl-auto: update` only adds.

**3. `ddl-auto`.** `update` is the project setting and is enough on an empty database.

**4. Nothing to preserve in `com.mitocode.model`.** Whatever is there was written as a demonstration and is
overwritten. If a hand-written entity is worth keeping, copy it elsewhere before running this.

---

# Part 2 — Implementation Notes

## Files created
- `src/main/java/com/mitocode/model/Categoria.java` — entity for table `categoria`
- `src/main/java/com/mitocode/model/Cliente.java` — entity for table `cliente`
- `src/main/java/com/mitocode/model/Libro.java` — entity for table `libro` with `@ManyToOne` to `Categoria` (FK `fk_libro_categoria`)
- `src/main/java/com/mitocode/model/Reserva.java` — entity for table `reserva` with `@ManyToOne` to `Cliente` (FK `fk_reserva_cliente`) and `@OneToMany` mapped to `DetalleReserva` (cascade ALL)
- `src/main/java/com/mitocode/model/DetalleReserva.java` — entity for table `detalle_reserva` with `@ManyToOne` to `Reserva` (FK `fk_detail_reserva`) and to `Libro` (FK `fk_detail_reserva_libro`)
- `.agents/features/dbentity/resources/schema-backup.sql` — PostgreSQL DDL with named FKs in dependency order (DROP/CREATE, SERIAL PKs, exact varchar lengths, NOT NULL)

## Verification result
Command: `.\mvnw.cmd -DskipTests compile` (project root)
Result: BUILD SUCCESS
- [INFO] Compiling 6 source files with javac [debug parameters release 25] to target\classes
- [INFO] BUILD SUCCESS
- [INFO] Total time: ~6-7 s
