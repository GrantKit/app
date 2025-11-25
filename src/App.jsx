import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink, useParams, Navigate } from 'react-router-dom'
import { FileText, ExternalLink, AlertTriangle, CheckCircle, Circle, Copy, LogOut, User, Terminal, Globe, ShieldCheck, X, Check, Minus, Download, Edit3, Shield, Upload, ArrowRight } from 'lucide-react'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'
import { supabase, signInWithGoogle, signOut, getGrants, getGrant, getResponses, updateResponse } from './lib/supabase'

// Utility for class merging
function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Copy to clipboard helper
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}

// Landing page component
function LandingPage() {
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    await signInWithGoogle()
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary-50 to-white">
      {/* Header */}
      <header className="border-b border-secondary-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-icon.jpeg" alt="GrantKit" className="h-10 w-auto" />
            <span className="text-xl font-bold text-secondary-900">GrantKit</span>
          </div>
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <p className="text-sm font-semibold text-primary-600 mb-4 tracking-wide uppercase">For AI-native teams</p>
        <h1 className="text-5xl font-bold text-secondary-900 mb-6 tracking-tight">
          You use AI agents for code.<br />
          <span className="text-primary-600">Now use them for grants.</span>
        </h1>
        <p className="text-xl text-secondary-600 mb-10 max-w-2xl mx-auto">
          GrantKit syncs your proposals to local markdown files so Claude Code, Cursor, and other AI tools can help you write them. NSF validation built in.
        </p>
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="inline-flex items-center gap-3 px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? 'Signing in...' : 'Get started with Google'}
        </button>
        <p className="mt-4 text-sm text-secondary-500">
          Open source · Currently in beta
        </p>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-secondary-200 shadow-sm">
            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-secondary-900 mb-2">Track Applications</h3>
            <p className="text-secondary-600">
              Keep all your grant applications in one place. See deadlines, status, and requested amounts at a glance.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-secondary-200 shadow-sm">
            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-secondary-900 mb-2">Manage Responses</h3>
            <p className="text-secondary-600">
              Edit and track progress on each response. Word counts, character limits, and completion status built in.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-secondary-200 shadow-sm">
            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-4">
              <User className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-secondary-900 mb-2">Team Collaboration</h3>
            <p className="text-secondary-600">
              Everyone on your team can access and edit grants. No more version conflicts or email chains.
            </p>
          </div>
        </div>
      </section>

      {/* Why GrantKit */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-secondary-900 mb-4 text-center">Why not just use Grantable?</h2>
        <p className="text-secondary-600 text-center mb-12 max-w-2xl mx-auto">
          Other grant tools have their own AI built in. But you already have Claude Code. GrantKit gets out of the way and lets your tools do the writing.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gradient-to-br from-primary-50 to-white p-8 rounded-2xl border border-primary-100">
            <div className="w-12 h-12 bg-primary-600 text-white rounded-xl flex items-center justify-center mb-4">
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-secondary-900 mb-2">Open Source + CLI</h3>
            <p className="text-secondary-600">
              Your proposals live in Git. Use Claude Code, Cursor, or any AI tool to craft responses locally. Full control over your data.
            </p>
          </div>
          <div className="bg-gradient-to-br from-primary-50 to-white p-8 rounded-2xl border border-primary-100">
            <div className="w-12 h-12 bg-primary-600 text-white rounded-xl flex items-center justify-center mb-4">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-secondary-900 mb-2">Web + Local Hybrid</h3>
            <p className="text-secondary-600">
              Edit in the web app for quick updates. Use your local editor for deep work. Changes sync automatically via Git.
            </p>
          </div>
          <div className="bg-gradient-to-br from-primary-50 to-white p-8 rounded-2xl border border-primary-100">
            <div className="w-12 h-12 bg-primary-600 text-white rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-secondary-900 mb-2">Automated Validators</h3>
            <p className="text-secondary-600">
              NSF compliance checking built-in. Validate page limits, formatting rules, and required sections before submission.
            </p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl border border-secondary-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-200 bg-secondary-50">
                  <th className="text-left p-4 font-semibold text-secondary-900">Feature</th>
                  <th className="text-center p-4 font-semibold text-primary-700 bg-primary-50">GrantKit</th>
                  <th className="text-center p-4 font-semibold text-secondary-600">Instrumentl</th>
                  <th className="text-center p-4 font-semibold text-secondary-600">Grantable</th>
                  <th className="text-center p-4 font-semibold text-secondary-600">Google Docs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                <tr>
                  <td className="p-4 text-secondary-700">Open source</td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-secondary-300 mx-auto" /></td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-secondary-300 mx-auto" /></td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-secondary-300 mx-auto" /></td>
                </tr>
                <tr className="bg-secondary-50/50">
                  <td className="p-4 text-secondary-700">Local CLI + AI tools</td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-secondary-300 mx-auto" /></td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-secondary-300 mx-auto" /></td>
                  <td className="p-4 text-center"><Minus className="w-5 h-5 text-secondary-300 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 text-secondary-700">NSF compliance validation</td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-secondary-300 mx-auto" /></td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-secondary-300 mx-auto" /></td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-secondary-300 mx-auto" /></td>
                </tr>
                <tr className="bg-secondary-50/50">
                  <td className="p-4 text-secondary-700">Web collaboration</td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 text-secondary-700">Built-in AI writing</td>
                  <td className="p-4 text-center"><Minus className="w-5 h-5 text-secondary-300 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-secondary-300 mx-auto" /></td>
                </tr>
                <tr className="bg-secondary-50/50">
                  <td className="p-4 text-secondary-700">Price</td>
                  <td className="p-4 text-center font-semibold text-green-700">Free</td>
                  <td className="p-4 text-center text-secondary-600">$179-299/mo</td>
                  <td className="p-4 text-center text-secondary-600">$49-199/mo</td>
                  <td className="p-4 text-center text-secondary-600">Free</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-center text-sm text-secondary-500 mt-4">
          Pricing from public sites. GrantKit lets you use your own AI tools (Claude Code, Cursor, etc.) locally.
        </p>
      </section>

      {/* Workflow */}
      <section className="bg-secondary-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-secondary-900 mb-4 text-center">How it works</h2>
          <p className="text-secondary-600 text-center mb-12 max-w-2xl mx-auto">
            GrantKit syncs between local files and the cloud. Use AI tools locally, collaborate in the browser.
          </p>

          {/* Workflow Steps */}
          <div className="grid md:grid-cols-4 gap-4 mb-12">
            <div className="bg-white p-6 rounded-2xl border border-secondary-200 shadow-sm text-center">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2">Step 1</div>
              <h3 className="font-bold text-secondary-900 mb-2">Pull</h3>
              <p className="text-sm text-secondary-600">Download grants to local markdown files</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-secondary-200 shadow-sm text-center">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit3 className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2">Step 2</div>
              <h3 className="font-bold text-secondary-900 mb-2">Edit</h3>
              <p className="text-sm text-secondary-600">Use Claude Code, Cursor, or any AI tool</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-secondary-200 shadow-sm text-center">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2">Step 3</div>
              <h3 className="font-bold text-secondary-900 mb-2">Validate</h3>
              <p className="text-sm text-secondary-600">Check NSF compliance automatically</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-secondary-200 shadow-sm text-center">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2">Step 4</div>
              <h3 className="font-bold text-secondary-900 mb-2">Push</h3>
              <p className="text-sm text-secondary-600">Sync changes back to the cloud</p>
            </div>
          </div>

          {/* Code Examples */}
          <div className="bg-secondary-900 rounded-2xl p-8 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="ml-4 text-secondary-400 text-sm font-mono">Terminal</span>
            </div>
            <div className="font-mono text-sm space-y-4">
              <div>
                <span className="text-secondary-500"># Install GrantKit CLI</span>
                <div className="text-green-400">$ pip install grantkit</div>
              </div>
              <div>
                <span className="text-secondary-500"># Pull grants from the cloud</span>
                <div className="text-green-400">$ grantkit sync pull</div>
                <div className="text-secondary-400 ml-2">✅ Pulled 10 grants, 94 responses</div>
              </div>
              <div>
                <span className="text-secondary-500"># Edit with your favorite AI tool</span>
                <div className="text-green-400">$ claude "improve the broader impacts section"</div>
              </div>
              <div>
                <span className="text-secondary-500"># Validate NSF compliance</span>
                <div className="text-green-400">$ grantkit validate</div>
                <div className="text-secondary-400 ml-2">✅ All checks passed</div>
              </div>
              <div>
                <span className="text-secondary-500"># Push changes back</span>
                <div className="text-green-400">$ grantkit sync push</div>
                <div className="text-secondary-400 ml-2">✅ Synced 3 responses to cloud</div>
              </div>
              <div>
                <span className="text-secondary-500"># Or watch for changes and auto-sync</span>
                <div className="text-green-400">$ grantkit sync watch</div>
                <div className="text-secondary-400 ml-2">👀 Watching for changes...</div>
              </div>
            </div>
          </div>

          {/* File Structure */}
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-secondary-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-600" />
                Local File Structure
              </h3>
              <div className="bg-white rounded-xl border border-secondary-200 p-6 font-mono text-sm">
                <div className="text-secondary-600">
                  <div>my-grants/</div>
                  <div className="ml-4">├── nsf-cssi/</div>
                  <div className="ml-8">├── grant.yaml</div>
                  <div className="ml-8">└── responses/</div>
                  <div className="ml-12">├── abstract.md</div>
                  <div className="ml-12">├── broader_impacts.md</div>
                  <div className="ml-12">└── technical_approach.md</div>
                  <div className="ml-4">├── arnold-labor/</div>
                  <div className="ml-4">└── ...</div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-secondary-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-600" />
                Response Format (Markdown + YAML)
              </h3>
              <div className="bg-white rounded-xl border border-secondary-200 p-6 font-mono text-sm">
                <div className="text-secondary-500">---</div>
                <div><span className="text-primary-600">title:</span> <span className="text-secondary-700">Broader Impacts</span></div>
                <div><span className="text-primary-600">key:</span> <span className="text-secondary-700">broader_impacts</span></div>
                <div><span className="text-primary-600">word_limit:</span> <span className="text-secondary-700">2500</span></div>
                <div><span className="text-primary-600">status:</span> <span className="text-secondary-700">draft</span></div>
                <div className="text-secondary-500">---</div>
                <div className="mt-2 text-secondary-700"># Broader Impacts</div>
                <div className="text-secondary-600 mt-1">PolicyEngine democratizes...</div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <a
              href="https://github.com/GrantKit/grantkit"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary-900 text-white rounded-xl font-semibold hover:bg-secondary-800 transition-colors"
            >
              <Terminal className="w-5 h-5" />
              View CLI on GitHub
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-secondary-900 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">$4.9M</div>
              <div className="text-secondary-400">Total Requested</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">10</div>
              <div className="text-secondary-400">Active Grants</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">94</div>
              <div className="text-secondary-400">Response Sections</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">8</div>
              <div className="text-secondary-400">Foundations</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-secondary-900 mb-4">Let your AI agent write your next grant</h2>
        <p className="text-secondary-600 mb-8">Sign in to try GrantKit. Currently in beta for PolicyEngine team.</p>
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="inline-flex items-center gap-3 px-6 py-3 bg-white border-2 border-secondary-200 text-secondary-700 rounded-xl font-semibold hover:bg-secondary-50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-secondary-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-secondary-500">
          <div className="flex items-center gap-2">
            <img src="/logo-icon.jpeg" alt="GrantKit" className="h-8 w-auto" />
            <span className="font-semibold text-secondary-700">GrantKit</span>
          </div>
          <div>
            <a href="https://github.com/GrantKit" className="hover:text-secondary-700 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Response card component
function ResponseCard({ response, onUpdate }) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(response.content || '')

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length
  const charCount = content.length
  const wordPercentage = response.word_limit ? (wordCount / response.word_limit) * 100 : 0
  const charPercentage = response.char_limit ? (charCount / response.char_limit) * 100 : 0
  const overLimit = (response.word_limit && wordCount > response.word_limit) ||
                   (response.char_limit && charCount > response.char_limit)

  const handleCopy = async (e) => {
    e.stopPropagation()
    const success = await copyToClipboard(content)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSave = async () => {
    await onUpdate(response.id, { content, status: overLimit ? 'over_limit' : wordCount > 0 ? 'draft' : 'empty' })
    setEditing(false)
  }

  const limitText = response.word_limit
    ? `${wordCount.toLocaleString()} / ${response.word_limit.toLocaleString()} words`
    : response.char_limit
      ? `${charCount.toLocaleString()} / ${response.char_limit.toLocaleString()} chars`
      : `${wordCount.toLocaleString()} words`

  const percentage = response.word_limit ? wordPercentage : response.char_limit ? charPercentage : 0
  const progressBarColor = percentage > 100 ? 'bg-red-500' : percentage > 80 ? 'bg-amber-500' : 'bg-primary-500'

  return (
    <>
      <div
        className={cn(
          "border rounded-xl p-5 hover:shadow-lg transition-all duration-200 cursor-pointer bg-white relative group border-secondary-200",
          overLimit && "border-l-4 border-l-red-500",
          !overLimit && wordCount === 0 && "border-l-4 border-l-amber-500",
          !overLimit && wordCount > 0 && "border-l-4 border-l-primary-500"
        )}
        onClick={() => setExpanded(true)}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-secondary-900 pr-8 leading-tight">{response.title}</h3>
          <button
            onClick={handleCopy}
            className={cn(
              "absolute top-4 right-4 p-2 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100",
              copied ? "bg-primary-100 text-primary-700" : "bg-secondary-100 text-secondary-600 hover:bg-secondary-200"
            )}
            title="Copy to clipboard"
          >
            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
          </button>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs font-medium text-secondary-500 mb-1.5">
            <span>{limitText}</span>
            {percentage > 0 && <span>{percentage.toFixed(1)}%</span>}
          </div>
          {percentage > 0 && (
            <div className="h-1.5 w-full bg-secondary-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${progressBarColor} transition-all duration-500 rounded-full`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          )}
        </div>

        <div className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
          overLimit ? 'text-red-700 bg-red-50 border-red-200' :
          wordCount === 0 ? 'text-amber-700 bg-amber-50 border-amber-200' :
          'text-primary-700 bg-primary-50 border-primary-200'
        )}>
          {overLimit ? <AlertTriangle size={14} /> : wordCount === 0 ? <Circle size={14} /> : <CheckCircle size={14} />}
          <span className="capitalize">{overLimit ? 'Over Limit' : wordCount === 0 ? 'Empty' : 'Draft'}</span>
        </div>
      </div>

      {/* Modal */}
      {expanded && (
        <div className="fixed inset-0 bg-secondary-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setExpanded(false); setEditing(false) }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-secondary-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-secondary-900">{response.title}</h2>
              <div className="flex gap-2">
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                  >
                    Edit
                  </button>
                )}
                <button onClick={() => { setExpanded(false); setEditing(false) }} className="text-secondary-400 hover:text-secondary-600 p-2 rounded-full hover:bg-secondary-50 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar bg-secondary-50/50 flex-1">
              {response.question && (
                <div className="bg-primary-50 border-l-4 border-primary-500 p-5 mb-6 rounded-r-lg shadow-sm">
                  <h4 className="font-bold text-primary-800 mb-2 uppercase text-xs tracking-wider">Question</h4>
                  <p className="text-primary-900 leading-relaxed">{response.question}</p>
                </div>
              )}

              <div className="flex items-center gap-4 mb-6 bg-white p-4 rounded-xl border border-secondary-200 shadow-sm">
                <div className="flex-1">
                  <div className="flex justify-between text-sm font-medium text-secondary-600 mb-2">
                    <span>{limitText}</span>
                    <span>{percentage.toFixed(1)}%</span>
                  </div>
                  {percentage > 0 && (
                    <div className="h-2 w-full bg-secondary-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${progressBarColor} rounded-full`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={handleCopy}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm active:scale-95",
                    copied ? "bg-green-600 text-white" : "bg-primary-600 text-white hover:bg-primary-700"
                  )}
                >
                  {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {editing ? (
                <div className="space-y-4">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-96 p-4 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none font-sans text-base"
                    placeholder="Enter your response..."
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => { setContent(response.content || ''); setEditing(false) }}
                      className="px-4 py-2 border border-secondary-300 text-secondary-700 rounded-lg font-medium hover:bg-secondary-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-slate max-w-none bg-white p-8 rounded-xl border border-secondary-200 shadow-sm">
                  <div className="whitespace-pre-wrap font-sans text-base text-secondary-800 leading-relaxed">
                    {content || <span className="text-secondary-400 italic">No content yet. Click Edit to add your response.</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Grant detail view
function GrantDetail() {
  const { grantId } = useParams()
  const [grant, setGrant] = useState(null)
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadGrant() {
      setLoading(true)
      const { data: grantData } = await getGrant(grantId)
      const { data: responsesData } = await getResponses(grantId)
      setGrant(grantData)
      setResponses(responsesData || [])
      setLoading(false)
    }
    loadGrant()
  }, [grantId])

  const handleResponseUpdate = async (responseId, updates) => {
    await updateResponse(responseId, updates)
    const { data } = await getResponses(grantId)
    setResponses(data || [])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }

  if (!grant) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-secondary-400">
        <AlertTriangle size={48} className="mb-4 opacity-20" />
        <p className="text-lg font-medium">Grant not found</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in pb-20">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-secondary-200 p-8 mb-8">
        <div className="flex flex-col lg:flex-row justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 mb-3 tracking-tight">{grant.name}</h1>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-semibold border border-primary-100">
                {grant.foundation}
              </span>
              {grant.program && (
                <>
                  <span className="text-secondary-300">•</span>
                  <span className="text-secondary-600 font-medium">{grant.program}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-3 self-start">
            {grant.solicitation_url && (
              <a
                href={grant.solicitation_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-all font-medium text-sm"
              >
                <FileText size={16} /> Solicitation
              </a>
            )}
            {grant.repo_url && (
              <a
                href={grant.repo_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-900 text-white rounded-lg hover:bg-secondary-800 transition-all font-medium text-sm"
              >
                <ExternalLink size={16} /> Repository
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-6 border-t border-secondary-100">
          <div>
            <div className="text-xs font-bold text-secondary-400 uppercase tracking-wider mb-1">Requested</div>
            <div className="text-xl font-bold text-secondary-900">${grant.amount_requested?.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs font-bold text-secondary-400 uppercase tracking-wider mb-1">Duration</div>
            <div className="text-xl font-bold text-secondary-900">{grant.duration_years} years</div>
          </div>
          <div>
            <div className="text-xs font-bold text-secondary-400 uppercase tracking-wider mb-1">Deadline</div>
            <div className="text-xl font-bold text-secondary-900">{grant.deadline}</div>
          </div>
          <div>
            <div className="text-xs font-bold text-secondary-400 uppercase tracking-wider mb-1">Status</div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                grant.status === 'submitted' || grant.status === 'completed' ? 'bg-green-500' :
                grant.status === 'active' ? 'bg-purple-500' :
                grant.status === 'draft' ? 'bg-secondary-400' :
                'bg-amber-500'
              }`}></span>
              <span className="text-xl font-bold text-secondary-900 capitalize">{grant.status?.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Responses */}
      {responses.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-bold text-secondary-800 mb-6 flex items-center gap-2">
            <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
              <FileText size={20} />
            </div>
            Application Responses
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {responses.map((response) => (
              <ResponseCard key={response.id} response={response} onUpdate={handleResponseUpdate} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Main App
function App() {
  const [session, setSession] = useState(null)
  const [grants, setGrants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) {
      loadGrants()
    }
  }, [session])

  const loadGrants = async () => {
    const { data } = await getGrants()
    setGrants(data || [])
  }

  const handleSignOut = async () => {
    await signOut()
    setGrants([])
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }

  if (!session) {
    return <LandingPage />
  }

  const defaultGrant = grants.length > 0 ? grants[0].id : null

  return (
    <Router>
      <div className="min-h-screen bg-secondary-50 font-sans text-secondary-900 flex">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r border-secondary-200 h-screen fixed overflow-y-auto hidden md:flex flex-col z-20 shadow-sm">
          <div className="p-6 border-b border-secondary-100 sticky top-0 bg-white/95 backdrop-blur z-10">
            <div className="flex items-center gap-3 mb-1">
              <img src="/logo-icon.jpeg" alt="GrantKit" className="h-10 w-auto" />
              <span className="text-xl font-bold text-secondary-900">GrantKit</span>
            </div>
            <p className="text-xs text-secondary-500 font-semibold tracking-wider uppercase ml-1">Grant Applications</p>
          </div>

          <nav className="p-4 space-y-1 flex-1">
            {grants.map((grant) => (
              <NavLink
                key={grant.id}
                to={`/${grant.id}`}
                className={({ isActive }) =>
                  cn(
                    "block px-4 py-3 rounded-xl text-sm transition-all duration-200 group border border-transparent",
                    isActive
                      ? "bg-primary-50 text-primary-800 font-semibold shadow-sm border-primary-100"
                      : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
                  )
                }
              >
                <div className="truncate leading-tight">{grant.name}</div>
                <div className="text-xs mt-1 truncate text-secondary-400 group-hover:text-secondary-500">
                  {grant.foundation}
                </div>
              </NavLink>
            ))}

            {grants.length === 0 && (
              <div className="text-center py-8 text-secondary-400">
                <p className="text-sm">No grants yet</p>
              </div>
            )}
          </nav>

          <div className="p-4 border-t border-secondary-100 bg-secondary-50/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-secondary-200 rounded-full flex items-center justify-center">
                <User size={16} className="text-secondary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-secondary-900 truncate">
                  {session.user.email}
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-80 min-h-screen">
          <div className="max-w-7xl mx-auto p-6 md:p-10 lg:p-12">
            <Routes>
              <Route path="/" element={defaultGrant ? <Navigate to={`/${defaultGrant}`} replace /> : <div className="text-center py-20 text-secondary-400">No grants yet</div>} />
              <Route path="/:grantId" element={<GrantDetail />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  )
}

export default App
