# Admin backend scaffold

This folder contains a standalone ASP.NET Core Web API scaffold for the admin panel phase.

## What it demonstrates

- `[Authorize(Roles = "Admin")]` applied at controller level for every admin API.
- `403 Forbidden` behavior for authenticated non-admin users, assuming their JWT lacks the `Admin` role.
- Dashboard stats endpoint using `await _context.Users.CountAsync()` and `await _context.Products.CountAsync()`.
- Product CRUD endpoints.
- User listing plus lock/unlock and approval updates.
- EF Core read optimizations using `.AsNoTracking()`.
- Eager loading via `.Include(product => product.Category)` to avoid N+1 issues.
- PostgreSQL persistence via Supabase-hosted Postgres.

## Run locally

Set the connection string before running. The recommended approach is an environment variable so the real Supabase password never lives in source control.

Example connection string format:

```text
Host=aws-1-ap-southeast-1.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.jisbeenthdzlfvorvwzn;Password=YOUR_PASSWORD;SSL Mode=Require;Trust Server Certificate=true
```

Then run:

```bash
dotnet restore
dotnet run
```

Example environment variable:

```bash
export SUPABASE_CONNECTION_STRING="Host=db.jisbeenthdzlfvorvwzn.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=YOUR_PASSWORD;SSL Mode=Require;Trust Server Certificate=true"

# Recommended pooler host for environments that have trouble reaching the direct IPv6 endpoint
export SUPABASE_CONNECTION_STRING="Host=aws-1-ap-southeast-1.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.jisbeenthdzlfvorvwzn;Password=YOUR_PASSWORD;SSL Mode=Require;Trust Server Certificate=true"
```

The frontend is configured to call `http://localhost:5000/api/admin` by default, but you can override that with `VITE_API_BASE_URL`.
