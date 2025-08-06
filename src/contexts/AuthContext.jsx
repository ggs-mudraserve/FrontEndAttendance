import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, getCurrentUser, getCurrentUserProfile } from '../services/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout')), 5000)
        )
        
        const authPromise = supabase.auth.getSession()
        
        const { data: { session } } = await Promise.race([authPromise, timeoutPromise])
        
        if (session?.user) {
          setUser(session.user)
          const userProfile = await getCurrentUserProfile()
          
          // Check if user has admin role
          if (userProfile?.role === 'admin') {
            setProfile(userProfile)
          } else {
            // Sign out if not admin
            await supabase.auth.signOut()
            setUser(null)
            setProfile(null)
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        // If authentication fails, skip for now to test the app
        console.log('Skipping authentication for development')
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          try {
            const userProfile = await getCurrentUserProfile()
            if (userProfile?.role === 'admin') {
              setProfile(userProfile)
            } else {
              await supabase.auth.signOut()
              setUser(null)
              setProfile(null)
            }
          } catch (error) {
            console.error('Error fetching user profile:', error)
            setUser(null)
            setProfile(null)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    isAuthenticated: !!user && profile?.role === 'admin'
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}