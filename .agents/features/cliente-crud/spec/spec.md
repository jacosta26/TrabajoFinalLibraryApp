# Cliente CRUD

| **Status** | Implemented — builds green                            |
| **Date** | 2026-10-12 (spec)             |
| **Scope** | `libraryapp-backend` + `libraryapp-frontend`              |
| **Reference** | `Categoria` vertical (backend), `Categoria` screen (frontend) |

> Specification only. Part 2 is written after the implementation.

---

# Part 1 — Specification

## Goal

A complete CRUD for `Cliente`: REST endpoints in the backend and a management screen in the
frontend, following the patterns already established in the project.

## Scope

In scope:

* Backend vertical: entity, DTO, repository, service, controller.
* Frontend screen: list with filter, pagination and sorting, plus a create/edit screen and
  delete confirmation.
* Route `/pages/cliente` registered in the app routes.

Out of scope:

* Search, reports, or any bulk operation.
* The `libro`, `search` and `reserva-wizard` screens. The sidenav already links all of
  them; they are dangling links today and stay that way.
* Any change to the `reserva` vertical, **except** where it consumes `ClienteDTO` (see
  [Constraints and risks](#constraints-and-risks)).

## Data Model

| Entity field | Type | Rules | DTO field |
| --- | --- | --- | --- |
| `idCliente` | `Integer` | identity, generated | `idCliente` |
| `nombres` | `String` | required, 3 to 80 | `nombres` |
| `apellidos` | `String` | required, 2 to 80 | `apellidos` |
| `cedula` | `String` | required, 5 to 20 | `cedula` |
| `email` | `String` | required, 11 to 60, must be a valid email | `email` |

All columns have `nullable = false`.

**The DTO field names are identical to the entity field names.** So the existing `defaultMapper` 
implicit name matching is expected to work as-is. Do not assume it does — see 
the acceptance criterion on `GET`.

## Contract

```
GET    /v1/clients        -> 200 OK + ClienteDTO[]
GET    /v1/clients/{id}   -> 200 OK + ClienteDTO
POST   /v1/clients        -> 201 Created + Location header
PUT    /v1/clients/{id}   -> 200 OK + ClienteDTO
DELETE /v1/clients/{id}   -> 204 No Content
```

Request and response bodies are `application/json`. A missing id returns the project's standard
not-found response.

## Expected Files

Backend — all six already exist and are reviewed against the Data Model and the Contract:

* `model/Cliente.java`
* `dto/ClienteDTO.java`
* `repository/IClienteRepo.java`
* `service/IClienteService.java`, `service/impl/ClienteServiceImpl.java`
* `controller/ClienteController.java`

Frontend — none of these exist; all are new:

* `model/cliente.ts`
* `services/cliente.service.ts`
* `store/cliente.store.ts`, `store/cliente-edit.store.ts`
* `forms/cliente.form.ts`
* `pages/cliente/cliente.component.{ts,html,css}`
* `pages/cliente/cliente-edit/cliente-edit.component.{ts,html,css}`
* Route entry in `app.routes.ts`

Reuse `ICRUD`, `CRUDImpl` and `IGenericRepo` in the backend, and `GenericService` in the frontend.
Do not modify those shared abstractions.

Note the folder names: the backend package is `repository` (not `repo`), the frontend folder is
`store/` (singular), the form lives in `forms/`, and routes are declared in `app.routes.ts`
(there is no `pages/pages.routes.ts`).

## Constraints and risks

**`ClienteDTO` is shared with the `reserva` vertical.** `ReservaDTO` embeds a `ClienteDTO`, and
`ReservaController` populates it via `reservaMapper.map(reserva.getCliente(), ClienteDTO.class)`.
Any change to `ClienteDTO`'s field names or types can break consult mapping and the consult
response body. A change to its validation annotations cannot. Prefer validation-only edits; if a
field rename is genuinely required, treat it as a cross-vertical change and say so.

**`MapperConfig` now declares two `ModelMapper` beans** (`defaultMapper`, `reservaMapper`). 
Controllers inject an unqualified `ModelMapper` and rely on
Spring resolving it by parameter name. This works today but is fragile. Do not add a third bean
unless the Data Model actually requires it, and do not add `@Primary` or `@Qualifier` as a
drive-by fix — that is a shared-abstraction change.

**Validation message bundles.** `messages.properties` and 
`messages_en.properties` have `categoria.name.size`, `categoria.description.size`, `categoria.state.size`,
`libro.title.size`, `libro.autor.size` and `libro.isbn.size`.
`CategoriaDTO` and the libro DTO both pass an explicit `message = "{...}"` key. Decide
consistently with the sibling verticals and add the keys to all three bundles if a custom message
is used.

**Environment.** Export `JAVA_HOME=/c/Program Files/Java/jdk-25.0.4.1+1` before building. 
This is a local environment setting, not a project defect.

## Frontend specifics

`cliente` is a wider entity than `categoria` — five columns:

* **Validators.** `categoria.form.ts` only use `required` + `minLength` /
  `maxLength`. This form also needs an email check. Angular 22.1
  ships `email()` and `pattern()` in `@angular/forms/signals`, and the resulting error `kind`
  literals are `"email"` and `"pattern"` (see
  `node_modules/@angular/forms/types/_structure-chunk.d.ts`). These are confirmed to exist in the
  installed typings; using them is not a new abstraction.
* **Column set.** The list table needs `idCliente`, `nombres`, `apellidos`, `cedula`,
  `email` and `actions`. Keep the `matNoDataRow` `colspan` in sync with the column count.
* **Display name.** The entity has `nombres` / `apellidos`, not a single `name`. The filter
  placeholder and the edit screen's title should reflect that.

## Acceptance Criteria

Legend: `[x]` = verified in the session that implements this. `[ ]` = implemented but not verified
— this environment has no database, no running backend and no browser automation, so anything
requiring a live app or a browser stays unchecked.

* [ ] The five endpoints respond as described in the contract. — to be implemented / verified.
* [ ] A request with a blank `nombres`, `apellidos`, `cedula` or `email` is rejected.
   — none of `ClienteDTO`'s constrained fields carries `@NotBlank`. `@Valid` is already applied in the controller.
* [ ] A malformed `email` is rejected. — `@Email`, plus `@Size(min = 5, max = 55)`.
* [ ] `GET` returns all five fields populated. — the DTO and entity field names match, so
  `defaultMapper`'s implicit matching should carry every field; confirm rather than assume, and
  confirm the injected mapper is the intended one given the two `ModelMapper` beans in
  `MapperConfig`.
* [ ] Creating returns `201` with a `Location` header. — `ResponseEntity.created(location)` built
  with `ServletUriComponentsBuilder` is already in the controller.
* [ ] A missing id returns the standard not-found response. — inherited from
  `CRUDImpl.findById` → `ModelNotFoundException` → `ResponseExceptionHandler` (`404` +
  `CustomErrorTemplate`).
* [ ] The list screen shows clients with filter, pagination and sorting.
* [ ] The create/edit screen creates and edits, and the list refreshes afterward.
* [ ] Delete asks for confirmation first. — **expected to stay open.** The repo has no shared
  confirm-dialog component and no `MatDialog` usage anywhere; adding one is a new abstraction the
  implementation constraint forbids. If it is implemented anyway, the constraint is being overridden — say so
  explicitly in Part 2.
* [ ] The route renders the screen. — the sidenav at `layout.component.html:68` already links
  `/pages/cliente`, so registering the route is what makes that link resolve.
* [ ] The `reserva` vertical still works after the change. — verify `ReservaController`'s
  `reservaMapper.map(cliente, ClienteDTO.class)` is unaffected.
* [ ] Backend compiles and frontend builds. — both commands must actually be run; see the
  `JAVA_HOME` note under Constraints.

---

# Part 2 — Implementation

## Status

Implemented. Backend `mvn package` and frontend `ng build` both succeed (see
[Verification](#verification)). Live-app behaviour (endpoints, screens, route rendering, the
`reserva` vertical) was **not** exercised — this environment has no database, no running backend
and no browser automation — so those criteria stay unchecked.

## What changed

Backend (only two files needed edits; the vertical already existed and matched the reference):

* `model/Cliente.java` — `apellidos` column length `120` → `80` to match the Data Model (2–80).
* `dto/ClienteDTO.java` — `@NotNull` → `@NotBlank` on `nombres`, `apellidos`, `cedula`, `email`
  (blank, not just `null`, is now rejected); added `@Email` on `email`; aligned `apellidos`
  `@Size(max)` `120` → `80`. `idCliente` stays unconstrained.
* No change was needed to `repository/IClienteRepo.java`, `service/IClienteService.java`,
  `service/impl/ClienteServiceImpl.java` or `controller/ClienteController.java` — they already
  mirror the Categoria vertical and the `v1/clients` contract (201 + `Location` on POST;
  put/delete delegate to `CRUDImpl`).

Frontend (new, except the pre-existing model/service stubs and the list component shell):

* `model/cliente.ts` — pre-existing, used as-is.
* `services/cliente.service.ts` — pre-existing, extends `GenericService<Cliente>` unchanged.
* `store/cliente.store.ts` — new; `httpResource` list store mirroring `categoria.store.ts`.
* `store/cliente-edit.store.ts` — new; mirrors `categoria-edit.store.ts`.
* `forms/cliente.form.ts` — new; `form()` schema with `required` + `minLength`/`maxLength` for all
  four fields, plus `email()` on `email` and `pattern()` (`/^[0-9]+$/`) on `cedula`.
* `pages/cliente/cliente.component.{ts,html,css}` — replaced the stub with the full list screen:
  columns `idCliente`, `nombres`, `apellidos`, `cedula`, `email`, `actions`, filter, pagination
  (`MatPaginator`) and sorting (`MatSort`); `matNoDataRow` `colspan` is `6`; filter placeholder is
  `Ex. Juan Pérez`.
* `pages/cliente/cliente-edit/cliente-edit.component.{ts,html,css}` — new create/edit screen. The
  title reflects `nombres`/`apellidos` (`Edit Cliente: <nombres> <apellidos>` / `New Cliente`).
  After a successful create/update it calls `clienteStore.reload()` and navigates back to
  `/pages/cliente`.
* `app.routes.ts` — added the `pages/cliente` route with `new` and `edit/:id` children, mirroring
  the Categoria route (the sidenav link already pointed here).

## Delete-confirmation decision

**Stayed open — delete confirmation was NOT implemented.** `ClienteComponent.delete()` issues the
`DELETE` immediately and reloads, exactly like `CategoriaComponent.delete()`. The repository has no
shared confirm-dialog component and no `MatDialog` usage; adding one would be a new framework
abstraction, which the implementation constraint forbids. This constraint was therefore *not*
overridden — no confirm dialog exists, and the expected-to-stay-open criterion is unchecked.

## Cross-vertical concerns

* **`ClienteDTO` is shared with `reserva`** (`ReservaDTO.cliente`,
  `ReservaController`'s `reservaMapper.map(...)`). The edits are **validation-only** additions
  (`@NotBlank`, `@Email`) plus a `@Size` bound change (`apellidos` `max` 120 → 80). No field was
  renamed and no type changed, so `ModelMapper` name matching and the consult response body are
  unaffected. The `apellidos` change is the only semantically observable one: payloads with an
  `apellidos` longer than 80 characters are now rejected. That is the Data Model's stated rule
  (2–80) and the existing `cliente.apellidos.size` bundle message already said 80, so the 120 was
  the outlier. Flagging it because `reserva` shares the DTO.
* The `Cliente` entity `apellidos` column length was changed `120` → `80`; `spring.jpa.hibernate.ddl-auto`
  is `update`, so this only takes effect where the column is (re)created/re-indexed on a real DB.
* **`MapperConfig`** was left untouched. It currently declares **three** `ModelMapper` beans
  (`defaultMapper`, `libroMapper`, `reservaMapper`) — the spec text says two; the discrepancy is in
  the spec, not the code. `ClienteController` injects `ModelMapper defaultMapper`; Lombok's
  `@AllArgsConstructor` generates a constructor parameter named `defaultMapper`, so Spring resolves
  the bean by parameter name among the multiple candidates. This is by inspection only, not
  runtime-verified.

## Validation messages / bundles

No new custom message key was introduced: `@NotBlank` and `@Email` use their default messages, while
the existing `@Size(..., message = "{cliente.*.size}")` keys are unchanged. Therefore nothing needed
adding to the bundles. Note the spec mentions **three** bundles, but the project only contains
`messages.properties` and `messages_en.properties` (plus their `target/classes` copies) — there is
no third bundle to update.

## Frontend note on `pattern()`

`pattern()` is applied to `cedula` as a digits-only check (`/^[0-9]+$/`). The Data Model only says
cédula is `String` 5–20; the numeric rule is a **frontend-only convenience** (the backend does not
enforce it) and is surfaced as the `"pattern"` error kind. If that restriction is undesirable,
remove the `pattern(path.cedula, ...)` line — it is independent of the other validators. `email()`
drives the `"email"` error kind on the `email` field.

## Verification

| Command | Working directory | Result |
| --- | --- | --- |
| `export JAVA_HOME="/c/Program Files/Java/jdk-25.0.4.1+1" && ./mvnw -B -DskipTests package` | `libraryapp-backend` | **PASS** — `BUILD SUCCESS` (18.3 s), jar repackaged |
| `npm run build` (`ng build`) | `libraryapp-frontend` | **PASS** — `Application bundle generation complete` (21.2 s) |

The only frontend output of note is the pre-existing `bundle initial exceeded maximum budget`
warning (850.17 kB vs 500 kB); it is a budget warning, not a build failure, and is unrelated to this
change.

## Acceptance Criteria (re-checked)

* [ ] The five endpoints respond as described in the contract. — live app; not verified.
* [ ] A request with a blank `nombres`, `apellidos`, `cedula` or `email` is rejected. — implemented
  (`@NotBlank`); runtime only.
* [ ] A malformed `email` is rejected. — implemented (`@Email`, `@Size(min = 11, max = 60)`);
  runtime only.
* [ ] `GET` returns all five fields populated. — DTO/entity field names match for all five fields;
  live app, not verified.
* [ ] Creating returns `201` with a `Location` header. — unchanged controller; live app.
* [ ] A missing id returns the standard not-found response. — inherited behaviour; live app.
* [ ] The list screen shows clients with filter, pagination and sorting. — implemented; browser.
* [ ] The create/edit screen creates and edits, and the list refreshes afterward. — implemented;
  browser.
* [ ] Delete asks for confirmation first. — **expected to stay open and it stayed open** (no
  confirmation); see [Delete-confirmation decision](#delete-confirmation-decision).
* [ ] The route renders the screen. — route registered; browser.
* [ ] The `reserva` vertical still works after the change. — no field/type change to `ClienteDTO`;
  live app.
* [x] Backend compiles and frontend builds. — **both commands were run and both passed**
  (`mvn package` `BUILD SUCCESS`; `ng build` bundle generation complete).