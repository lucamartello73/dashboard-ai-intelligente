DO $$
BEGIN
    -- Imposta valori di default per le colonne JSONB se non già impostati
    EXECUTE 
        CASE
            WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_preferences' AND column_name = 'ai_preferito' AND column_default IS NULL) THEN
                'ALTER TABLE public.user_preferences ALTER COLUMN "ai_preferito" SET DEFAULT ''{}''::jsonb;'::text
            ELSE ''
        END;
    EXECUTE 
        CASE
            WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_preferences' AND column_name = 'budget' AND column_default IS NULL) THEN
                'ALTER TABLE public.user_preferences ALTER COLUMN budget SET DEFAULT ''{"mensile": 50, "disponibileNuoviTool": true}''::jsonb;'::text
            ELSE ''
        END;
    EXECUTE 
        CASE
            WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_preferences' AND column_name = 'notifiche' AND column_default IS NULL) THEN
                'ALTER TABLE public.user_preferences ALTER COLUMN notifiche SET DEFAULT ''{"suggerimenti": true, "nuoveFunzionalita": true}''::jsonb;'::text
            ELSE ''
        END;
    EXECUTE 
        CASE
            WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_preferences' AND column_name = 'tema' AND column_default IS NULL) THEN
                'ALTER TABLE public.user_preferences ALTER COLUMN tema SET DEFAULT ''light'';'::text
            ELSE ''
        END;

    -- Aggiungi vincoli CHECK per i tipi JSONB se non esistono
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_user_preferences_aipreferito_object') THEN
        ALTER TABLE public.user_preferences ADD CONSTRAINT chk_user_preferences_aipreferito_object CHECK (jsonb_typeof("ai_preferito") = 'object');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_user_preferences_budget_object') THEN
        ALTER TABLE public.user_preferences ADD CONSTRAINT chk_user_preferences_budget_object CHECK (jsonb_typeof(budget) = 'object');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_user_preferences_notifiche_object') THEN
        ALTER TABLE public.user_preferences ADD CONSTRAINT chk_user_preferences_notifiche_object CHECK (jsonb_typeof(notifiche) = 'object');
    END IF;

    -- Abilita RLS sulla tabella user_preferences
    ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

    -- Rimuovi policy RLS esistenti per user_preferences per evitare duplicati
    DROP POLICY IF EXISTS "Enable select for authenticated users" ON public.user_preferences;
    DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.user_preferences;
    DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.user_preferences;

    -- Crea policy RLS per SELECT
    CREATE POLICY "Enable select for authenticated users" ON public.user_preferences
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

    -- Crea policy RLS per INSERT
    CREATE POLICY "Enable insert for authenticated users" ON public.user_preferences
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

    -- Crea policy RLS per UPDATE
    CREATE POLICY "Enable update for authenticated users" ON public.user_preferences
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    -- Abilita RLS sulla tabella ai_tools
    ALTER TABLE public.ai_tools ENABLE ROW LEVEL SECURITY;

    -- Rimuovi policy RLS esistenti per ai_tools per evitare duplicati
    DROP POLICY IF EXISTS "Enable select for authenticated users" ON public.ai_tools;
    DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.ai_tools;
    DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.ai_tools;

    -- Crea policy RLS per SELECT
    CREATE POLICY "Enable select for authenticated users" ON public.ai_tools
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

    -- Crea policy RLS per INSERT
    CREATE POLICY "Enable insert for authenticated users" ON public.ai_tools
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

    -- Crea policy RLS per UPDATE
    CREATE POLICY "Enable update for authenticated users" ON public.ai_tools
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

END
$$;
