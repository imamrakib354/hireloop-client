# Connect URL-based Browse Jobs to Express

The Next.js frontend now forwards database filters to your external API. The old
`jobs.find()` endpoint ignores those filters, so update the backend before expecting
filtered results. This repository does not contain or deploy that Express server.

## Install the routes

1. Copy `docs/backend/jobs-routes.mjs` into your backend (for example `jobs-routes.mjs`).
2. Import it from your backend entry file:

   ```js
   import { registerJobsRoutes } from "./jobs-routes.mjs"
   ```

3. After initializing your MongoDB `jobs` collection, replace the old
   `app.get('/jobs', ...)` handler with:

   ```js
   registerJobsRoutes(app, jobs)
   ```

4. Put that registration **before** `app.get('/jobs/:id', ...)` so `filters` is
   not interpreted as an ObjectId. Keep your existing POST, DELETE, and individual
   job endpoints. Do not leave the old GET `/jobs` handler registered too.
5. Restart the backend. Set the client's `NEXT_PUBLIC_API_BASE_URL` to its URL
   (the default is `http://localhost:5000`). Restart Next.js if this variable changes.

The example uses ES module syntax, matching the client's configuration. If your
backend uses CommonJS, adapt the import/exports to that backend's module system.

## API contract

`GET /jobs` still returns an array, so existing recruiter management calls work.

Supported filters:

| Query parameter   | Example                       | Meaning                                                     |
| ----------------- | ----------------------------- | ----------------------------------------------------------- |
| `search`          | `react`                       | Literal, case-insensitive title/companyName/location search |
| `jobType`         | `Full-time`                   | Exact employment type; repeat for multiple checkboxes       |
| `category`        | `Engineering & Tech`          | Exact category                                              |
| `isRemote`        | `true` or `false`             | Optional boolean filter; omitted means any arrangement      |
| `minSalary`       | `25`                          | Job minimum salary must be at least this amount             |
| `maxSalary`       | `40`                          | Job maximum salary must be at most this amount              |
| `salaryFrequency` | `hourly`, `monthly`, `yearly` | Filter salary units, with legacy `frequency` support        |

`search` is limited to 200 characters. Query strings are not trusted as MongoDB
objects: the example validates scalar types, job types, booleans, and salaries,
and escapes regex syntax. Salary comparisons handle old numeric-string records
with `$convert`. Prefer validated numeric salary storage for future records.
There is no automatic currency/pay-period conversion; select a pay period when
comparing salary amounts.

`GET /jobs/filters` returns global categories and employment-type counts:

```json
{
  "categories": ["Design & Creative", "Engineering & Tech"],
  "jobTypeCounts": { "Full-time": 12, "Contract": 4 }
}
```

This small metadata response keeps the sidebar options/counts stable while results
are filtered. If it fails, job results still render, but the UI warns and offers a
retry; unavailable counts show a dash, not misleading zeros.

## Frontend behavior

- Browser URLs keep the existing `/Browse-jobs` casing.
- `search`, filters, `sort`, and `page` live in the browser URL.
- Only database filters are forwarded to `/jobs`; sorting and six-per-page
  pagination operate on the matching returned jobs, keeping the API simple.
- Salary edits apply on leaving the two salary inputs or pressing Enter, not on
  every keystroke. Invalid ranges do not navigate.
- Search/filter/sort changes reset page selection. Reset clears search/filters and
  page while retaining the selected sort. Back/Forward and refresh restore values.
- No remote checkbox was added: the existing design is unchanged, but URLs with
  `isRemote=true` or `isRemote=false` are supported.
- This is not database pagination: all matching jobs are downloaded. Add server
  pagination and totals later if the dataset grows.

## Manual smoke test (after updating the backend)

1. Open `/Browse-jobs`; check all jobs, categories, and counts.
2. Search a known title, company, or location; check `search=` in the URL.
3. Select Full-time and Contract; verify repeated `jobType=` values survive search.
4. Set category and salary/pay period; verify only matching jobs appear.
5. Submit a search containing `+`, `&`, or `[`; it should be literal and safely encoded.
6. Refresh and use Back/Forward; check selected controls and results agree.
7. Sort, change page, and reset. Verify six cards/page and page reset on filtering.
8. Test no matches, a missing metadata endpoint, and an offline API; retry should
   retain the current search URL.
9. Check the recruiter job list and public job-details links still work.

The route example is covered by mocked collection tests in this client repository;
actual Express/MongoDB behavior and deployment still need the smoke test above.
Existing authentication/ownership enforcement on write endpoints is outside this
public listing change and must remain in place.
