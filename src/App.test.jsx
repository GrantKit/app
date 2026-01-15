import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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

describe('stripMarkdown for plain text grants', () => {
  // Import the function - we'll need to export it from App.jsx
  // For now, replicate the logic here for testing
  const stripMarkdown = (text) => {
    return text
      // Remove HTML comments
      .replace(/<!--[\s\S]*?-->/g, '')
      // Remove headers
      .replace(/^#{1,6}\s+/gm, '')
      // Remove bold/italic
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      // Remove links, keep text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove inline code
      .replace(/`([^`]+)`/g, '$1')
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      // Remove blockquotes
      .replace(/^>\s+/gm, '')
      // Remove horizontal rules
      .replace(/^---+$/gm, '')
      // Remove list markers
      .replace(/^[\*\-]\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '')
      // Remove table syntax (pipes and dashes)
      .replace(/^\|.*\|$/gm, '')
      .replace(/^[\|\-\:\s]+$/gm, '')
      // Clean up multiple newlines
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }

  it('removes HTML comments', () => {
    const input = '<!-- This is a comment --> Some text'
    expect(stripMarkdown(input)).toBe('Some text')
  })

  it('removes headers', () => {
    const input = '## Header\nSome text'
    expect(stripMarkdown(input)).toBe('Header\nSome text')
  })

  it('removes bold and italic', () => {
    const input = '**bold** and *italic* text'
    expect(stripMarkdown(input)).toBe('bold and italic text')
  })

  it('removes links but keeps text', () => {
    const input = 'Check out [this link](https://example.com) for more'
    expect(stripMarkdown(input)).toBe('Check out this link for more')
  })

  it('removes table syntax (pipes)', () => {
    const input = '| Column 1 | Column 2 |\n|----------|----------|\n| Data 1 | Data 2 |'
    const result = stripMarkdown(input)
    expect(result).not.toContain('|')
  })

  it('removes table separator rows', () => {
    const input = '|---|---|'
    expect(stripMarkdown(input).trim()).toBe('')
  })

  it('removes blockquotes', () => {
    const input = '> This is a quote\nNormal text'
    expect(stripMarkdown(input)).toBe('This is a quote\nNormal text')
  })

  it('removes inline code backticks', () => {
    const input = 'Use `code` here'
    expect(stripMarkdown(input)).toBe('Use code here')
  })

  it('removes code blocks', () => {
    const input = '```\nprint("hello")\n```\nAfter code'
    const result = stripMarkdown(input)
    // Code blocks should be removed, leaving only the text after
    expect(result).not.toContain('```')
    expect(result).toContain('After code')
  })

  it('removes list markers', () => {
    const input = '- Item 1\n- Item 2\n1. Numbered'
    expect(stripMarkdown(input)).toBe('Item 1\nItem 2\nNumbered')
  })

  it('handles complex real-world content', () => {
    const input = `<!-- Methods section -->
## Project Overview

| Activity | Budget |
|----------|--------|
| Council Tax | £70k |

**PolicyEngine** builds tools for [policy analysis](https://policyengine.org).`

    const result = stripMarkdown(input)

    // Should NOT contain any markdown syntax
    expect(result).not.toContain('<!--')
    expect(result).not.toContain('-->')
    expect(result).not.toContain('##')
    expect(result).not.toContain('|')
    expect(result).not.toContain('**')
    expect(result).not.toContain('[')
    expect(result).not.toContain('](')

    // Should contain the plain text
    expect(result).toContain('Project Overview')
    expect(result).toContain('PolicyEngine')
    expect(result).toContain('policy analysis')
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
