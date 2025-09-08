# Copilot Instructions for ngx-mat-input-tel

## Project Overview

- This is an Angular Material library for international telephone input, with country flag dropdown, validation, and formatting using `libphonenumber-js`.
- Main library code is in `projects/ngx-mat-input-tel/src/lib/`.
- Demo/test app is in `projects/ngx-mat-input-tel-tester/`.
- Country data and phone formats are in `src/lib/data/country-code.const.ts`.

## Key Components & Data Flow

- `NgxMatInputTelComponent` is the core input component, using Angular signals and forms.
- Country selection, phone formatting, and validation are handled in the component, with country data from `ALL_COUNTRIES` and examples from `EXAMPLES`.
- Country flags are rendered via `NgxMatInputTelFlagComponent` and assets in `src/lib/assets/`.
- Validation uses a custom validator: `ngxMatInputTelValidator`.

## Developer Workflows

- **Build library:** `npm run build_lib`
- **Build + package:** `npm run package`
- **Test:** Use Angular's default test commands in the tester app.
- **Local usage:** Build and package, then install `.tgz` in another project.
- **Demo:** Run the tester app for live examples.

## Project-Specific Patterns

- Country data is stored as arrays; see `ALL_COUNTRIES` for structure.
- Inputs use Angular's new signals API and template syntax (`@if`, `@for`).
- Boolean inputs can be passed as attributes (e.g., `enablePlaceholder`) or with `[enablePlaceholder]="true"`.
- Preferred and only countries are filtered via input arrays.
- Custom CSS variables control flag/placeholder display.

## Integration Points

- Relies on `libphonenumber-js` for phone parsing/validation.
- Angular Material modules are imported directly in component decorators.
- Country data and phone examples are tightly coupled to input logic.

## Conventions

- All country codes are lowercase ISO2 (e.g., `us`, `gb`).
- Country data arrays: `[name, iso2, dialCode, priority?, areaCodes?]`.
- Use signals for reactive state in components.
- Use `mat-hint` and `mat-error` for displaying validation and placeholders.

## Example: Adding a Country

- Update `ALL_COUNTRIES` in `country-code.const.ts`.
- Add example number to `EXAMPLES`.
- Ensure flag asset exists if needed.

## Key Files

- `src/lib/ngx-mat-input-tel.component.ts` (main logic)
- `src/lib/data/country-code.const.ts` (country data)
- `src/lib/ngx-mat-input-tel.validator.ts` (validation)
- `src/lib/ngx-mat-input-tel-flag/ngx-mat-input-tel-flag.component.ts` (flag rendering)
- `projects/ngx-mat-input-tel-tester/src/app/app.component.html` (usage examples)
