import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession]   = useState(null)
  const [profile, setProfile]   = useState(null)
  const [isBarber, setIsBarber] = useState(false)
  const [barberId, setBarberId] = useState(null)
  const [loading, setLoading]   = useState(true)
  const loadedUserId = useRef(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session)
      if (session) {
        // Usuario distinto al cargado (por ejemplo, recién inició sesión): marcar como
        // cargando hasta tener su perfil, para no decidir su rol con datos vacíos.
        // En renovaciones de token del mismo usuario no se muestra la carga.
        if (loadedUserId.current !== session.user.id) setLoading(true)
        fetchProfile(session.user.id)
      } else {
        loadedUserId.current = null
        setProfile(null)
        setIsBarber(false)
        setBarberId(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)

    const { data: barberData } = await supabase
      .from('barbers')
      .select('id')
      .eq('profile_id', userId)
      .eq('is_active', true)
      .maybeSingle()
    
    setIsBarber(!!barberData)
    setBarberId(barberData?.id || null)
    loadedUserId.current = userId
    setLoading(false)
  }

  const value = {
    session,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    isBarber,
    barberId,
    signOut: () => supabase.auth.signOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
