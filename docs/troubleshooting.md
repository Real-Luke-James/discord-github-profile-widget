# Troubleshooting Guide

This guide covers common issues and errors you might encounter while setting up or running the Discord GitHub Profile Widget, along with steps to resolve them.

---

### `APPLICATION_IDENTITY_PROVIDER_USER_ID_MISMATCH`

If you receive an error like:

```text
Sync failed: Discord API returned status 400: {"message": "Invalid Form Body", "code": 50035, "errors": {"provider_issued_user_id": {"_errors": [{"code": "APPLICATION_IDENTITY_PROVIDER_USER_ID_MISMATCH", "message": "Provider user ID *** does not match existing identity record"}]}}}
```

This is **not an issue with this project**. It means your Discord account already has an existing application identity, so Discord won't create a new one until the old identity is removed.

#### Fix Steps:

1. Go to **Discord Settings → Authorized Apps** and **Deauthorize** the application.
2. Open the [Discord Developer Portal](https://discord.com/developers/applications) and select your application.
3. Open the **OAuth2** page.
4. Under **Redirects**, make sure `https://discord.com` is added as a Redirect URI.
5. In the **OAuth2 URL Generator** section:
   - Select the `openid` and `sdk.social_layer` scopes.
   - Select the `https://discord.com` Redirect URI.
   - Copy the generated URL.
6. Modify the copied URL to change `response_type=code` to `response_type=token`. Example:
   - **Original URL:**
     ```
     https://discord.com/oauth2/authorize?client_id=123456789012345678&response_type=code&redirect_uri=https%3A%2F%2Fdiscord.com&scope=openid+sdk.social_layer
     ```
   - **Modified URL:**
     ```
     https://discord.com/oauth2/authorize?client_id=123456789012345678&response_type=token&redirect_uri=https%3A%2F%2Fdiscord.com&scope=openid+sdk.social_layer
     ```
7. Paste and open the modified URL in your web browser, then authorize the application again.

Deauthorizing the application removes the existing identity. Authorizing it again creates a new one.

---
