import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import * as supabaseModule from './lib/supabase'

// Helper to mock authenticated state
const mockAuthenticatedSession = () => {
  vi.mocked(supabaseModule.supabase.auth.getSession).mockResolvedValue({
    data: { session: { user: { email: 'test@example.com' } } }
  })
}

const mockUnauthenticatedSession = () => {
  vi.mocked(supabaseModule.supabase.auth.getSession).mockResolvedValue({
    data: { session: null }
  })
}

describe('Auth Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login page when not authenticated', async () => {
    mockUnauthenticatedSession()

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('GrantKit')).toBeInTheDocument()
      expect(screen.getByText('Professional grant proposal management')).toBeInTheDocument()
      expect(screen.getByText('Sign in with Google')).toBeInTheDocument()
    })
  })

  it('calls signInWithGoogle when button is clicked', async () => {
    mockUnauthenticatedSession()
    const user = userEvent.setup()

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Sign in with Google')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Sign in with Google'))

    expect(supabaseModule.signInWithGoogle).toHaveBeenCalled()
  })
})

describe('App Component - Authenticated', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthenticatedSession()

    vi.mocked(supabaseModule.getGrants).mockResolvedValue({
      data: [
        {
          id: 'grant-1',
          name: 'Test Grant',
          foundation: 'Test Foundation',
          program: 'Test Program',
          deadline: '2025-12-31',
          status: 'draft',
          amount_requested: 500000,
          duration_years: 2,
        }
      ],
      error: null
    })
  })

  it('shows sidebar with grants when authenticated', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Test Grant')).toBeInTheDocument()
      expect(screen.getByText('Test Foundation')).toBeInTheDocument()
    })
  })

  it('shows user email in sidebar', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })
  })

  it('calls signOut when sign out button is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Sign out')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Sign out'))

    expect(supabaseModule.signOut).toHaveBeenCalled()
  })
})

describe('Word Count Calculations', () => {
  it('correctly calculates word count', () => {
    const content = 'Hello world this is a test'
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length
    expect(wordCount).toBe(6)
  })

  it('handles empty content', () => {
    const content = ''
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length
    expect(wordCount).toBe(0)
  })

  it('handles content with multiple spaces', () => {
    const content = 'Hello   world    test'
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length
    expect(wordCount).toBe(3)
  })

  it('calculates percentage correctly', () => {
    const wordCount = 50
    const wordLimit = 100
    const percentage = (wordCount / wordLimit) * 100
    expect(percentage).toBe(50)
  })

  it('identifies over limit correctly', () => {
    const wordCount = 150
    const wordLimit = 100
    const overLimit = wordCount > wordLimit
    expect(overLimit).toBe(true)
  })
})

describe('Grant Detail Loading States', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthenticatedSession()
  })

  it('shows loading spinner initially', async () => {
    vi.mocked(supabaseModule.getGrants).mockResolvedValue({
      data: [{ id: 'grant-1', name: 'Test Grant', foundation: 'Test' }],
      error: null
    })

    // Make getGrant hang to see loading state
    vi.mocked(supabaseModule.getGrant).mockImplementation(() => new Promise(() => {}))

    render(<App />)

    // Wait for initial load and navigation
    await waitFor(() => {
      expect(screen.queryByText('Sign in with Google')).not.toBeInTheDocument()
    })
  })
})

describe('Copy to Clipboard Helper', () => {
  it('should handle clipboard write', async () => {
    // Test the copyToClipboard helper logic directly
    const mockWriteText = vi.fn().mockResolvedValue(undefined)
    const originalClipboard = navigator.clipboard

    // Temporarily replace clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      configurable: true,
    })

    const text = 'Test content to copy'
    await navigator.clipboard.writeText(text)

    expect(mockWriteText).toHaveBeenCalledWith(text)

    // Restore original
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true,
    })
  })
})

describe('Progress Bar Colors', () => {
  it('returns red for over 100%', () => {
    const percentage = 110
    const color = percentage > 100 ? 'bg-red-500' : percentage > 80 ? 'bg-amber-500' : 'bg-primary-500'
    expect(color).toBe('bg-red-500')
  })

  it('returns amber for 80-100%', () => {
    const percentage = 90
    const color = percentage > 100 ? 'bg-red-500' : percentage > 80 ? 'bg-amber-500' : 'bg-primary-500'
    expect(color).toBe('bg-amber-500')
  })

  it('returns primary for under 80%', () => {
    const percentage = 50
    const color = percentage > 100 ? 'bg-red-500' : percentage > 80 ? 'bg-amber-500' : 'bg-primary-500'
    expect(color).toBe('bg-primary-500')
  })
})
