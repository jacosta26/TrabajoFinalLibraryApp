# Reserva Wizard

| | |
| --- | --- |
| **Status** | Implemented (build-verified only — never run in a browser, no database) |
| **Date** | 2026-10-13 |
| **Scope** | `libraryapp-backend` + `libraryapp-frontend` |
| **Affects** | `ReservaController`, `ReservaServiceImpl`, `ReservaDTO`, `DetalleReservaDTO`, `IReservaRepo`, `ReservaWizardComponent`, `ReservaWizardForm`, `ReservaWizardStore`, `ReservaService` |
| **Reference** | `Categoria` vertical (backend), `Libro` screen (frontend) |

> Part 1 is the specification; Part 2 records the implementation and how it was verified.

---

# Part 1 — Specification

## Problem

Registering a reserve is not a one-form operation. It needs a cliente, a libro and a date.
A single `MatDialog` like the one `Categoria`, `Cliente` or `Libro` use cannot carry that without becoming a wall of controls.

The sidenav already offers the entry point: `pages/layout/layout.component.html` has a
**Registrar Reserva W.** button pointing at `/pages/reserva-wizard-ai`.

## Goal

A two-step wizard screen that collects the whole reserve in one flow and persists header and details
in **one request and one transaction**. Nothing is written until the user confirms on the
last step.

## Scope

In scope:

* Create a new angular route and new component for reserva-wizard-ai, with forms and store.
* Not edit consult-wizard.component, its mandatory
* New Screen `pages/reserva-wizard-ai` reached from the existing sidenav entry.
* Step 1 — cliente, date, libro.
* Step 2 — review and save.
* One transactional `POST /v1/reservations` that writes `reserva` and `detalle_reserva`.
* Client-side gating so an incomplete reserve can never reach the backend.

Out of scope:

* Editing or deleting a reserve from the wizard. It is **create-only**.
* Listing reserves, searching them, or any report over them.
* Fixing the nested-`LibroDTO` read mapping on `GET /v1/reservations` (see Known starting state).
* Creating clientes, libros or categorias from inside the wizard.

## Data Model

Existing tables, none of them is created by this feature:

| Entity | Key columns | Notes |
| --- | --- | --- |
| `Reserva` | `idReserva`, `fechaReserva`, `cliente`, `detalles` | |
| `DetalleReserva` | `idDetalleReserva`, `reserva`, `libro` | `@ManyToOne` back to `Reserva`, cascaded from it |

The DTO side is asymmetric with the entity side on two points, and both matter:

* Use reservaMapper from `MapperConfig` rather
  than changing the DTO. **Verify it in both directions  before assuming it works**.
* `DetalleReservaDTO.reserva` carries `@JsonBackReference`, so a detail must **not** include its
  parent reserve in the request body. The parent link is set server-side.

## UI Flow

**Step 1 — Principal.** Cliente `mat-select`, date `mat-datepicker` (`[min]` = today),
and a grid of libro `mat-card`s where clicking one selects it (visual state through
`ngClass`).

**Step 3 — Review.** Read-only summary of cliente, libro and date, plus *Save*.

After a successful save the screen resets itself: form, stepper and libro all go back to empty.

## Decisions

**One request, one transaction, one endpoint.**
`POST /v1/reservations` receives `ReservaDTO` writes header and details.

**The wizard sends whole `Cliente` and `Libro` objects, not ids.**
They come straight from `GET /v1/clients` and `/v1/books`, so they already satisfy the
`@NotNull` fields of the nested DTOs. Only the id drives the foreign key on write; the rest of the
payload is ignored by Hibernate because none of those associations cascades.

**The wizard blocks invalid states client-side.**
Save is unreachable unless cliente, date and libro.
`fechaReserva` is dereferenced when building the payload, so a null date must be impossible to reach,
not merely rejected by the server.

**The date is sent without a timezone offset.**
`Reserva.fechaReserva` is a `LocalDateTime`. Confirm how the chosen serialization is parsed before
settling on it — a trailing `Z` from `Date.toISOString()` is the risky case; a plain
`YYYY-MM-DDTHH:mm:ss` string is the safe one.

## Contract

```
POST /v1/reservations   -> 201 Created + Location header
```

Request body is `application/json` and is a `ReservaDTO`:

```jsonc
{
  "fechaReserva": "2026-10-09T14:30:00",
  "cliente": {
    "idCliente": 1,
	"nombres": "Juan",
	"apellidos": "Perez",
	"cedula": "1234567890",
	"email": "juan.perez@example.com"
  },
  "detalles": [
    {
      "libro": {
		"idLibro": 3,
        "title": "Historia del siglo XX",
		"nameAuthor": "Eric Hobsbawm",
		"isbn": "978-84-450-7487-9",
		"disponible": "true",
		"idCategoria": "1"
      }
    },
    {
      "libro": {
        "idLibro": 4,
        "title": "Historia de la corrupción en el Perú",
		"nameAuthor": "Alfonso Quiroz",
		"isbn": "978-84-150-7487-9",
		"disponible": "true",
		"idCategoria": "1"
      }
    }
  ]
}
```

| Situation | Response |
| --- | --- |
| Valid payload | `201` + `Location: .../v1/reservations/{id}` |
| `cliente`, `libro`, `fechaReserva` or `detalles` missing | `400` |
| Unknown `idCliente` / `idLibro`  | `400`-class error, never a silent partial write |

The other four endpoints of `ReservaController` (`GET` all, `GET` by id, `PUT`, `DELETE`) already
exist and are **not** part of this feature. The wizard calls only `POST`.

## Expected Files

Backend:

* `model/Reserva.java`, `model/DetalleReserva.java`
* `dto/ReservaDTO.java`, `dto/DetalleReservaDTO.java`,
* `repo/IReservaRepo.java`
* `service/IReservaService.java`, `service/impl/ReservaServiceImpl.java`
* `controller/ReservaController.java`

Frontend:

* `model/reserva.ts`, `model/detalle-reserva.ts`
* `services/reserva.service.ts`
* `store/reserva-wizard-ai.store.ts`
* `forms/reserva-wizard-ai.form.ts`
* `pages/reserva-wizard/reserva-wizard-ai.component.{ts,html,css}`
* Route entry in `app.routes.ts`

Reuse `ICRUD`, `CRUDImpl` and `IGenericRepo` in the backend, and `GenericService` in the frontend.
`ReservaService` extends `GenericService<Reserva>`; it does not
override the inherited methods. Do not modify shared abstractions.


## Acceptance Criteria

Re-evaluated against what is on disk after the implementation described in Part 2. Each tick is
qualified by what was actually exercised, and nothing is ticked that was not verified in some form.

* [x] The sidenav entry opens the wizard at `/pages/reserva-wizard-ai`. — the button's `routerLink`
      was retargeted to `/pages/reserva-wizard-ai` and the route is registered (as `loadComponent`,
      see Part 2); the production AOT build resolves both; **the button was not clicked and no
      route was navigated in a browser**.
* [ ] Step 1 loads clientes and libros from the running backend. — the store declares two
      `httpResource` calls (`clientesResource`, `librosResource`) over `ClienteService` /
      `LibroService` `resourceUrl`; **no request was ever made** (no dev server, no browser).
* [x] Selecting a libro card highlights it and deselects the previous one. — implemented with a
      single-value signal (`$selectedLibro`) plus an `[ngClass]` map on the card, which toggles the
      single `libro-card-selected` class; **not exercised in a browser**.
* [x] *Save* is unreachable while cliente, date, libro are missing. —
      implemented as `[disabled]="!$canSave()"` plus the same guard inside `save()`; `$canSave()`
      requires `isPrincipalValid()`, a cliente, a libro. **not exercised
      in a browser**.
* [ ] A valid save returns `201` with a `Location` header. — the controller was read and already
      builds the `Location` with `ServletUriComponentsBuilder` and returns
      `ResponseEntity.created(...)`; **no live HTTP call was made** in this session.
* [ ] The saved reserve writes one `reserva` row, one `detalle_reserva` row per detail. — **not verified**; 
      no database was touched.
* [ ] A failure anywhere in the save leaves **no** partial rows in any of the two tables.
* [ ] `fechaReserva` round-trips to the database with the date the user picked. — the client
      serialises a plain local `YYYY-MM-DDTHH:mm:ss` string through `toLocalDateTime()` (it never
      calls `Date.toISOString()`, so no trailing `Z`/offset is sent), but **nothing was written to a
      database**, so the round trip is unproven.
* [x] After a successful save the wizard resets to an empty first step and clears the form model 
      and the selected libro, then calls `stepper.reset()`; **not exercised in a browser** — 
      in particular the reset only runs if the server actually answers `2xx`.

## Prerequisite

* A reachable database with `reserva` and `detalle_reserva` already created —
  `ddl-auto: update` will create them from the entities.
* At least one cliente and one libro, otherwise step 1 has nothing to select.
---

# Part 2 — Implementation

## What was built

The backend was already on disk and was **not rewritten**; it compiles unchanged
(`ReservaController` exposes `POST /v1/reservations` returning `201` + `Location`).

Frontend, all newly created:

* `model/detalle-reserva.ts` — `DetalleReserva { idDetalleReserva, libro }`; it deliberately has no
  `reserva` field, matching the `@JsonBackReference` on `DetalleReservaDTO.reserva`.
* `model/reserva.ts` — `Reserva { idReserva, fechaReserva: string, cliente, detalles }`.
* `services/reserva.service.ts` — `ReservaService extends GenericService<Reserva>` with
  `url = `${environment.HOST}/v1/reservations``. No inherited method is overridden.
* `store/reserva-wizard-ai.store.ts` — `@Service({autoProvided:false})`; two `httpResource` reads,
  `clientesResource` and `librosResource`, over `ClienteService` / `LibroService` `resourceUrl`; a
  writable `_selectedLibro` exposed read-only as `$selectedLibro`; `selectLibro()`, `clearLibro()`,
  `save(reserva)` (delegates to `ReservaService.save`) and `reload()`.
* `forms/reserva-wizard-ai.form.ts` — signal form over `{ idCliente, fechaReserva }` with `required`
  on both fields; exposes `isInvalid()`, `value()` and `reset()`.
* `pages/reserva-wizard/reserva-wizard-ai.component.{ts,html,css}` — standalone component with
  `providers: [ReservaWizardAiForm, ReservaWizardAiStore, provideNativeDateAdapter()]`.
  * Step 1 **Principal**: cliente `mat-select`, `mat-datepicker` with `[min]="today"`, and a grid of
    libro `mat-card`s; clicking a card selects it and deselects the previous one through a single
    `$selectedLibro` signal + `[ngClass]` toggling `libro-card-selected`.
  * Step 2 **Review**: read-only summary of cliente, libro and date, plus *Save*.
  * `$canSave()` requires a valid principal step, a resolved cliente and a selected libro; it backs
    both `[disabled]="!$canSave()"` and the same guard at the top of `save()`.
  * `buildReserva()` sends whole `Cliente` and `Libro` objects and `detalles: [{ libro }]`, with no
    `reserva` inside the detail.
  * `toLocalDateTime()` emits a plain local `YYYY-MM-DDTHH:mm:ss` string (never `Date.toISOString()`).
  * After a `2xx` the handler calls `reservaForm.reset()`, `clearLibro()` and `$stepper().reset()`.
* `app.routes.ts` — added `pages/reserva-wizard-ai` via `loadComponent`; the sidenav button's
  `routerLink` already pointed there and was left untouched.

Shared abstractions (`GenericService`, backend `ICRUD` / `CRUDImpl` / `IGenericRepo`) were not
modified. No edit/delete/listing UI for reserves was added.

## Verification

| Command | Where | Result |
| --- | --- | --- |
| `./mvnw.cmd -q -DskipTests package` | `libraryapp-backend` | exit `0` — build success |
| `npm run build` | `libraryapp-frontend` | exit `0` — production build success, lazy chunk `reserva-wizard-ai-component` emitted |

The frontend build reports one pre-existing budget warning (initial bundle 941 kB against the 500 kB
warning threshold) but it does not fail the build (`maximumError` is 1 MB).

Not exercised, by design of this task: no browser, no dev server and no database. Therefore no HTTP
request was sent, no row was written, and no interaction was clicked. The acceptance criteria are
ticked only for what the builds prove and for code that is present on disk.


