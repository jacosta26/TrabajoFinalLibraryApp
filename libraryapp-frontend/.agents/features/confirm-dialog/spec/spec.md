# Confirm Dialog Component

|             |                          |
| ----------- | ------------------------ |
| **Status**  | Implemented            |
| **Date**    | 2026-10-12               |
| **Scope**   | `app/shared/components`  |
| **Affects** | `ConfirmDialogComponent` |

> Specification for a reusable Angular Material confirmation dialog component.

---

# Part 1 — Specification

*Written before implementation.*

## Problem

Multiple features require asking the user for confirmation before executing destructive actions such as deleting records. Recreating the dialog in every feature leads to duplicated code and inconsistent behavior.

## Goal

Provide a reusable Angular Material dialog component that displays a confirmation message and returns the user's decision (`true` or `false`) to the caller.

## Scope

In scope:

* Reusable standalone Angular component.
* Located under `src/app/shared/components/confirm-dialog`.
* Uses Angular Material `MatDialog`.
* Returns `true` when the user confirms.
* Returns `false` when the user cancels.

Out of scope:

* Custom titles or messages.
* Icons or illustrations.
* Internationalization (i18n).
* Passing custom button labels.
* Styling beyond the default Angular Material appearance.

## Decisions

**The component is implemented as a standalone component.**
No Angular module declaration is required, making it easier to import wherever it is needed. No explicit
`standalone: true` flag is written: Angular 19+ makes standalone the default and no component in this
repository declares it.

**The template lives in a separate HTML file, not inline.** <!-- deviation from the original spec -->
Every component in this project ships a `templateUrl` + `styleUrl` pair
(`libro-dialog`, `categoria`, `categoria-edit`, `cliente`, ...), so the component follows the project style
instead of the originally specified inline template.

**The dialog returns boolean values for the two in-dialog actions.**
`true` indicates confirmation and `false` indicates cancellation, providing a simple and predictable
contract. See *Deviation: escape / backdrop* below for the dismiss paths.

**`MatDialogRef` is obtained using `inject()`.**
This follows the modern Angular dependency injection style and avoids constructor injection.

**The Delete button uses `cdkFocusInitial`.**
Keyboard focus is placed on the primary action when the dialog opens. `cdkFocusInitial` is a plain
attribute marker read by the CDK focus trap, not a directive, so it needs no import.

**Buttons reuse the existing global `.cancel-button` class.**
`design.md` documents that destructive/cancel actions are styled by the global `.cancel-button` rule in
`src/styles.css` (`background-color: red`) and that migrating it to `--mat-sys-error` is a pending
recommendation. The component reuses that class as-is rather than introducing new styling, and adds no
component styles beyond resetting the message margin.

## Contract

The component exposes no inputs or outputs.

Behavior:

| User Action                                | Dialog Result | Verified |
| ------------------------------------------ | ------------- | -------- |
| Click **Delete**                           | `true`        | Yes      |
| Click **Cancel** (`onNoClick()`)           | `false`       | Yes      |
| Dismiss with `Escape`                      | `undefined`   | Yes      |
| Dismiss with a backdrop click              | `undefined`   | No       |

Consumers open the dialog through `MatDialog` and subscribe to the value returned by `afterClosed()`.

### Deviation: escape / backdrop returns `undefined`, not `false`

The requested contract was `false` for escape/backdrop dismissal. That is not achievable with
`MatDialog` in Angular Material 22.1.7, and the value is `undefined` instead:

* `MatDialogRef` closes itself on `Escape` and on backdrop clicks with no argument
  (`_closeDialogVia(this, interactionType)` -> `close(result)`), so `afterClosed()` emits `undefined`.
* The result cannot be rewritten afterwards: `MatDialogRef.close()` delegates to the CDK
  `DialogRef.close()`, which is guarded by `if (this._closed) return;`. A late `close(false)` is a no-op.
* Preventing Material's own close would require `disableClose: true` plus re-implementing escape and
  backdrop handling in the component, which is out of scope for this spec.

Practically this is harmless: both `false` and `undefined` are falsy, so `if (confirmed) { ... }` behaves
identically. Consumers that need a strict boolean should coerce it.

## Acceptance Criteria

* [x] The component exists under `src/app/shared/components/confirm-dialog`. <!-- verified: file present and imported by the spec -->
* [x] The component is standalone. <!-- verified: no NgModule declares it; it is imported directly and instantiated by `MatDialog.open` -->
* [x] The selector is `app-confirm-dialog`. <!-- verified: the spec queries `app-confirm-dialog button` -->
* [x] The template uses Angular Material dialog directives. <!-- verified: `mat-dialog-content`, `mat-dialog-actions`, `mat-flat-button` and `[mat-dialog-close]` are present in the rendered dialog -->
* [x] Clicking **Cancel** closes the dialog with `false`. <!-- verified: "closes with false when Cancel is clicked" -->
* [x] Clicking **Delete** closes the dialog with `true`. <!-- verified: "closes with true when Delete is clicked" -->
* [ ] The Delete button receives initial keyboard focus. <!-- NOT ticked: the `cdkFocusInitial` marker is asserted to be on the Delete button and absent from Cancel, but actual focus placement was not observed. The CDK focus trap resolves it in `afterNextRender`, which does not run in this zoneless jsdom harness, and the dialog was never opened in a real browser. -->
* [x] The component compiles without additional configuration. <!-- verified: `npm run build` succeeds -->
* [x] Review that component use design.md styles <!-- verified: `design.md` does exist (the previous revision of this spec wrongly said otherwise). The component uses Material 3 defaults and the existing global `.cancel-button` class, matching the destructive-button convention documented in `design.md` and used by `medic-dialog`. It introduces no new colors or spacing. -->

## Expected Implementation

```text
src/app/shared/components/confirm-dialog/
├── confirm-dialog.component.ts
├── confirm-dialog.component.html
├── confirm-dialog.component.css
```

The generated component should contain:

* Selector: `app-confirm-dialog`
* Standalone component
* Imports:

  * `MatDialogModule`
  * `MatButtonModule`

* Separate `templateUrl` / `styleUrl` (project style; see *Decisions*)
* `MatDialogRef` injected using `inject()`
* `onNoClick()` method that closes the dialog with `false`
* Delete button using `[mat-dialog-close]="true"` and `cdkFocusInitial`

---
