const TOKEN_KEY = 'inventex_refresh_token'

export function getRefreshToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setRefreshToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeRefreshToken() {
  localStorage.removeItem(TOKEN_KEY)
}
