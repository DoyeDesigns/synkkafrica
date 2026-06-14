# Travel hero architecture

## URL shape (no full page reload)

- Landing: `/?section=accommodations`
- Results: `/?section=flights&view=results&from=Lagos&to=Accra`

Sections: `accommodations` | `flights` | `car-rentals` | `tours`

## Switching tabs

Updates `section` in the URL via `router.replace(..., { scroll: false })`.
Hero background + form + body content all react to the same `section` param.

## Figma sync workflow

1. Correct **`accommodations-search-form.tsx`** to match Figma (reference form).
2. Tell the agent: **"sync forms from reference"**
3. Agent copies styling/structure from accommodations into the other three forms.

Reference marker: `@reference-form` comment + `FORM_REFERENCE_SECTION` in `constants.ts`.

## Hero images (you provide)

Place files in `public/heroes/`:

- `accommodations.jpg`
- `flights.jpg`
- `car-rentals.jpg`
- `tours.jpg`

Paths are configured in `src/features/travel/constants.ts`.

## Data fetching

React Query keys in `query-keys.ts`:

- Landing: `['travel', section, 'landing']`
- Results: `['travel', section, 'results', searchKey]`

Replace mock fetchers in `use-section-content.ts` with real API calls later.
