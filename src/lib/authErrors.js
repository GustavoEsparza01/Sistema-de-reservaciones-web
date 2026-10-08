// Mensajes de error de Supabase Auth en español y con qué hacer.
const MESSAGES = [
  [/invalid login credentials/i, 'Correo o contraseña incorrectos. Revisa tus datos o restablece tu contraseña.'],
  [/email not confirmed/i, 'Aún no confirmas tu correo. Abre el enlace que te enviamos al registrarte.'],
  [/user already registered|already been registered/i, 'Ya existe una cuenta con ese correo. Inicia sesión o restablece tu contraseña.'],
  [/password should be at least/i, 'La contraseña es muy corta. Usa al menos 8 caracteres.'],
  [/unable to validate email|invalid email/i, 'Ese correo no es válido.'],
  [/rate limit|too many requests|security purposes/i, 'Hiciste varios intentos seguidos. Espera un minuto y vuelve a intentarlo.'],
  [/new password should be different/i, 'La nueva contraseña debe ser distinta a la anterior.'],
  [/failed to fetch|network/i, 'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.'],
]

export function authErrorMessage(error) {
  const text = error?.message ?? String(error ?? '')
  return MESSAGES.find(([re]) => re.test(text))?.[1] ?? text
}

export const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
