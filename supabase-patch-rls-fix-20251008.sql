DO $$
BEGIN
    -- Rimuovi policy RLS esistenti per user_preferences per evitare duplicati
    DROP POLICY IF EXISTS "Enable select for authenticated users" ON public.user_preferences;
    DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.user_preferences;
    DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.user_preferences;

    -- Crea policy RLS per SELECT (permette all'utente di vedere le proprie preferenze)
    CREATE POLICY "User can view own preferences" ON public.user_preferences
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

    -- Crea policy RLS per INSERT (permette all'utente di creare le proprie preferenze)
    CREATE POLICY "User can create own preferences" ON public.user_preferences
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

    -- Crea policy RLS per UPDATE (permette all'utente di aggiornare le proprie preferenze)
    CREATE POLICY "User can update own preferences" ON public.user_preferences
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    -- Rimuovi policy RLS esistenti per ai_tools per evitare duplicati
    DROP POLICY IF EXISTS "Enable select for authenticated users" ON public.ai_tools;
    DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.ai_tools;
    DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.ai_tools;

    -- Crea policy RLS per SELECT (permette all'utente di vedere i propri strumenti AI)
    CREATE POLICY "User can view own AI tools" ON public.ai_tools
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

    -- Crea policy RLS per INSERT (permette all'utente di creare i propri strumenti AI)
    CREATE POLICY "User can create own AI tools" ON public.ai_tools
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

    -- Crea policy RLS per UPDATE (permette all'utente di aggiornare i propri strumenti AI)
    CREATE POLICY "User can update own AI tools" ON public.ai_tools
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

END
$$;
