# REST API Reference

Watch Store exposes a versioned JSON REST API from the Spring Boot service at [`services/api`](../services/api).

| Item | Value |
|------|--------|
| Base path | `/api/v1` |
| Local base URL | `http://localhost:8080` |
| Interactive docs | [Swagger UI](http://localhost:8080/swagger-ui.html) |
| OpenAPI spec | [`services/api/openapi/watch-store-api.yaml`](../services/api/openapi/watch-store-api.yaml) |

The OpenAPI file covers core catalog, cart, and checkout flows. Additional admin, account, review, and telemetry endpoints exist in Java controllers and are documented below. When in doubt, use Swagger or the controller source under [`web/controller/`](../services/api/src/main/java/com/watchstore/web/controller/).

---

## Authentication

### Access token (JWT)

Send on protected routes:

```http
Authorization: Bearer <accessToken>
```

Returned in the JSON body from register, login, and refresh responses (`accessToken` field).

### Refresh token

- Stored in an **httpOnly** cookie (name configured in [`AuthCookieService`](../services/api/src/main/java/com/watchstore/security/AuthCookieService.java)).
- Rotate via `POST /api/v1/auth/refresh` (cookie preferred; optional JSON body `{ "refreshToken": "..." }`).
- Cleared on `POST /api/v1/auth/logout` (requires authenticated user).

### OAuth2 (Google)

1. Browser navigates to Spring Security OAuth2 authorization URL (see Spring config).
2. On success, frontend callback receives access token (see `GET /api/v1/auth/oauth2/success` note).
3. Set `FRONTEND_WEB_URL` / `CORS_ORIGINS` for redirect targets ([deployment.md](./deployment.md)).

### Guest cart session

```http
X-Cart-Session-Id: <uuid>
```

Required for guest cart operations and passed on register/login to merge into the user cart.

### Roles

| Role | Access |
|------|--------|
| `CUSTOMER` | Account, cart, checkout, orders, reviews |
| `ADMIN` | All `/api/v1/admin/*` routes (`@PreAuthorize("hasRole('ADMIN')")`) |

### Auth endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | Public | Create account; returns `PublicAuthResponse`; sets refresh cookie |
| POST | `/api/v1/auth/login` | Public | Email/password login |
| POST | `/api/v1/auth/refresh` | Cookie/body | Issue new access token |
| POST | `/api/v1/auth/logout` | Bearer | Revoke session; clear cookie |
| GET | `/api/v1/auth/oauth2/success` | Public | OAuth callback documentation stub |

---

## Error responses

All API errors use a consistent JSON envelope from [`GlobalExceptionHandler`](../services/api/src/main/java/com/watchstore/web/advice/GlobalExceptionHandler.java):

```json
{
  "timestamp": "2026-05-22T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "errors": { "email": "must not be blank" }
}
```

The `errors` map appears only for validation failures (`MethodArgumentNotValidException`).

| HTTP | Typical cause |
|------|----------------|
| 400 | Validation, bad request (`ApiException`) |
| 401 | Missing/invalid JWT, bad credentials, login required for checkout confirm |
| 403 | RBAC denial, checkout session owner mismatch |
| 404 | Entity not found (`ResourceNotFoundException`) |
| 409 | Checkout already in progress, insufficient stock / inventory conflict |
| 410 | Checkout or reservation expired (`GONE`) |
| 422 | Business rule violations (when mapped) |
| 500 | Unhandled server error |

---

## Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/ping` | Public | Liveness `{"status":"ok"}` |

---

## Catalog (public)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/products` | Public | Paginated product search (query: `movementType`, `brandId`, `categoryId`, `minPrice`, `maxPrice`, `caseMaterial`, `color`, `search`, `page`, `size`, `sort`) |
| GET | `/api/v1/products/{idOrSlug}` | Public | Product detail |
| GET | `/api/v1/brands` | Public | List brands |
| GET | `/api/v1/categories` | Public | List categories |
| GET | `/api/v1/products/{slug}/reviews` | Public | Paginated reviews |
| POST | `/api/v1/products/{slug}/reviews` | Bearer | Submit review (verified purchase rules) |
| GET | `/api/v1/products/{slug}/reviews/eligibility` | Bearer | Whether user can review |

---

## Cart

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/cart` | Public + session header | Current cart |
| POST | `/api/v1/cart/items` | Public + session header | Add line item |
| PUT | `/api/v1/cart/items/{productId}` | Public + session header | Update quantity |
| DELETE | `/api/v1/cart/items/{productId}` | Public + session header | Remove line |
| DELETE | `/api/v1/cart` | Public + session header | Clear cart |
| POST | `/api/v1/cart/merge` | Bearer + session header | Merge guest cart into user |

---

## Checkout and orders

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/checkout/initiate` | Public + session header | Reserve inventory; returns `checkoutId` |
| POST | `/api/v1/checkout/confirm` | Bearer | Create order + Stripe PaymentIntent |
| GET | `/api/v1/orders` | Bearer | List caller's orders |
| GET | `/api/v1/orders/{orderId}` | Bearer | Order detail |

### Checkout initiate response

```json
{
  "checkoutId": "550e8400-e29b-41d4-a716-446655440000",
  "totalAmount": 12500.00,
  "items": [
    {
      "productId": "…",
      "productName": "Heritage Automatic",
      "quantity": 1,
      "unitPrice": 12500.00
    }
  ],
  "expiresAtEpochSeconds": 1716393600
}
```

### Checkout confirm request

```json
{
  "checkoutId": "550e8400-e29b-41d4-a716-446655440000",
  "shippingAddress": {
    "line1": "123 Main St",
    "line2": "",
    "city": "Geneva",
    "state": "GE",
    "postalCode": "1200",
    "country": "CH"
  }
}
```

### Checkout confirm response

```json
{
  "orderId": "…",
  "status": "PENDING_PAYMENT",
  "totalAmount": 12500.00,
  "paymentIntentId": "pi_…",
  "paymentClientSecret": "pi_…_secret_…"
}
```

---

## Account

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/account/profile` | Bearer | User profile |
| PUT | `/api/v1/account/profile` | Bearer | Replace profile |
| PATCH | `/api/v1/account/profile` | Bearer | Partial profile update |
| GET | `/api/v1/account/wishlist` | Bearer | Wishlist products |
| POST | `/api/v1/account/wishlist/{productId}` | Bearer | Add to wishlist |
| DELETE | `/api/v1/account/wishlist/{productId}` | Bearer | Remove from wishlist |

---

## Enquiries (customer)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/enquiries` | Public | Submit contact / enquiry form |

---

## Admin API

All routes require **ADMIN** role.

### Products and media

Admin product listing uses the public catalog endpoint: `GET /api/v1/products?page=&size=` (same filters as storefront).

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/admin/products` | Create product |
| PUT | `/api/v1/admin/products/{id}` | Update product |
| DELETE | `/api/v1/admin/products/{id}` | Delete product |
| POST | `/api/v1/admin/products/{id}/images` | Upload primary image (`multipart/form-data`, field `file`) |
| POST | `/api/v1/admin/products/{id}/model-3d` | Upload GLB/GLTF model |
| POST | `/api/v1/admin/products/{id}/gallery-images` | Upload gallery image |

### Brands and categories

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/v1/admin/brands` | List / create brands |
| PUT/DELETE | `/api/v1/admin/brands/{id}` | Update / delete brand |
| GET/POST | `/api/v1/admin/categories` | List / create categories |
| PUT/DELETE | `/api/v1/admin/categories/{id}` | Update / delete category |

### Inventory

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/admin/inventory` | List inventory (`lowStockOnly` query optional) |
| GET | `/api/v1/admin/inventory/{productId}` | Single SKU stock |
| PUT | `/api/v1/admin/inventory/{productId}` | Set absolute stock level |
| PATCH | `/api/v1/admin/inventory/{productId}` | Adjust stock by delta |

### Orders and dashboard

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/admin/orders` | List orders (filters per controller) |
| GET | `/api/v1/admin/orders/{orderId}` | Order detail |
| PUT | `/api/v1/admin/orders/{orderId}/status` | Update fulfillment status |
| GET | `/api/v1/admin/dashboard/stats` | KPI summary |
| GET | `/api/v1/admin/dashboard/sales-chart` | Time-series sales data |

### Users and enquiries

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/admin/users` | List users |
| PUT | `/api/v1/admin/users/{userId}/role` | Promote/demote role |
| GET | `/api/v1/admin/enquiries` | List enquiries |
| GET | `/api/v1/admin/enquiries/{id}` | Enquiry detail |
| PUT | `/api/v1/admin/enquiries/{id}/status` | Update status |
| POST | `/api/v1/admin/enquiries/{id}/replies` | Admin reply |
| POST | `/api/v1/admin/enquiries/{id}/tags` | Add tag |
| DELETE | `/api/v1/admin/enquiries/{id}/tags/{tag}` | Remove tag |

### Telemetry

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/admin/telemetry/summary` | Ops summary |
| GET | `/api/v1/admin/telemetry/checkout-errors` | Checkout failure metrics |
| GET | `/api/v1/admin/telemetry/cache-stats` | Redis catalog cache stats |
| GET | `/api/v1/admin/telemetry/inventory-health` | Stock health |
| GET | `/api/v1/admin/telemetry/brand-turnover` | Brand turnover |

---

## Webhooks

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/webhooks/stripe` | Stripe signature | Payment lifecycle events |

```http
Stripe-Signature: t=…,v1=…
Content-Type: application/json
```

Returns `{"status":"received"}` on success. Configure `STRIPE_WEBHOOK_SECRET` and forward events in local dev (see [local-development.md](./local-development.md)).

---

## Sample payloads

### Register / login response (`PublicAuthResponse`)

```json
{
  "accessToken": "eyJhbG…",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "customer@example.com",
  "role": "CUSTOMER"
}
```

### Product (`ProductResponse`)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Heritage Automatic 41",
  "slug": "heritage-automatic-41",
  "description": "…",
  "price": 12500.00,
  "brandId": "…",
  "brandName": "Maison Example",
  "categoryId": "…",
  "categoryName": "Dress",
  "color": "Silver",
  "images": ["products/…/primary.jpg"],
  "model3dUrl": "products/…/models/watch.glb",
  "galleryImages": ["products/…/gallery-1.jpg"],
  "movementType": "AUTOMATIC",
  "caseMaterial": "Steel",
  "caseDimension": "41mm",
  "waterResistance": "100m",
  "caseThickness": "12.5mm",
  "powerReserve": "72h",
  "movementReference": "CAL-800",
  "quantityAvailable": 3,
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-01-15T10:00:00Z"
}
```

`model3dUrl` and `images` entries are **S3 object keys**. Frontends resolve public URLs via `NEXT_PUBLIC_S3_IMAGE_BASE_URL` or image hostname config.

---

## Related documentation

- [architecture.md](./architecture.md) — Checkout locking, caching, 3D pipeline
- [local-development.md](./local-development.md) — Running API and Stripe CLI locally
- [deployment.md](./deployment.md) — Production secrets and CORS
