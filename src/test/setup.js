import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
  writable: true,
  configurable: true,
})

// Mock Supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({ data: [], error: null })),
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: null })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({ data: null, error: null })),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({ error: null })),
      })),
    })),
  },
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
  getGrants: vi.fn(() => Promise.resolve({ data: [], error: null })),
  getGrant: vi.fn(() => Promise.resolve({ data: null, error: null })),
  createGrant: vi.fn(() => Promise.resolve({ data: null, error: null })),
  updateGrant: vi.fn(() => Promise.resolve({ data: null, error: null })),
  deleteGrant: vi.fn(() => Promise.resolve({ error: null })),
  getResponses: vi.fn(() => Promise.resolve({ data: [], error: null })),
  updateResponse: vi.fn(() => Promise.resolve({ data: null, error: null })),
  createResponse: vi.fn(() => Promise.resolve({ data: null, error: null })),
}))
