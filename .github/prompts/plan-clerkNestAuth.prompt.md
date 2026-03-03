## Plan: Clerk Auth for Nest API

Wire NestJS to accept `Authorization: Bearer <Clerk session token>` from the Next.js server, verify it with Clerk (`@clerk/backend`), and enforce auth globally via an `APP_GUARD` with a `@Public()` escape hatch. This matches your repo’s existing “global cross-cutting concerns” pattern in [apps/api/src/app.module.ts](apps/api/src/app.module.ts#L1-L31) (already used for validation + Prisma error filtering) and avoids CORS complexity since Next will call the API server-to-server.

**Steps**

1. Add Clerk backend dependency to the API
   - Update [apps/api/package.json](apps/api/package.json) to include `@clerk/backend` (used for `verifyToken()`).
2. Add API env vars (prefer “networkless” public key verification)
   - Configure either `CLERK_JWT_KEY` (recommended: PEM public key from Clerk Dashboard) or `CLERK_SECRET_KEY` (Clerk secret).
   - Add `CLERK_AUTHORIZED_PARTIES` (comma-separated) containing your Next app origins (e.g. `http://localhost:3000` and your prod web URL). This maps to Clerk’s `authorizedParties` option and validates `azp`.
3. Create a small auth “surface area” in the API
   - Add a guard in [apps/api/src/common/auth/clerk-auth.guard.ts](apps/api/src/common/auth/clerk-auth.guard.ts) that:
     - Extracts Bearer token from `Authorization`
     - Calls `verifyToken(token, { jwtKey: process.env.CLERK_JWT_KEY, secretKey: process.env.CLERK_SECRET_KEY, authorizedParties: [...] })`
     - On success, attaches a minimal auth object to `req` (at least `userId` from `sub`, optionally `sessionId` from `sid`, and the raw claims)
4. Add `@Public()` decorator support (so global guard is ergonomic)
   - Add [apps/api/src/common/auth/public.decorator.ts](apps/api/src/common/auth/public.decorator.ts) that sets metadata (e.g. `IS_PUBLIC_KEY`).
   - Update the guard to skip auth when the route/class is marked public (using Nest’s `Reflector`).
5. Register the guard globally
   - Update [apps/api/src/app.module.ts](apps/api/src/app.module.ts#L1-L31) to add an `APP_GUARD` provider pointing to your Clerk guard (same pattern as `APP_PIPE` / `APP_FILTER`).
6. (Optional but clean) Add a param decorator + request typing
   - Add [apps/api/src/common/auth/current-auth.decorator.ts](apps/api/src/common/auth/current-auth.decorator.ts) for `@CurrentAuth()` to read `req.auth`.
   - Add Express request augmentation in [apps/api/src/types/express.d.ts](apps/api/src/types/express.d.ts) so `req.auth` is typed across the app.
7. Swagger: document Bearer auth (docs stay public)
   - Update [apps/api/src/main.ts](apps/api/src/main.ts#L1-L21) to add a Bearer security scheme to Swagger so you can try endpoints easily from `/api` while still allowing the docs page itself to load unauthenticated.
8. Next.js: send the default session token on server-side requests
   - Add a small helper (e.g. [apps/web/lib/api.ts](apps/web/lib/api.ts)) that uses Clerk server `auth().getToken()` (default session token) and calls the API with `Authorization: Bearer …`.
   - Use that helper from server components / route handlers that need API access.

**Verification**

- API unit check: `pnpm -F api test`
- API manual check (server-to-server): call a protected endpoint with a real Bearer token and confirm you get `401` without a token and `200` with one.
- Swagger: open `/api`, confirm “Authorize” appears and protected endpoints require auth.
- Web: hit a page that triggers the server-side API call; confirm it succeeds when signed in.

**Decisions**

- Global auth by default via `APP_GUARD`; opt-out with `@Public()`.
- Server-side only calls from Next to avoid CORS and token exposure.
- Use `@clerk/backend` verification; prefer `CLERK_JWT_KEY` (public, networkless) plus `authorizedParties` hardening.

If you want, I can tailor the `CLERK_AUTHORIZED_PARTIES` values to your actual local/prod URLs (and suggest where to store them in each app’s env setup).
