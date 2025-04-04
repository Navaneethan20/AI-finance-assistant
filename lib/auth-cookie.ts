import Cookies from "js-cookie"

// Cookie name for authentication
export const AUTH_COOKIE_NAME = "finsave_auth_token"

// Set authentication cookie
export const setAuthCookie = (token: string, expiresInDays = 7) => {
  Cookies.set(AUTH_COOKIE_NAME, token, {
    expires: expiresInDays,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  })
}

// Get authentication cookie
export const getAuthCookie = () => {
  return Cookies.get(AUTH_COOKIE_NAME)
}

// Remove authentication cookie
export const removeAuthCookie = () => {
  Cookies.remove(AUTH_COOKIE_NAME)
}

