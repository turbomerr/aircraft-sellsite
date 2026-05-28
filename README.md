# ✈️ Aircraft Sell Site

A RESTful API backend for an aircraft marketplace. Users can create aircraft listings, make offers, and pay to promote their listing to premium.

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [API Reference](#api-reference)
  - [Auth](#auth)
  - [Aircraft](#aircraft)
  - [Offer](#offer)
  - [Payment](#payment)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js |
| **Language** | TypeScript |
| **Framework** | Express 5 |
| **Database** | MongoDB + Mongoose |
| **Authentication** | JWT (Access Token + Refresh Token) |
| **Password Hashing** | bcryptjs |
| **Payments** | Stripe |
| **Cookie Management** | cookie-parser |

---

## Project Architecture

The project follows the **MVC (Model-View-Controller)** pattern:

```
src/
├── config/
│   ├── db.ts            # MongoDB connection
│   └── stripe.ts        # Stripe client
├── controllers/
│   ├── auth.controller.ts      # Register, Login, Refresh Token
│   ├── aircraft.controller.ts  # Aircraft CRUD
│   ├── offer.controller.ts     # Offer operations
│   └── payment.controller.ts   # Stripe checkout + webhook
├── middleware/
│   ├── protectRoute.ts  # JWT verification (protected routes)
│   └── errorHandler.ts  # Global error handler
├── models/
│   ├── User.ts
│   ├── Aircraft.ts
│   ├── Offer.ts
│   └── Payment.ts
├── routes/
│   ├── auth.routes.ts
│   ├── aircraft.routes.ts
│   ├── offer.route.ts
│   └── payment.routes.ts
└── server.ts            # Application entry point
```

**Auth Flow:**
1. User registers/logs in → Access Token (response body) + Refresh Token (HttpOnly cookie)
2. Protected routes require `Authorization: Bearer <accessToken>` header
3. When the access token expires, call `/api/auth/refresh-token` to get a new one

---

## API Reference

**Base URL:** `http://localhost:5001/api`

🔒 = Protected route — requires `Authorization: Bearer <token>` header

---

### Auth

#### Register
```
POST /api/auth/register
```
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
```
**Response `201`:**
```json
{
  "message": "User registered",
  "accessToken": "<jwt_access_token>",
  "user": { "id": "...", "name": "John Doe", "email": "john@example.com", "role": "user" }
}
```

---

#### Login
```
POST /api/auth/login
```
**Body:**
```json
{
  "email": "john@example.com",
  "password": "123456"
}
```
**Response `200`:**
```json
{
  "message": "User loged in",
  "accessToken": "<jwt_access_token>",
  "user": { "id": "...", "name": "John Doe", "email": "john@example.com", "role": "user" }
}
```
> Refresh token is set as an HttpOnly cookie.

---

#### Refresh Access Token
```
POST /api/auth/refresh-token
```
> Refresh token is read automatically from the cookie.

**Response `200`:**
```json
{
  "accessToken": "<new_jwt_access_token>"
}
```

---

### Aircraft

#### List All Aircraft
```
GET /api/aircraft
```
**Response `200`:**
```json
{
  "length": 5,
  "results": [ { ...aircraft }, ... ]
}
```

---

#### Get Aircraft by ID
```
GET /api/aircraft/:aircraftId
```
**Response `200`:**
```json
{
  "aircraft": { ...aircraft, "owner": { "name": "...", "email": "..." } }
}
```

---

#### Create Aircraft Listing 🔒
```
POST /api/aircraft
```
**Body:**
```json
{
  "manufacturer": "Boeing",
  "model": "737",
  "year": 2015,
  "price": 5000000,
  "aircraftType": "commercial",
  "engineType": "jet",
  "totalFlightHours": 12000,
  "cruiseSpeed": 850,
  "images": ["https://..."],
  "description": "Well maintained aircraft."
}
```
> `aircraftType`: `"commercial"` | `"private"` | `"cargo"` | `"helicopter"`  
> `engineType`: `"jet"` | `"turboprop"` | `"piston"` | `"electric"`

**Response `201`:**
```json
{
  "message": "Aircraft created",
  "newAircraft": { ...aircraft }
}
```

---

#### Update Aircraft Listing 🔒
```
PATCH /api/aircraft/:aircraftId
```
> Only the owner of the listing can update it.

**Body:** Any fields to update

**Response `200`:** Updated aircraft object

---

#### Delete Aircraft Listing 🔒
```
DELETE /api/aircraft/:aircraftId
```
> Only the owner of the listing can delete it.

**Response `200`:**
```json
{
  "message": "Aircraft deleted successfully",
  "aircraft": { ...deletedAircraft }
}
```

---

### Offer

#### Send an Offer 🔒
```
POST /api/offer/:aircraftId
```
> You cannot make an offer on your own aircraft. If you already have a pending offer on the same aircraft, a new one cannot be submitted.

**Body:**
```json
{
  "offerAmount": 4500000,
  "message": "I am interested in this aircraft."
}
```
**Response `201`:**
```json
{
  "message": "Offer created",
  "buyerId": "...",
  "sellerId": "...",
  "offerAmount": 4500000,
  "offerMessage": "I am interested in this aircraft."
}
```

---

#### Get My Sent Offers 🔒
```
GET /api/offer/my/sent
```
**Response `200`:**
```json
{
  "success": true,
  "offersLength": 3,
  "pendingOffers": [ ...offers ],
  "acceptedOffers": [ ...offers ]
}
```

---

#### Get Offers Received on My Aircraft 🔒
```
GET /api/offer/my/received
```
**Response `200`:**
```json
{
  "message": "Received Offer List",
  "results": 2,
  "list": [ ...offers ]
}
```

---

#### Respond to an Offer 🔒
```
PATCH /api/offer/:offerId/respond
```
> Only the seller can respond. The offer must be in `pending` status and not expired.  
> If accepted, the aircraft status changes to `under_offer` and all other pending offers are automatically rejected.

**Body:**
```json
{
  "status": "accepted"
}
```
> `status` must be `"accepted"` or `"rejected"`

**Response `200`:**
```json
{
  "message": "Offer status : accepted",
  "offer": { ...offer }
}
```

---

#### Cancel an Offer 🔒
```
PATCH /api/offer/:offerId/cancel
```
> *(Under development — will allow the buyer to cancel their own offer)*

---

### Payment

#### Start Premium Checkout 🔒
```
POST /api/checkout/:aircraftId
```
> Only the aircraft owner can initiate payment. Returns an error if the aircraft is already premium. Fee: **29.99 EUR**

**Response `200`:**
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.stripe.com/...",
  "sessionId": "cs_..."
}
```
> Redirect the user to `checkoutUrl`. Once payment is completed, `isPremium` is set to `true`.

---

#### Stripe Webhook *(called by Stripe)*
```
POST /api/payments/webhook
```
> Expects a raw body. Stripe signature is verified.  
> `checkout.session.completed` → payment successful, aircraft is marked as premium.  
> `checkout.session.expired` → payment is marked as cancelled.

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/turbomerr/aircraft-sellsite.git
cd aircraft-sellsite

# Install dependencies
npm install

# Start in development mode
npm run dev
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=5001
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/aircraft-sellsite

JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

CLIENT_URL=http://localhost:3000
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start in development mode with `tsx watch` |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled application |

---

## License

ISC
