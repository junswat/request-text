import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../utils/supabase'

// 許可するメールアドレスのリスト
const ALLOWED_EMAILS = ['tocotoco2674@gmail.com']

type AuthContextType = {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // セッションの確認
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      // メールアドレスの確認
      if (currentUser && !ALLOWED_EMAILS.includes(currentUser.email || '')) {
        // 許可されていないメールアドレスの場合、自動的にサインアウト
        supabase.auth.signOut()
        setUser(null)
      } else {
        setUser(currentUser)
      }
      setLoading(false)
    })

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      // メールアドレスの確認
      if (currentUser && !ALLOWED_EMAILS.includes(currentUser.email || '')) {
        // 許可されていないメールアドレスの場合、自動的にサインアウト
        supabase.auth.signOut()
        setUser(null)
      } else {
        setUser(currentUser)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/request-text/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 