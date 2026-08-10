# FinPilot Frontend

React (Vite) frontend for FinPilot. So far this covers **login, register, and a protected
dashboard placeholder** that confirms your JWT works end-to-end against the Spring Boot backend.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173 — make sure your Spring Boot backend is running on
`http://localhost:8080` (or update `VITE_API_BASE_URL` in `.env` if it's different).

## Backend CORS

Your `SecurityConfig` uses a custom JWT filter chain with CSRF disabled, so CORS has to be
wired into the security chain itself (a plain `WebMvcConfigurer` isn't reliable here, since
Spring Security can reject the browser's preflight `OPTIONS` request before MVC even sees it).

**1. Add `.cors(...)` to the `securityFilterChain` method**, right after `.csrf(csrf -> csrf.disable())`:

```java
http
        .csrf(csrf -> csrf.disable())
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .sessionManagement(session -> ...)
        // ...rest stays the same
```

**2. Add this bean to the same `SecurityConfig` class:**

```java
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(List.of("http://localhost:5173"));
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

**3. Make sure preflight requests are allowed through** — add this line inside
`authorizeHttpRequests`, before your other rules:

```java
.requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
```

Restart the backend after this change.

## What's wired up

- `/` — Landing page (public, no login needed)
- `POST /api/auth/register` — Register page
- `POST /api/auth/login` — Login page (stores `token` + `refreshToken` in localStorage)
- `GET /api/users/me` — Dashboard header shows the logged-in user
- `POST /api/auth/logout` — Logout button
- `GET /api/expenses` — Dashboard: summary cards, category pie chart, 6-month trend chart,
  searchable/filterable/paginated transaction list
- `POST /api/expenses` — "Log expense" modal
- `PUT /api/expenses/{id}` — Edit (pencil icon) on any transaction row
- `DELETE /api/expenses/{id}` — Delete (× icon) on any transaction row, with a confirm prompt
- `GET /api/budgets`, `POST /api/budgets`, `PUT /api/budgets/{id}`, `DELETE /api/budgets/{id}`
  — Budgets page: cards with a progress bar (spent vs. limit for that period), computed by
  summing expenses whose date falls inside each budget's start/end date
- `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` — Forgot/Reset password
  pages. **⚠️ Assumed endpoint paths** — your `AuthController` snippet didn't show these two
  mappings, only the service methods. If your actual paths differ, update them in
  `src/api/auth.js`. Also note: your backend currently prints the reset token to the
  **IntelliJ console** rather than emailing it (no email service wired up yet) — the Forgot
  Password page tells the user to go check the console, which only works for you two testing
  it locally, not for real users later.

The dashboard computes "this month" totals, the category breakdown, and the 6-month trend
on the frontend from the full expense list returned by `GET /api/expenses` — there's no
dedicated stats endpoint on the backend yet.

## Next steps

- Token refresh handling for expired JWTs (currently: if `/users/me` fails, the user is
  logged out and sent back to login)
- Backend-side filtering (the backend already supports `GET /api/expenses/category/{category}`
  and `GET /api/expenses/date/{date}` — the dashboard currently filters client-side instead)
- Editing your profile (`PUT /api/users/{id}`)
- Real email delivery for password reset (right now it's console-only, fine for local dev)
