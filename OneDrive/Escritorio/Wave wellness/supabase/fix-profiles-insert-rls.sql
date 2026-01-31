-- ============================================================================
-- Fix: Allow users to insert their own profile during registration
-- ============================================================================

CREATE POLICY "profiles_insert_own"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Also allow service_role or unauthenticated if needed, but since signUp 
-- returns a session, 'authenticated' should be enough if confirmation is off.
-- If email confirmation is ON, we might need a different approach (trigger).
