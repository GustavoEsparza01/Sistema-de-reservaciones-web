// Este archivo redirige a /login (la página única maneja ambos tabs)
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const navigate = useNavigate()
  useEffect(() => navigate('/login', { replace: true }), [])
  return null
}
