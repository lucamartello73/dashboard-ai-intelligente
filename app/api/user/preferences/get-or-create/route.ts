import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('API: Errore di autenticazione o utente non trovato:', authError?.message)
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Try to get user preferences
    const { data: preferences, error: selectError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 means 'no rows found'
      console.error('API: Errore nel recupero preferenze utente:', selectError)
      return NextResponse.json({ message: 'Error fetching preferences', error: selectError.message }, { status: 500 })
    }

    if (preferences) {
      return NextResponse.json(preferences, { status: 200 })
    } else {
      // If no preferences found, create default ones
      const defaultPreferences = {
        user_id: user.id,
        aiPreferito: { marketing: 'Claude', sviluppo: 'GitHub Copilot', analisi: 'ChatGPT-4', creativo: 'Midjourney', generico: 'ChatGPT-4' },
        budget: { mensile: 50, disponibileNuoviTool: true },
        notifiche: { suggerimenti: true, nuoveFunzionalita: true },
        tema: 'light'
      }

      const { data: newPreferences, error: insertError } = await supabase
        .from('user_preferences')
        .insert([defaultPreferences])
        .select()
        .single()

      if (insertError) {
        console.error('API: Errore nella creazione preferenze di default:', insertError)
        return NextResponse.json({ message: 'Error creating default preferences', error: insertError.message }, { status: 500 })
      }

      return NextResponse.json(newPreferences, { status: 201 })
    }
  } catch (error) {
    console.error('API: Errore generico nel get-or-create preferences:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

