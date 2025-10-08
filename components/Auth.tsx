'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import type { User } from '@supabase/supabase-js'

interface AuthProps {
  onAuthStateChange: (user: User | null) => void
}

export default function Auth({ onAuthStateChange }: AuthProps) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Controlla lo stato di autenticazione iniziale
    supabase.auth.getSession().then(({ data: { session } }) => {
      onAuthStateChange(session?.user ?? null)
    })

    // Ascolta i cambiamenti di autenticazione
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      onAuthStateChange(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [onAuthStateChange])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        toast({
          title: "Registrazione completata",
          description: "Controlla la tua email per confermare l'account.",
        })
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        toast({
          title: "Login effettuato",
          description: "Benvenuto nel Dashboard AI Intelligente!",
        })
      }
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'autenticazione.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast({
        title: "Errore",
        description: "Errore durante il logout.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Logout effettuato",
        description: "Arrivederci!",
      })
    }
  }

  const signInWithDemo = async () => {
    setLoading(true)
    try {
      // Crea un utente demo temporaneo
      const demoEmail = `demo-${Date.now()}@example.com`
      const demoPassword = 'demo123456'
      
      const { error } = await supabase.auth.signUp({
        email: demoEmail,
        password: demoPassword,
      })
      
      if (error) throw error
      
      // Effettua subito il login
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      })
      
      if (signInError) throw signInError
      
      toast({
        title: "Demo attivata",
        description: "Stai usando un account demo temporaneo.",
      })
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Errore durante la creazione dell'account demo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Dashboard AI Intelligente</CardTitle>
          <CardDescription>
            {isSignUp ? 'Crea un nuovo account' : 'Accedi al tuo account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="inserisci@email.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password (min. 6 caratteri)"
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Caricamento...' : (isSignUp ? 'Registrati' : 'Accedi')}
            </Button>
          </form>
          
          <div className="mt-4 space-y-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati'}
            </Button>
            
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={signInWithDemo}
              disabled={loading}
            >
              Prova con Account Demo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
