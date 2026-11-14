<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# HireLoop project context

Last reviewed: 2026-11-15. This is a snapshot of the implementation, not a guarantee that external services or deployment work. Recheck the code before relying on these notes, and update this file when features change.

## Product and current stage

HireLoop is a job platform with three roles: `seeker`, `recruiter`, and `admin`.

The project is a **partial MVP**: authentication, recruiter company profiles, job publishing/management, and public job discovery are implemented. The end-to-end hiring workflow (apply, review applicants, track application status) is not implemented yet.

Current implemented flow:

> Register/sign in -> recruiter creates a company profile -> recruiter publishes a job -> visitors browse, filter, and view job details.

This repository contains the Next.js client/application, its authentication backend, and an image-upload route. Jobs and companies use a separate HTTP API; do not assume that API's source code or authorization has been reviewed here.

## Technology and conventions

- Next.js `16.4.4` App Router, React `19.3.1`, TypeScript.
- Tailwind CSS 4, shadcn/Base UI components in `components/ui/`, Lucide icons, and motion libraries.
- Better Auth with the MongoDB adapter; authentication uses the `hireloopdb` database.
- `next-themes` provider and the shared toast system in `components/ui/toast.tsx`.
- Existing screens primarily use dark backgrounds and violet accents, with responsive desktop/mobile layouts.
- Match surrounding code style and reuse existing components, API helpers, types, validation, and error patterns. Do not introduce a new architecture or dependency unnecessarily.
- Read the relevant installed Next.js documentation referenced above before changing framework code.

## Repository map

| Path | Purpose |
| --- | --- |
| `app/(website)/` | Homepage and public website layout |
| `app/(auth)/` | Sign-in/sign-up pages and auth layout |
| `app/Browse-jobs/` | URL-driven public job listing and `[id]` details, including route-local `_components/` and loading/not-found UI |
| `app/dashboard/` | Shared authenticated shell and role-specific dashboards |
| `app/components/` | Company form/uploads, delete dialog, and dashboard components; Browse Jobs UI now lives beside its routes |
| `components/` | Shared navbar, footer, hero, auth form, theme provider, and UI primitives |
| `lib/auth.ts`, `lib/auth-client.ts` | Better Auth server/client setup |
| `lib/getUserSession.ts` | Server-side current-user lookup |
| `lib/dashboard.ts`, `lib/require-dashboard-role.ts` | Role types, dashboard URLs, server-side role guard |
| `lib/api/` | Job/company read requests |
| `lib/actions/` | Job/company mutation request helpers; these are ordinary fetch helpers, not Next.js Server Actions |
| `lib/types/` | Auth, company, and job TypeScript types |
| `lib/jobs/search-params.ts`, `lib/job-display.ts` | URL parsing/updating, query serialization, sorting, and salary/deadline formatting |
| `docs/browse-jobs-backend.md`, `docs/backend/jobs-routes.mjs` | Required external Express API setup and copyable route implementation |
| `lib/uploadImage.ts` | Client upload helper and image validation |
| `tests/*.test.mjs` | Node test-runner tests using mocks and TypeScript transpilation |

Preserve the existing capitalized `/Browse-jobs` route in links unless deliberately migrating it everywhere.

## Implemented functionality

### Authentication and dashboard access

- Email/password registration, sign-in, and sign-out using Better Auth.
- Signup role selection, required-field/password validation, password visibility toggles, loading/error feedback, and duplicate-submit protection.
- Session-aware navigation, welcome text, and role-specific dashboard links.
- `/dashboard` redirects authenticated users to their role dashboard.
- Shared dashboard layout requires a valid authenticated role; role layouts enforce role-specific access through `requireDashboardRole`.
- Role-specific sidebar links and responsive sidebar controls are implemented.
- Google OAuth is configured in `lib/auth.ts`, but the current auth form does not expose a Google sign-in flow. Do not describe it as a complete UI feature.

### Public job discovery

- `/Browse-jobs` awaits page `searchParams` and forwards validated database filters to the external API via `getJobs(query)`. This requires updating the external backend; the old `jobs.find()` route ignores query parameters.
- Keyword search matches title, company name, and location.
- Combined job-type (repeated `jobType` parameters), category, minimum/maximum salary, and salary-frequency filters; clear/reset controls. Search/filter values persist in the URL and restore on refresh or Back/Forward.
- Newest/oldest/title sorting and client-side pagination with six jobs per page. `sort` and `page` live in the browser URL but are not forwarded to Express; all matching jobs are returned, not database-paginated results.
- Salary drafts apply on leaving the pair of inputs or pressing Enter; invalid ranges do not navigate. Reset clears search/filters/page while retaining sort and discards unsubmitted drafts.
- `GET /jobs/filters` supplies global category options and job-type counts. Metadata failures do not hide jobs; the UI shows a warning/retry instead. No extra remote control was added, but `isRemote=true/false` URLs are supported.
- Components are in `app/Browse-jobs/_components/`; details components are in `app/Browse-jobs/[id]/_components/`. All helper logic stays under root `lib/`, not page-local `_lib/` folders.
- Loading, empty, and request-failure states, plus responsive job cards.
- `/Browse-jobs/[id]` loads an individual job and handles missing records separately from request failures.
- Details show compensation, location/remote status, deadline, responsibilities, requirements, company overview, and benefits for the job's employment type.
- Company data is matched by `recruiterId`; missing or unavailable company information does not hide the job.
- Verified-employer badges appear only when company `verificationStatus` is `verified`.
- Apply and bookmark buttons are intentionally disabled and marked as future features.

### Recruiter company management

- `/dashboard/recruiter/my-company` selects the current recruiter's company.
- Company form supports create, edit, save, and cancel; initial display is read-only.
- Fields include name, tagline, industry, size, location, website, email, phone, overview, logo, and cover image.
- Benefits are maintained separately for Full-time, Part-time, Contract, Internship, and Freelance jobs, with preset and custom benefits.
- New company creation sets verification status to `pending`; an admin verification workflow is not built.
- Logo/cover uploads use the authenticated local `/api/upload-image` route, which forwards to ImgBB without exposing the API key.
- Upload validation accepts nonempty JPG/PNG/WebP files up to 5 MB. Saving is blocked while an upload is pending.
- Failed company loading blocks the form rather than allowing accidental duplicate creation.

### Recruiter job management

- `/dashboard/recruiter/jobs/new` publishes jobs with title, company name, category, employment type, remote/location information, deadline, salary range/frequency, responsibilities, and requirements.
- Records include the session user's `recruiterId` and a creation timestamp.
- Validation rejects blank required text and invalid salary ranges; location is optional for remote jobs.
- Publishing includes session/loading checks, duplicate-submit protection, response acknowledgement checks, and form reset after success.
- `/dashboard/recruiter/jobs` displays only the current recruiter's jobs, currently by fetching all jobs and filtering by `recruiterId` in the Next.js page.
- Desktop tables/mobile cards display job details and deadline-derived open/expired status.
- View links open public job details. Delete uses a confirmation dialog, failure feedback, and refresh after success.
- Update/edit is only a coming-soon toast. Applicant counts are unavailable, not live statistics.

## External API and data contracts

Base URL: `NEXT_PUBLIC_API_BASE_URL`, falling back to `http://localhost:5000`.

| Request | Purpose |
| --- | --- |
| `GET /jobs` | Fetch job listings |
| `GET /jobs?search=...&jobType=...` | Fetch jobs matching validated search/filter parameters (backend update required) |
| `GET /jobs/filters` | Fetch global categories and job-type counts (backend update required; register before `/jobs/:id`) |
| `GET /jobs/:id` | Fetch a job; 404 means missing |
| `POST /jobs` | Create a job |
| `DELETE /jobs/:id` | Delete a job |
| `GET /companies` | Fetch company profiles |
| `POST /companies` | Create a company profile |
| `PATCH /companies/:id` | Update a company profile |

- Read helpers use `cache: "no-store"`.
- Create helpers expect MongoDB-style `acknowledged`/`insertedId` results. Delete confirmation checks `deletedCount`; company updates check `matchedCount`, allowing unchanged records.
- Jobs and companies use string `_id` values and `recruiterId` ownership links.
- Job salary values are represented as strings in the client. Read helpers normalize numeric salaries and legacy `frequency` fields to `salaryFrequency`.
- Older jobs may lack `createdAt`; sorting can derive creation time from a MongoDB ObjectId.
- Company verification values are `pending`, `verified`, or `rejected`.
- Job types are `Full-time`, `Part-time`, `Contract`, `Internship`, and `Freelance`.
- Jobs currently store `companyName` and `recruiterId`, not a company ID. Do not assume a company foreign-key relationship exists.

## Unfinished functionality — do not mistake routes for completed features

- All three role dashboard overview pages currently render empty containers.
- Seeker jobs, applications, saved jobs, billing, and settings are mostly title/description placeholders. The résumé section explicitly says uploads are not connected.
- Recruiter applications and settings are placeholders; job editing is not connected.
- Admin users, jobs, companies, payments, and settings are placeholders. User moderation, company verification, and platform management are not implemented.
- No working job application submission, résumé submission, applicant review, accept/reject/status workflow, or seeker application tracking.
- No working saved-job/bookmark persistence, billing, subscriptions, payments, or dashboard analytics.
- The homepage hero search and navbar “Get Started” button are not wired up.
- Navbar links to `/company` and `/pricing` exist, but corresponding pages were absent at review time.
- Homepage/auth marketing statistics are hardcoded, not database-driven.
- `README.md` is still the starter template.

## Security and deployment cautions

- **Admin self-registration is currently allowed** in both `components/auth-form.tsx` and `lib/auth.ts` (`role.input: true`). This is a development-only arrangement and must be restricted before production; hiding the option in the UI alone is insufficient.
- Dashboard route guards do not replace backend authorization. Current job/company fetch helpers do not explicitly attach authentication credentials; verify authentication, roles, and record ownership in the separate API before deployment.
- Client-supplied `recruiterId` or verification fields must not be trusted as authorization by the backend.
- Never expose database credentials, auth secrets, OAuth client secrets, or the ImgBB key through `NEXT_PUBLIC_*` variables, logs, tests, or documentation.
- Do not copy `.env` contents into this file.

Environment names referenced by application code:

- `MONGODB_URI`
- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_BETTER_AUTH_URL` (browser auth client URL)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_API_BASE_URL` (public jobs/company API URL)
- `IMGBB_API_KEY` (server-side image upload key)

This is not an exhaustive Better Auth production configuration checklist; verify its installed documentation and required secret/origin settings before deployment.

## Commands and verification

```sh
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
node --test tests/*.test.mjs
```

- There is currently no `npm test` script; invoke the Node test runner directly.
- `npm run format` rewrites all matching TypeScript/TSX files; avoid running it broadly for a small change.
- After the 2026-11-15 Browse Jobs refactor, all **102 tests passed**. Added coverage includes query parsing, URL updates, filter drafts, query forwarding, metadata failures, and the copyable Express route example with mocked collections.
- These tests cover forms, API helpers, job browsing/details, deletion, uploads, navigation, and dashboard layout/sidebar behavior. Many use mocks or source checks; they are not browser end-to-end tests or proof of a live API integration.
- After that refactor, `npm run lint` still fails with two pre-existing errors outside Browse Jobs:
  - `components/ui/carousel.tsx`: synchronous state update from an effect.
  - `hooks/use-mobile.ts`: synchronous state update from an effect.
- Production build and TypeScript checks passed after the refactor. Build warns that Google OAuth credentials are missing. Live authentication, actual Express/MongoDB filter behavior, browser visual checks, and deployment were not verified. Run the smoke tests in `docs/browse-jobs-backend.md` after updating the backend before claiming end-to-end readiness.

## Suggested next milestones

These are recommendations, not authorization to implement unrelated work:

1. Restrict privileged signup and verify external API authentication/ownership enforcement.
2. Build job applications end to end, including résumé submission and duplicate-application prevention.
3. Build recruiter applicant review and status updates, then seeker application tracking.
4. Add saved jobs and complete job editing.
5. Implement dashboard summaries, admin management/verification, and account settings.
6. Connect remaining public interactions/pages, resolve lint issues, document setup, and verify deployment.

When updating this file, keep implemented behavior separate from placeholders and planned work. Preserve the generated Next.js block above and do not discard unrelated user changes.
