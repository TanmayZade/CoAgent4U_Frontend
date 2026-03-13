# CoAgent4U Authentication API Documentation

## Overview
This document describes the authentication and integration APIs for CoAgent4U. All API routes handle session management via HTTP-only cookies and include proper error handling.

---

## Authentication Endpoints

### 1. Get Session
**Endpoint:** `GET /api/auth/session`

Check current user session and authentication status.

**Headers:**
- Cookies: `coagent_session` (HTTP-only, set by backend)

**Response (200 - Authenticated):**
```json
{
  "authenticated": true,
  "username": "john-agent",
  "email": "john@example.com",
  "pendingRegistration": false,
  "googleCalendarConnected": true
}
```

**Response (401 - Not Authenticated):**
```json
{
  "authenticated": false,
  "pendingRegistration": false
}
```

**Routing Rules (Frontend):**
- If `authenticated: false` → redirect to `/signin`
- If `authenticated: true` AND `pendingRegistration: true` → redirect to `/onboarding`
- If `authenticated: true` AND `pendingRegistration: false` → allow access to `/dashboard`

---

### 2. Slack OAuth Start
**Endpoint:** `GET /auth/slack/start`

Redirect user to Slack OAuth consent screen.

**Implementation Notes:**
- Use Slack OAuth 2.0 with PKCE flow
- Request scopes: `team:read`, `users:read`, `users:read.email`
- Redirect back to: `GET /auth/slack/callback`

**Response:**
- Redirect to Slack OAuth authorization URL

---

### 3. Slack OAuth Callback
**Endpoint:** `GET /auth/slack/callback`

Handle Slack OAuth callback and create session.

**Query Parameters:**
- `code`: Authorization code from Slack
- `state`: PKCE state parameter (for validation)

**Sets:**
- HTTP-only cookie: `coagent_session` (contains secure session token)

**Redirects:**
- If new user → `/onboarding`
- If existing user → `/dashboard`
- If error → `/signin` with error query param

---

### 4. Set Username
**Endpoint:** `POST /api/auth/username`

Set username for authenticated user during onboarding.

**Requires:**
- HTTP-only cookie: `coagent_session`

**Request Body:**
```json
{
  "username": "string"
}
```

**Validation:**
- Pattern: `^[a-zA-Z0-9_-]{3,32}$`
- Must be unique

**Response (200):**
```json
{
  "success": true,
  "username": "john-agent",
  "message": "Username set successfully"
}
```

**Error (400 - Invalid Format):**
```json
{
  "error": "Invalid username format"
}
```

**Error (409 - Already Taken):**
```json
{
  "error": "Username already taken"
}
```

---

### 5. Logout
**Endpoint:** `POST /api/auth/logout`

Sign out user and clear session.

**Requires:**
- HTTP-only cookie: `coagent_session`

**Clears:**
- HTTP-only cookie: `coagent_session`

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Redirects:**
- Frontend redirects to `/signin`

---

## Integration Endpoints

### 1. Google Calendar Authorization
**Endpoint:** `GET /api/integrations/google/authorize`

Redirect user to Google OAuth consent screen for calendar access.

**Implementation Notes:**
- Use Google OAuth 2.0
- Request scopes: `calendar.readonly`, `calendar.events`
- Use refresh tokens for long-term access
- Redirect back to: `GET /api/integrations/google/callback`

**Response:**
- Redirect to Google OAuth authorization URL

---

### 2. Google Calendar Callback
**Endpoint:** `GET /api/integrations/google/callback`

Handle Google OAuth callback and save refresh token.

**Query Parameters:**
- `code`: Authorization code from Google
- `state`: State parameter (for validation)

**Stores (Backend):**
- Encrypted refresh token in database
- User's Google Calendar email
- Connection timestamp

**Response:**
- Redirect back to `/onboarding`

---

### 3. Google Calendar Status
**Endpoint:** `GET /api/integrations/google/status`

Check if Google Calendar is connected and get connection details.

**Requires:**
- HTTP-only cookie: `coagent_session`

**Response (200 - Connected):**
```json
{
  "service": "GOOGLE_CALENDAR",
  "connected": true,
  "email": "user@gmail.com",
  "connectedAt": "2024-03-13T10:30:00Z"
}
```

**Response (200 - Not Connected):**
```json
{
  "service": "GOOGLE_CALENDAR",
  "connected": false
}
```

---

## User Profile Endpoint

### Get User Profile
**Endpoint:** `GET /api/auth/me`

Get authenticated user's profile information.

**Requires:**
- HTTP-only cookie: `coagent_session`

**Response (200):**
```json
{
  "id": "user-uuid",
  "username": "john-agent",
  "email": "john@example.com",
  "slackWorkspaceId": "T12345678",
  "slackUserId": "U12345678",
  "googleCalendarConnected": true,
  "googleCalendarEmail": "john@gmail.com",
  "createdAt": "2024-03-13T10:00:00Z",
  "updatedAt": "2024-03-13T10:30:00Z"
}
```

---

## Error Handling

All endpoints follow consistent error response format:

**Error Response:**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Bad request (invalid input)
- `401`: Unauthorized (not authenticated)
- `409`: Conflict (resource already exists)
- `500`: Internal server error

---

## Security Considerations

1. **HTTP-Only Cookies**: Session tokens stored in HTTP-only cookies (not accessible by JavaScript)
2. **CSRF Protection**: All state-changing endpoints (POST, PUT, DELETE) require CSRF tokens
3. **PKCE Flow**: OAuth flows use PKCE for additional security
4. **Token Refresh**: Refresh tokens encrypted and never exposed to frontend
5. **Rate Limiting**: API endpoints implement rate limiting to prevent abuse
6. **Secure Headers**: All responses include security headers (HSTS, X-Content-Type-Options, etc.)

---

## Implementation Timeline

### Phase 1: Basic Auth (MVP)
- [x] Session endpoint
- [x] Slack OAuth flow
- [x] Username setup
- [ ] Logout endpoint

### Phase 2: Integrations
- [ ] Google Calendar OAuth
- [ ] Google Calendar status endpoint
- [ ] Profile endpoint

### Phase 3: Enhancement
- [ ] Multi-factor authentication
- [ ] API keys for CLI access
- [ ] OAuth scope management
- [ ] Session analytics
