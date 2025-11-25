import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Grants helpers
export const getGrants = async () => {
  const { data, error } = await supabase
    .from('grants')
    .select('*')
    .order('deadline', { ascending: true })
  return { data, error }
}

export const getGrant = async (id) => {
  const { data, error } = await supabase
    .from('grants')
    .select('*')
    .eq('id', id)
    .single()
  return { data, error }
}

export const createGrant = async (grant) => {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('grants')
    .insert({ ...grant, user_id: user.id })
    .select()
    .single()
  return { data, error }
}

export const updateGrant = async (id, updates) => {
  const { data, error } = await supabase
    .from('grants')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export const deleteGrant = async (id) => {
  const { error } = await supabase
    .from('grants')
    .delete()
    .eq('id', id)
  return { error }
}

// Responses helpers
export const getResponses = async (grantId) => {
  const { data, error } = await supabase
    .from('responses')
    .select('*')
    .eq('grant_id', grantId)
    .order('key')
  return { data, error }
}

export const updateResponse = async (id, updates) => {
  const { data, error } = await supabase
    .from('responses')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export const createResponse = async (response) => {
  const { data, error } = await supabase
    .from('responses')
    .insert(response)
    .select()
    .single()
  return { data, error }
}
