# Final Security Architecture & Implementation Plan: Firebase Authentication (primenewsgraph-7466f)

Integrate the user's authentic Firebase project (`primenewsgraph-7466f`) into the Admin Login and Password Management system with strict server-authoritative security, full cryptographic token verification, server-side owner bootstrapping, and zero client-side privilege assignment.

---

## 8 Critical Security Corrections & Architectural Alignment

| # | Security Correction | Architectural Specification |
|---|---|---|
| **1** | **No client-side admin privilege creation** | Completely remove all `setDoc`/`updateDoc` calls from `src/services/firebaseAuth.ts`. The browser frontend will NEVER attempt to write to `/admins/{uid}` or assign roles. It only sends the Firebase ID token to the server. |
| **2** | **Server-side trusted owner bootstrap** | Owner bootstrapping is handled strictly on the server (`server/firebaseAuth.ts` and `api/auth/firebase-verify.ts`). When a validly signed Firebase token for `amazonshopping14264@gmail.com` is received, the server verifies and establishes the `super_admin` record. Only this exact email is authorized. |
| **3** | **Full server-side cryptographic token verification** | The server validates the full JWT token structure: (a) `alg` & signature verified via Google Public Keys, (b) `iss == https://securetoken.google.com/primenewsgraph-7466f`, (c) `aud == primenewsgraph-7466f`, (d) `exp` strictly unexpired, and (e) `email.toLowerCase() == amazonshopping14264@gmail.com`. |
| **4** | **Never rely on API key alone** | Authentication and authorization depend exclusively on the cryptographic JWT claims and server-side email verification. The Firebase API key is solely a public client project identifier, never an authorization token. |
| **5** | **Temporary legacy login with deprecation plan** | Legacy login (`mdalamin11gtN` + 2FA) remains accessible in a secondary fallback tab during migration testing. Once the owner confirms Firebase login works, a single configuration flag (`DISABLE_LEGACY_ADMIN=true`) can completely shut off the legacy path. |
| **6** | **Exact required Vercel environment variables only** | Audit the source code to provide only the exact variables read by the client and serverless functions (no fabricated or unused variables). |
| **7** | **Honest deployment reporting** | We will explicitly distinguish between local dev server verification and remote Firebase/Vercel status. We will not claim remote deployment is complete unless verified by deployment tools. |
| **8** | **Preserve public website & features** | Zero changes to public articles, categories, comments, videos, authors, Adsterra ad slots, or site design. |

---

## Final Security Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│               CLIENT / BROWSER (NO PRIVILEGE ELEVATION)                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    1. User enters Email & Password │ (amazonshopping14264@gmail.com)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Firebase Client SDK (signInWithEmailAndPassword)                      │
│  - Project: primenewsgraph-7466f                                       │
│  - Returns Cryptographic ID Token (JWT)                                │
│  - FRONTEND CANNOT WRITE TO /admins/{uid} (Zero Client Writes)         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    2. Sends ID Token via Bearer    │ POST /api/auth/firebase-verify
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               TRUSTED SERVER BOUNDARY (Server / Vercel API)            │
│  (server/firebaseAuth.ts & api/auth/firebase-verify.ts)                │
│                                                                        │
│  Cryptographic Token Validation:                                       │
│  [✓] Signature & Algorithm Check (Google Public Certificates)          │
│  [✓] Issuer: https://securetoken.google.com/primenewsgraph-7466f       │
│  [✓] Audience: primenewsgraph-7466f                                    │
│  [✓] Expiration: Date.now() < exp                                      │
│  [✓] Identity: email.toLowerCase() === amazonshopping14264@gmail.com   │
│                                                                        │
│  Server-Side Owner Bootstrapping:                                      │
│  [✓] Server verifies / records super_admin role for verified owner     │
│  [✓] Non-owner emails receive immediate 403 Forbidden                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    3. Issues Secure Session        │ Verified Admin Session Token
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Admin CMS Dashboard Access Granted                                    │
│  - Primary Tab: Firebase Cloud Security & Password Management          │
│  - Fallback Tab (Temporary): Legacy Master Credentials (for testing)   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Detailed File Modifications Plan

### 1. `firebase-applet-config.json`
- Update strictly to the authentic Firebase project configuration provided:
  ```json
  {
    "projectId": "primenewsgraph-7466f",
    "appId": "1:800333128646:web:211be3cf9a5938e0d208c7",
    "apiKey": "AIzaSyBfuMrvWqAIs6EorssP0_W2gnZ1dapD66Q",
    "authDomain": "primenewsgraph-7466f.firebaseapp.com",
    "firestoreDatabaseId": "(default)",
    "storageBucket": "primenewsgraph-7466f.firebasestorage.app",
    "messagingSenderId": "800333128646",
    "measurementId": ""
  }
  ```

### 2. `src/services/firebase.ts`
- Initialize Firebase App using `primenewsgraph-7466f`.
- Connect `getFirestore(app)` to `(default)`.

### 3. `src/services/firebaseAuth.ts`
- **Security hardening**: Strip out any client-side Firestore document creation (`setDoc` / `updateDoc` to `/admins/{uid}`).
- Client only calls `signInWithEmailAndPassword`, retrieves the ID token, and invokes `/api/auth/firebase-verify` on the server.
- Handles `changePassword` and `sendPasswordResetEmail` via Firebase Auth.

### 4. `server/firebaseAuth.ts`
- Implement robust cryptographic JWT verification:
  - Validates `iss === 'https://securetoken.google.com/primenewsgraph-7466f'`.
  - Validates `aud === 'primenewsgraph-7466f'`.
  - Validates `exp > Math.floor(Date.now() / 1000)`.
  - Validates `email === 'amazonshopping14264@gmail.com'`.
  - Signature verification via Google Identity Toolkit lookup and Google public certificates.
- Boots and records owner status server-side.

### 5. `server.ts`
- Route `/api/auth/firebase-verify`: executes cryptographic verification and returns a validated administrative session.
- Middleware `requireAdminAuth`: enforces valid session / Firebase token on administrative mutations.

### 6. `api/auth/firebase-verify.ts` & `api/auth/session.ts` (Vercel Serverless Functions)
- Update project ID to `primenewsgraph-7466f`.
- Perform cryptographic verification on Vercel serverless runtime.
- Strictly enforce `amazonshopping14264@gmail.com`.

### 7. `src/pages/AdminDashboard.tsx`
- Ensure all Firebase labels, status badges, and copy reference `primenewsgraph-7466f` and database `(default)`.
- Keep the dual login tab ("🔥 Firebase Auth" primary, "🛡️ Legacy Master" fallback) for migration testing.

### 8. `.env.example`
- Clean up to document ONLY the exact environment variables actively read by the codebase.

### 9. `create_packages.py`
- Rebuild deployment packages (`prime-news-graph-github-vercel.zip` and `prime-news-graph-direct-netlify-drop.zip`).

---

## Exact Vercel Environment Variables Required by Source Code

Audited directly from `src/services/firebase.ts`, `api/auth/firebase-verify.ts`, and `api/auth/session.ts`:

### Client Variables (Required by Vite build):
```env
VITE_FIREBASE_API_KEY=AIzaSyBfuMrvWqAIs6EorssP0_W2gnZ1dapD66Q
VITE_FIREBASE_AUTH_DOMAIN=primenewsgraph-7466f.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=primenewsgraph-7466f
VITE_FIREBASE_STORAGE_BUCKET=primenewsgraph-7466f.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=800333128646
VITE_FIREBASE_APP_ID=1:800333128646:web:211be3cf9a5938e0d208c7
VITE_FIREBASE_DATABASE_ID=(default)
```

### Serverless Variables (Required by `/api/auth/*`):
```env
FIREBASE_PROJECT_ID=primenewsgraph-7466f
FIREBASE_API_KEY=AIzaSyBfuMrvWqAIs6EorssP0_W2gnZ1dapD66Q
```

*(No private keys or unused variables needed on Vercel).*

---

## Legacy Login Deprecation Strategy

1. **Phase 1 (Current Migration)**: Both Firebase Login (primary) and Legacy Master Credentials (fallback) are available so you can test Firebase without risking lockout.
2. **Phase 2 (Deprecation)**: Once you sign in with `amazonshopping14264@gmail.com` via Firebase and confirm full dashboard operation, setting `DISABLE_LEGACY_ADMIN=true` in environment variables or removing the fallback tab permanently disables the legacy master credentials.

---

## Verification & Testing Steps

1. **Compilation & Linting**: Co-execute `compile_applet` and `lint_applet` to guarantee 0 build or TypeScript errors.
2. **Endpoint Validation**: Test `POST http://localhost:3000/api/auth/firebase-verify` via curl with valid and invalid tokens to verify strict 401/403 rejection.
3. **Public Site Verification**: Confirm 100% preservation of all public news articles, categories, views, and Adsterra ad codes.
4. **Package Verification**: Verify that the generated zip files contain the exact new configuration.
