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

// Archive helpers
export const archiveGrant = async (id, reason = 'other') => {
  const { data, error } = await supabase
    .from('grants')
    .update({
      status: 'archived'
    })
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export const restoreGrant = async (id, newStatus = 'draft') => {
  const { data, error } = await supabase
    .from('grants')
    .update({
      status: newStatus
    })
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export const getArchivedGrants = async () => {
  const { data, error } = await supabase
    .from('grants')
    .select('*')
    .eq('status', 'archived')
    .order('updated_at', { ascending: false })
  return { data, error }
}

export const getActiveGrants = async () => {
  const { data, error } = await supabase
    .from('grants')
    .select('*')
    .neq('status', 'archived')
    .order('deadline', { ascending: true })
  return { data, error }
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

// Budget helpers
export const getBudget = async (grantId) => {
  const { data, error } = await supabase
    .from('grants')
    .select('budget')
    .eq('id', grantId)
    .single()
  return { data: data?.budget, error }
}

export const updateBudget = async (grantId, budget) => {
  const { data, error } = await supabase
    .from('grants')
    .update({ budget })
    .eq('id', grantId)
    .select('budget')
    .single()
  return { data: data?.budget, error }
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

// Permissions helpers
export const getGrantPermissions = async (grantId) => {
  const { data, error } = await supabase
    .from('grant_permissions')
    .select('*')
    .eq('grant_id', grantId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const addPermission = async (grantId, { email, domain, role }) => {
  const { data: { user } } = await supabase.auth.getUser()
  const permission = {
    grant_id: grantId,
    role: role || 'viewer',
    created_by: user?.id
  }
  if (email) permission.user_email = email.toLowerCase()
  if (domain) permission.domain = domain.toLowerCase()

  // First try to find existing permission to update
  let query = supabase
    .from('grant_permissions')
    .select('id')
    .eq('grant_id', grantId)

  if (email) {
    query = query.eq('user_email', email.toLowerCase())
  } else if (domain) {
    query = query.eq('domain', domain.toLowerCase())
  }

  const { data: existing } = await query.maybeSingle()

  if (existing) {
    // Update existing permission
    const { data, error } = await supabase
      .from('grant_permissions')
      .update({ role: role || 'viewer' })
      .eq('id', existing.id)
      .select()
      .single()
    return { data, error }
  } else {
    // Insert new permission
    const { data, error } = await supabase
      .from('grant_permissions')
      .insert(permission)
      .select()
      .single()
    return { data, error }
  }
}

export const removePermission = async (permissionId) => {
  const { error } = await supabase
    .from('grant_permissions')
    .delete()
    .eq('id', permissionId)
  return { error }
}

export const updatePermissionRole = async (permissionId, role) => {
  const { data, error } = await supabase
    .from('grant_permissions')
    .update({ role })
    .eq('id', permissionId)
    .select()
    .single()
  return { data, error }
}

// Check if current user has access to a grant
export const checkGrantAccess = async (grantId) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { hasAccess: false, role: null }

  const email = user.email?.toLowerCase()
  const domain = email?.split('@')[1]

  // Check direct ownership first
  const { data: grant } = await supabase
    .from('grants')
    .select('user_id')
    .eq('id', grantId)
    .single()

  if (grant?.user_id === user.id) {
    return { hasAccess: true, role: 'owner' }
  }

  // Check permissions table
  const { data: permissions } = await supabase
    .from('grant_permissions')
    .select('role')
    .eq('grant_id', grantId)
    .or(`user_email.eq.${email},domain.eq.${domain}`)

  if (permissions?.length > 0) {
    // Return highest role (owner > editor > viewer)
    const roleOrder = { owner: 3, editor: 2, viewer: 1 }
    const bestRole = permissions.reduce((best, p) =>
      roleOrder[p.role] > roleOrder[best] ? p.role : best, 'viewer')
    return { hasAccess: true, role: bestRole }
  }

  return { hasAccess: false, role: null }
}
