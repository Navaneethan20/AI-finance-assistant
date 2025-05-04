import Cookies from "js-cookie"

// Cookie name for authentication
export const AUTH_COOKIE_NAME = "finsave_auth_token"

// Set authentication cookie
export const setAuthCookie = (token: string, expiresInDays = 7) => {
  // Set the cookie with secure and SameSite attributes
  Cookies.set(AUTH_COOKIE_NAME, token, {
    expires: expiresInDays,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/", // Ensure the cookie is available across the entire site
  })

  // Also set a cookie that will be sent to the server
  // This is needed for server actions
  document.cookie = `${AUTH_COOKIE_NAME}=${token}; path=/; max-age=${expiresInDays * 24 * 60 * 60}; ${
    process.env.NODE_ENV === "production" ? "secure; " : ""
  }samesite=strict;`
}

// Get authentication cookie
export const getAuthCookie = () => {
  return Cookies.get(AUTH_COOKIE_NAME)
}

// Remove authentication cookie
export const removeAuthCookie = () => {
  Cookies.remove(AUTH_COOKIE_NAME, { path: "/" })

  // Also remove the server cookie
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`
}
