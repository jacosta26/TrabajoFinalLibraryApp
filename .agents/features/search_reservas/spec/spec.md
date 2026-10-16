# Search reserve

| | |
| --- | --- |
| **Status** | Implemented (build-verified only — never run in a browser, no database) |
| **Date** | 2026-09-13 |
| **Scope** | `libraryapp-backend` + `libraryapp-frontend` |
| **Affects** | `IReservaRepo`, `IReservaService`, `ReservaServiceImpl`, `ReservaController`, `MapperConfig` |
| **Reference** | `Reserva` vertical (backend), `Libro` screen (frontend) |

> Part 1 is the specification; Part 2 records the implementation and how it was verified.
> Part 2 documents four deviations from the literal Part 1 text (`date-fns`, the `/pages/search`
> route, the `store/` folder name, and the by-id endpoint behavior).

---

# Part 1 — Specification

## Problem

Reservations can be created and listed, but there is no way to find a past one. The user needs to locate a reservation either by the client who received it 
or by the date on which it took place, and then inspect what that reservation contained.

## Goal

A search screen with two mutually exclusive search modes and a read-only detail dialog, backed by the query endpoints that serve them.

## Scope

In scope:

* Backend query methods over `Reserva`: search by cliente data, search by date range.
* The three endpoints that expose them.
* The `Reserva -> ReservaDTO` mapping needed for the result table to render libro and cliente names.
* Frontend `search` screen: tabbed form, result table, detail dialog.
* Route `/search` registered in the app routes.

Out of scope:

* Pagination, sorting or server-side filtering of the results.
* Editing or deleting a reservation from the search screen.
* Combining both search modes in a single request.

## Decisions

**Two search modes, one screen, one submit button.**
The active tab decides which mode runs. The component reads the selected tab index and dispatches to one branch or the other. There is no combined query and no server-side mode flag.

**Search by cliente data is a `POST` with a body; search by dates is a `GET` with query params.**
The first carries a filter object and is modelled as a command; the second is a plain parameterized read and stays shareable as a URL. This asymmetry is intentional and must be preserved — the frontend store depends on it.

**The filter payload is a `record` declared inside `ReservaController`.**
It has no reuse outside this endpoint and does not belong in `dto`.

**The query methods live in `IReservaRepo` as JPQL `@Query`, not as derived method names.**
The cliente search spans three columns with an `OR` and two `LIKE`s.
The date search is expressed with `BETWEEN`.

**Case handling for `fullname` is split between client and query.**
The query lowercases the column with `LOWER(...)` but not the parameter. The caller is therefore responsible for sending a lowercase value. 

**The date range travels as ISO local date-time strings, not as epoch millis or dates.**
The backend parses them with `LocalDateTime.parse`, so the frontend must send the full `yyyy-MM-dd` + `T` + `HH:mm:ss` form. 
A bare date fails to parse and surfaces as a `400`.

## Data Flow

```
 tab 0 --> POST /v1/reservations/search/others  {dni, fullname} --> repo.search(dni, fullname)
 tab 1 --> GET  /v1/reservations/search/dates?date1&date2       --> repo.searchByDates(date1, date2)
                            |
                            v
                     ReservaDTO[] --> result table
                            |
                 "View Details" --> dialog
                            |
                            +--> GET /v1/reservations/{idReserva} --> ReservaDTO
```

## Contract

```
POST /v1/reservations/search/others   -> 200 OK + ReservaDTO[]
GET  /v1/reservations/search/dates    -> 200 OK + ReservaDTO[]
GET  /v1/reservations/{idReserva} -> 200 OK + ReservaDTO
```

**`POST /v1/reservations/search/others`**

Body, `application/json`:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `cedula` | `String` | no | Matched with strict equality against `cliente.cedula` |
| `fullname` | `String` | no | Matched with `LIKE %...%` against `cliente.nombres` and `cliente.apellidos`, both lowercased |

The two fields are combined with `OR`, not `AND`. Sending both widens the result set instead of narrowing it. The endpoint does not validate the body; it is not annotated with `@Valid`.

**`GET /v1/reservations/search/dates`**

| Param | Type | Required | Format |
| --- | --- | --- | --- |
| `date1` | `String` | yes | `yyyy-MM-dd` + `T` + `HH:mm:ss` |
| `date2` | `String` | yes | `yyyy-MM-dd` + `T` + `HH:mm:ss` |

Both bounds are inclusive (`BETWEEN`). A `date2` at midnight excludes the reservations recorded later that same day; that behavior is accepted as-is.

**`GET /v1/reservations/{idReserva}`**

Returns the ReservaDTO linked to the reservation. An unknown id returns an empty list, not a `404`.

## Queries

`IReservaRepo`:

```java
@Query("FROM Reserva c WHERE c.cliente.cedula = :cedula OR LOWER(c.cliente.nombres) LIKE %:fullname% OR LOWER(c.cliente.apellidos) LIKE %:fullname%")
List<Reserva> search(@Param("cedula") String dni, @Param("fullname") String fullname);

@Query("FROM Reserva c WHERE c.fechaReserva BETWEEN :date1 AND :date2")
List<Reserva> searchByDates(@Param("date1") LocalDateTime date1, @Param("date2") LocalDateTime date2);
```

## Mapping

The results are returned as `ReservaDTO`, which nests `ClienteDTO` and `LibroDTO`. `LibroDTO` renames two entity fields (`titulo -> title`, `autor -> nameAuthor`), so the default mapper leaves them null inside a nested `ReservaDTO` and the result table renders blank medic cells.

Verify the read direction against real data before assuming it works. Nested renamed fields are the recurring failure in this project: the request succeeds, the list renders, and only the renamed columns come back empty.

## Expected Files

Backend:

* `repo/IReservaRepo.java` — `search`, `searchByDates`
* `service/IReservaService.java`, `service/impl/ReservaServiceImpl.java`
* `controller/ReservaController.java` — `FilterReservaDTO` record, `searchByOthers`, `searchByDates`
* `config/MapperConfig.java` — `reservaMapper` bean

Frontend:

* `model/filter-reserva-dto.ts` — class with a parameter-property constructor `(cedula, fullname)`
* `services/reserva.service.ts` — `searchByOthers`, `searchDates` (built with `HttpParams`),
* `stores/search.store.ts`, `stores/search-dialog.store.ts`
* `forms/search.form.ts`
* `pages/search/search.component.{ts,html,css}`
* `pages/search/search-dialog/search-dialog.component.{ts,html,css}`
* Route entry in `app.routes.ts`

Reuse `ICRUD`, `CRUDImpl` and `IGenericRepo` in the backend, and `GenericService` in the frontend. Do not modify shared abstractions.

## Frontend Behavior

**Form.** `SearchForm` is a `@Service({ autoProvided: false })` holding a `signal` model and a `form()` from `@angular/forms/signals`, with fields `cedula`, `fullname`, `startDate`, `endDate`. It is listed in the component `providers`, so each visit to the screen starts empty.

**Screen.** A `mat-tab-group` with two tabs — text fields in the first, a `mat-date-range-input` in the second — a single submit button outside the tabs, and a `mat-table` below. The component holds a `viewChild` reference to the tab group and branches on `selectedIndex`. Dates are formatted with `date-fns` before reaching the store.

**Store.** `SearchStore` exposes a single `$reservaData` signal that both modes write into, so the table has one source regardless of which search ran.

* The date search goes through `httpResource`, driven by a request signal. While that signal is `undefined` the resource stays idle and issues no request; an `effect` copies the resource value into `$reservaData` once a date search has been requested.
* The client search goes through `ReservaService` directly and sets `$reservaData` in the subscription. `httpResource` is read-only and cannot express a `POST`.

**Table.** Columns `cliente`, `libro`, `date`, `actions`. The data source is a `MatTableDataSource`. The action button opens the detail dialog with the row as data.

**Dialog.** `SearchDialogComponent` receives the `Reserva` through `MAT_DIALOG_DATA`, renders the diagnoses and treatments already present in `detalles`.

## Acceptance Criteria

Re-evaluated against what is on disk after the implementation described in Part 2. Each tick is
qualified by what was actually exercised, and nothing is ticked that was not verified in some form.

* [ ] Searching by an exact cedula returns that client's reservations. — the `POST search/others`
      endpoint and the `search` JPQL exist and the frontend calls it, but **no request was ever
      sent** (no dev server, no browser, no database).
* [ ] Searching by a lowercase partial name matches on either first name or last name. — the query
      lowercases both columns and the frontend lowercases the value before sending, but **no query
      ran**, so the match is unproven.
* [x] Searching by an uppercase name returns nothing, and the frontend never sends one. — the
      screen lowercases `fullname` before constructing the `FilterReservaDTO`
      (`search.component.ts`, `(model.fullname ?? '').toLowerCase()`), so the client half holds by
      code; the query's case behavior was **not exercised against a database**.
* [ ] Searching with both fields filled returns the union of both matches, not the intersection. —
      the `OR` is in the JPQL and was read, but **no query ran**.
* [ ] A date range returns the reservations recorded between both bounds, inclusive. — the `BETWEEN`
      is in the JPQL, but **no query ran**.
* [ ] A `date1`/`date2` without a time component is rejected with `400`. — the frontend always emits
      the full `yyyy-MM-ddTHH:mm:ss` form (so it never triggers the `400`), but the backend rejection
      path was **not exercised**.
* [ ] Result rows show cliente name, libro name and reservation date, with no blank libro cell. —
      the mapping is delegated to the existing `reservaMapper` bean, which already maps the nested
      `titulo -> title` / `autor -> nameAuthor` rename (verified by reading `MapperConfig.java`), but
      **nothing rendered in a browser and no data was fetched**.
* [x] Switching tabs and searching again replaces the previous results instead of appending to them. —
      both modes assign (`_reservaData.set(...)`) rather than push; **not exercised in a browser**.
* [x] No request leaves the browser before the first submit. — the date `httpResource` is driven by a
      request signal that is `undefined` until `searchByDates()` is called, so the resource stays
      idle; the client path is a plain `subscribe` on the submit handler. **not exercised in a
      browser**, only by reading the store.
* [x] The route `/search` renders the screen. — registered as `/pages/search` instead of `/search`
      (see Part 2, deviation 2); the existing sidenav button already points at `/pages/search` and the
      production AOT build resolves the lazy `search-component` chunk; **the button was not clicked
      and no route was navigated in a browser**.
* [x] Backend compiles and frontend builds. — `./mvnw.cmd -q -DskipTests package` exits `0` (JDK 25)
      and `npm run build` exits `0` (lazy chunk `search-component` emitted).

## Prerequisites

* The `Reserva`, `DetalleReserva`, `Cliente` and `Libro` verticals already exist.
* The database stores reservations along with their reservation details..

---

# Part 2 — Implementation

## What was built

Backend (`libraryapp-backend`, package `com.mitocode`) — four existing files were extended, no
shared abstraction was touched:

* `repository/IReservaRepo.java` — added the two JPQL `@Query` methods `search(dni, fullname)` and
  `searchByDates(date1, date2)`, exactly as specified. Imports `org.springframework.data.jpa.repository.Query`,
  `org.springframework.data.repository.query.Param`, `java.util.List`, `java.time.LocalDateTime`.
* `service/IReservaService.java` — declared `search(...)` and `searchByDates(...)`.
* `service/impl/ReservaServiceImpl.java` — implemented both, delegating to `repo`.
* `controller/ReservaController.java` — added the nested `record FilterReservaDTO(String cedula, String fullname)`,
  `POST /search/others` (`@RequestBody`, deliberately **not** `@Valid`) mapping each `Reserva` to
  `ReservaDTO` with the injected `reservaMapper`, and `GET /search/dates` parsing `date1`/`date2` with
  `LocalDateTime.parse` and returning a `ReservaDTO[]`. The existing CRUD endpoints and `findById`
  are unchanged.
* `config/MapperConfig.java` — **not modified**. The `reservaMapper` bean already carries the nested
  rename mappings (`DetalleReserva -> DetalleReservaDTO`, `libro.titulo -> title`,
  `libro.autor -> nameAuthor`, lines 33–41), which is what the result table needs. Verified by
  reading; no change was required.

Frontend (`libraryapp-frontend`, Angular 22, standalone) — all newly created except `reserva.service.ts`
and `app.routes.ts`:

* `model/filter-reserva-dto.ts` — `FilterReservaDTO` class with a parameter-property constructor
  `(cedula, fullname)`.
* `services/reserva.service.ts` — still `extends GenericService<Reserva>`; added
  `searchByOthers(filter)` (`POST .../search/others`) and `searchDates(date1, date2)`
  (`GET .../search/dates` built with `HttpParams`). No inherited method is overridden.
* `store/search.store.ts` — `@Service({autoProvided: false})`; exposes the single writable
  `$reservaData` signal both modes feed. The date mode is an `httpResource` whose request function
  returns `undefined` while no date search has been issued (so **no request leaves the browser before
  the first submit**), driven by a private `_dateRequest` signal; an `effect` copies the resource
  value into `_reservaData` once a request exists. The client mode calls
  `ReservaService.searchByOthers` directly and sets `_reservaData` in the `subscribe`
  (`httpResource` is read-only and cannot POST).
* `store/search-dialog.store.ts` — `@Service({autoProvided: false})`; a by-id `httpResource` over
  `GET /v1/reservations/{id}`, idle until `load(idReserva)` is called.
* `forms/search.form.ts` — `@Service({autoProvided: false})` holding a `signal` model
  (`cedula`, `fullname`, `startDate`, `endDate`) and a `form()` from `@angular/forms/signals` with no
  validation rules (either search mode may be empty). Listed in the screen `providers`, so each visit
  starts empty.
* `pages/search/search.component.{ts,html,css}` — `mat-tab-group` with a **text-fields** tab and a
  **`mat-date-range-input`** tab, one submit button inside the `formRoot` but outside the tabs, and a
  `mat-table` below. A `viewChild` reference to the tab group drives `search()` on `selectedIndex`.
  Columns `cliente` / `libro` / `date` / `actions`; data source is `MatTableDataSource`. The action
  button opens `SearchDialogComponent` with the row as `data`. Client search lowercases `fullname`
  before building the `FilterReservaDTO`.
* `pages/search/search-dialog/search-dialog.component.{ts,html,css}` — read-only. Injects the row via
  `inject<Reserva>(MAT_DIALOG_DATA)`, loads the same reservation by id through `SearchDialogStore`, and
  renders `cliente`, `fechaReserva` and the list of `libros` in `detalles` (falling back to the injected
  row while the by-id resource is in flight). No form and no save.
* `app.routes.ts` — registered the screen lazily as `pages/search` (see deviation 2).

The component reuses the manual local date formatter pattern from
`pages/reserva-wizard/reserva-wizard-ai.component.ts` (`toLocalDateTime(date: Date)` →
`YYYY-MM-DDTHH:mm:ss`, no timezone/`Z`), so the backend `LocalDateTime.parse` succeeds.

## Deviations from Part 1

1. **`date-fns` is not installed, so it was not used.** Part 1 said dates are formatted with
   `date-fns`; the package is absent from both `package.json` and `node_modules`. Rather than add a new
   dependency, the screen reuses the project's existing manual local formatter
   (`toLocalDateTime`), the same one the wizard already uses. The range is always sent as a full
   `yyyy-MM-ddTHH:mm:ss` string; a bare date would still produce the `400` described in Part 1.
2. **The route is `/pages/search`, not `/search`.** Every existing route carries the `pages/` prefix
   and `pages/layout/layout.component.html` already has a sidebar button with `routerLink="/pages/search"`,
   so the literal `/search` from Part 1 would have been unreachable from the shell. The screen is
   registered under the prefix and the already-present button was left untouched.
3. **Stores live in `src/app/store/` (singular), not `src/app/stores/`.** Part 1 wrote `stores/`; the
   project's prevailing convention (and every existing store) is the plural-less `store/`. The new
   files follow the on-disk convention.
4. **The by-id endpoint returns `404` for an unknown id, not an empty list.** Part 1 claimed
   `GET /v1/reservations/{idReserva}` "returns an empty list, not a `404`". In reality the shared
   `CRUDImpl.finById` throws `ModelNotFoundException`, which `ResponseExceptionHandler` maps to `404`.
   That endpoint is pre-existing and shared, so it was reused unchanged rather than altered; the dialog
   does not depend on the unknown-id case (it only loads ids that came from a real result row).

## Verification

| Command | Where | Result |
| --- | --- | --- |
| `./mvnw.cmd -q -DskipTests package` | `libraryapp-backend` | exit `0` — build success (run with `JAVA_HOME` on JDK 25, the version `pom.xml` targets) |
| `npm run build` | `libraryapp-frontend` | exit `0` — production build success, lazy chunk `search-component` emitted (53.54 kB raw / 12.19 kB transfer) |

The frontend build reports one pre-existing budget warning (initial bundle 949.96 kB against the 500 kB
warning threshold) but it does not fail the build (`maximumError` is 1 MB).

Not exercised, by design of this task: no browser, no dev server and no database. Therefore no HTTP
request was sent, no query ran, and no interaction was clicked. The acceptance criteria are ticked only
for what the builds prove and for code that is present on disk.