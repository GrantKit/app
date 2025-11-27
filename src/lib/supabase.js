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
  // Always redirect to app subdomain after OAuth
  const redirectUrl = window.location.hostname === 'localhost'
    ? window.location.origin
    : 'https://app.grantkit.io'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
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

// Public sharing helpers
export const getGrantByShareToken = async (shareToken) => {
  const { data, error } = await supabase
    .from('grants')
    .select('*')
    .eq('share_token', shareToken)
    .single()
  return { data, error }
}

export const generateShareToken = async (grantId) => {
  // Generate a random 32-char hex token
  const token = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  const { data, error } = await supabase
    .from('grants')
    .update({ share_token: token })
    .eq('id', grantId)
    .select()
    .single()
  return { data, error, token }
}

export const revokeShareToken = async (grantId) => {
  const { data, error } = await supabase
    .from('grants')
    .update({ share_token: null })
    .eq('id', grantId)
    .select()
    .single()
  return { data, error }
}

// Internal documents helpers (letters, emails, budget - NOT shared publicly)
export const getInternalDocuments = async (grantId) => {
  const { data, error } = await supabase
    .from('internal_documents')
    .select('*')
    .eq('grant_id', grantId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const getInternalDocument = async (id) => {
  const { data, error } = await supabase
    .from('internal_documents')
    .select('*')
    .eq('id', id)
    .single()
  return { data, error }
}

export const createInternalDocument = async (doc) => {
  const { data, error } = await supabase
    .from('internal_documents')
    .insert(doc)
    .select()
    .single()
  return { data, error }
}

export const updateInternalDocument = async (id, updates) => {
  const { data, error } = await supabase
    .from('internal_documents')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export const deleteInternalDocument = async (id) => {
  const { error } = await supabase
    .from('internal_documents')
    .delete()
    .eq('id', id)
  return { error }
}

// Device auth helpers for CLI OAuth flow
export const getDeviceCode = async (code) => {
  const { data, error } = await supabase
    .from('device_codes')
    .select('*')
    .eq('code', code)
    .single()
  return { data, error }
}

export const createDeviceCode = async (code) => {
  const { data, error } = await supabase
    .from('device_codes')
    .insert({ code, status: 'pending' })
    .select()
    .single()
  return { data, error }
}

export const completeDeviceAuth = async (code, session) => {
  const { data, error } = await supabase
    .from('device_codes')
    .update({
      user_id: session.user.id,
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
      user_email: session.user.email,
      status: 'complete',
      completed_at: new Date().toISOString(),
    })
    .eq('code', code)
    .eq('status', 'pending')
    .select()
    .single()
  return { data, error }
}
