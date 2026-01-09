import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink, useParams, Navigate, useNavigate } from 'react-router-dom'
import { FileText, ExternalLink, AlertTriangle, CheckCircle, Circle, Copy, LogOut, User, Users, Terminal, Globe, ShieldCheck, X, Check, Minus, Download, Edit3, Shield, Upload, ArrowRight, Share2, Link, Mail, FileKey, Plus, Trash2, Send, Archive, RotateCcw, Menu, DollarSign, Save, Building, Sparkles, Zap, Code2, GitBranch, ChevronRight, LayoutGrid, FolderOpen, Clock, Target } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'
import { supabase, signInWithGoogle, signOut, getGrant, getResponses, updateResponse, getGrantByShareToken, generateShareToken, getInternalDocuments, createInternalDocument, updateInternalDocument, deleteInternalDocument, completeDeviceAuth, archiveGrant, restoreGrant, getActiveGrants, getArchivedGrants, getBudget, updateBudget, getGrantPermissions, addPermission, removePermission, updatePermissionRole } from './lib/supabase'

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

// Landing page component - Technical Editorial design
function LandingPage() {
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    await signInWithGoogle()
    setLoading(false)
  }

  return (
    <div className="min-h-screen hero-gradient relative overflow-hidden">
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />

      {/* Header */}
      <header className="relative z-50 sticky top-0">
        <div className="glass border-b border-secondary-100/50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src="/logo.svg" alt="GrantKit" className="h-10 w-auto rounded-xl" />
                <div className="absolute -inset-1 bg-electric-500/20 rounded-xl blur-lg -z-10" />
              </div>
              <span className="text-xl font-bold text-secondary-900 tracking-tight">GrantKit</span>
            </div>
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="btn btn-primary gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        {/* Floating accent elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-electric-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-10 w-48 h-48 bg-electric-500/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-midnight-900 text-white text-sm font-medium mb-8 animate-fade-in">
            <Sparkles size={14} className="text-electric-400" />
            <span>For AI-native teams</span>
            <ChevronRight size={14} className="text-midnight-400" />
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-secondary-900 mb-8 tracking-tight leading-[1.1] animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            You use AI agents for code.
            <br />
            <span className="gradient-text">Now use them for grants.</span>
          </h1>

          <p className="text-xl md:text-2xl text-secondary-500 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            GrantKit syncs your proposals to local markdown files so <span className="text-secondary-700 font-medium">Claude Code</span>, <span className="text-secondary-700 font-medium">Cursor</span>, and other AI tools can help you write them.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="btn btn-electric text-lg px-8 py-4 glow-subtle hover:glow disabled:opacity-50"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Signing in...' : 'Get started with Google'}
            </button>
            <a
              href="https://github.com/GrantKit/grantkit"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary text-lg px-8 py-4"
            >
              <Terminal size={20} />
              View on GitHub
            </a>
          </div>

          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-secondary-400 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <span className="flex items-center gap-2">
              <Code2 size={16} className="text-electric-500" />
              Open source
            </span>
            <span className="w-1 h-1 rounded-full bg-secondary-300" />
            <span className="flex items-center gap-2">
              <Shield size={16} className="text-electric-500" />
              NSF validated
            </span>
            <span className="w-1 h-1 rounded-full bg-secondary-300" />
            <span className="flex items-center gap-2">
              <Zap size={16} className="text-electric-500" />
              Free forever
            </span>
          </div>
        </div>
      </section>

      {/* Features - Card grid with hover effects */}
      <section className="relative max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-6 stagger">
          <div className="card feature-card p-8 hover-lift cursor-default animate-fade-in-up">
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-electric-500/20 to-electric-500/5 flex items-center justify-center mb-6 border border-electric-500/20">
                <LayoutGrid className="w-7 h-7 text-electric-600" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">Track Applications</h3>
              <p className="text-secondary-500 leading-relaxed">
                Keep all your grant applications in one place. See deadlines, status, and requested amounts at a glance.
              </p>
            </div>
          </div>

          <div className="card feature-card p-8 hover-lift cursor-default animate-fade-in-up">
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-success-500/20 to-success-500/5 flex items-center justify-center mb-6 border border-success-500/20">
                <Target className="w-7 h-7 text-success-600" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">Manage Responses</h3>
              <p className="text-secondary-500 leading-relaxed">
                Edit and track progress on each response. Word counts, character limits, and completion status built in.
              </p>
            </div>
          </div>

          <div className="card feature-card p-8 hover-lift cursor-default animate-fade-in-up">
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-warning-500/20 to-warning-500/5 flex items-center justify-center mb-6 border border-warning-500/20">
                <Users className="w-7 h-7 text-warning-600" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">Team Collaboration</h3>
              <p className="text-secondary-500 leading-relaxed">
                Everyone on your team can access and edit grants. No more version conflicts or email chains.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why GrantKit - Comparison */}
      <section className="relative max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-secondary-900 mb-4 tracking-tight">Why not just use Grantable?</h2>
          <p className="text-xl text-secondary-500 max-w-2xl mx-auto">
            Other grant tools have their own AI built in. But you already have Claude Code. GrantKit gets out of the way.
          </p>
        </div>

        {/* Feature pillars */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-electric-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative card p-8 border-2 border-transparent group-hover:border-electric-500/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-midnight-900 flex items-center justify-center mb-6">
                <Terminal className="w-6 h-6 text-electric-400" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">Open Source + CLI</h3>
              <p className="text-secondary-500 leading-relaxed">
                Your proposals live in Git. Use Claude Code, Cursor, or any AI tool to craft responses locally. Full control over your data.
              </p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-electric-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative card p-8 border-2 border-transparent group-hover:border-electric-500/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-midnight-900 flex items-center justify-center mb-6">
                <GitBranch className="w-6 h-6 text-electric-400" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">Web + Local Hybrid</h3>
              <p className="text-secondary-500 leading-relaxed">
                Edit in the web app for quick updates. Use your local editor for deep work. Changes sync automatically.
              </p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-electric-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative card p-8 border-2 border-transparent group-hover:border-electric-500/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-midnight-900 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-electric-400" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">Automated Validators</h3>
              <p className="text-secondary-500 leading-relaxed">
                NSF compliance checking built-in. Validate page limits, formatting rules, and required sections before submission.
              </p>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="card overflow-hidden border-2 border-midnight-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-midnight-100">
                  <th className="text-left p-5 font-semibold text-secondary-900 bg-midnight-50">Feature</th>
                  <th className="text-center p-5 font-bold text-midnight-900 bg-electric-500/10 border-x border-electric-500/20">
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles size={16} className="text-electric-500" />
                      GrantKit
                    </span>
                  </th>
                  <th className="text-center p-5 font-medium text-secondary-500 bg-midnight-50">Instrumentl</th>
                  <th className="text-center p-5 font-medium text-secondary-500 bg-midnight-50">Grantable</th>
                  <th className="text-center p-5 font-medium text-secondary-500 bg-midnight-50">Google Docs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-midnight-100">
                <tr className="hover:bg-midnight-50/50 transition-colors">
                  <td className="p-5 text-secondary-700 font-medium">Open source</td>
                  <td className="p-5 text-center bg-electric-500/5"><Check className="w-5 h-5 text-success-500 mx-auto" /></td>
                  <td className="p-5 text-center"><X className="w-5 h-5 text-secondary-300 mx-auto" /></td>
                  <td className="p-5 text-center"><X className="w-5 h-5 text-secondary-300 mx-auto" /></td>
                  <td className="p-5 text-center"><X className="w-5 h-5 text-secondary-300 mx-auto" /></td>
                </tr>
                <tr className="hover:bg-midnight-50/50 transition-colors">
                  <td className="p-5 text-secondary-700 font-medium">Local CLI + AI tools</td>
                  <td className="p-5 text-center bg-electric-500/5"><Check className="w-5 h-5 text-success-500 mx-auto" /></td>
                  <td className="p-5 text-center"><X className="w-5 h-5 text-secondary-300 mx-auto" /></td>
                  <td className="p-5 text-center"><X className="w-5 h-5 text-secondary-300 mx-auto" /></td>
                  <td className="p-5 text-center"><Minus className="w-5 h-5 text-secondary-300 mx-auto" /></td>
                </tr>
                <tr className="hover:bg-midnight-50/50 transition-colors">
                  <td className="p-5 text-secondary-700 font-medium">NSF compliance validation</td>
                  <td className="p-5 text-center bg-electric-500/5"><Check className="w-5 h-5 text-success-500 mx-auto" /></td>
                  <td className="p-5 text-center"><X className="w-5 h-5 text-secondary-300 mx-auto" /></td>
                  <td className="p-5 text-center"><X className="w-5 h-5 text-secondary-300 mx-auto" /></td>
                  <td className="p-5 text-center"><X className="w-5 h-5 text-secondary-300 mx-auto" /></td>
                </tr>
                <tr className="hover:bg-midnight-50/50 transition-colors">
                  <td className="p-5 text-secondary-700 font-medium">Web collaboration</td>
                  <td className="p-5 text-center bg-electric-500/5"><Check className="w-5 h-5 text-success-500 mx-auto" /></td>
                  <td className="p-5 text-center"><Check className="w-5 h-5 text-success-500 mx-auto" /></td>
                  <td className="p-5 text-center"><Check className="w-5 h-5 text-success-500 mx-auto" /></td>
                  <td className="p-5 text-center"><Check className="w-5 h-5 text-success-500 mx-auto" /></td>
                </tr>
                <tr className="hover:bg-midnight-50/50 transition-colors">
                  <td className="p-5 text-secondary-700 font-medium">Price</td>
                  <td className="p-5 text-center bg-electric-500/5">
                    <span className="font-bold text-success-600">Free</span>
                  </td>
                  <td className="p-5 text-center text-secondary-500">$179-299/mo</td>
                  <td className="p-5 text-center text-secondary-500">$49-199/mo</td>
                  <td className="p-5 text-center text-secondary-500">Free</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-midnight-900" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(0, 212, 255, 0.15) 0%, transparent 50%)'
        }} />

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">How it works</h2>
            <p className="text-xl text-midnight-300 max-w-2xl mx-auto">
              GrantKit syncs between local files and the cloud. Use AI tools locally, collaborate in the browser.
            </p>
          </div>

          {/* Workflow Steps */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {[
              { icon: Download, label: 'Pull', desc: 'Download grants to local markdown files', step: 1 },
              { icon: Edit3, label: 'Edit', desc: 'Use Claude Code, Cursor, or any AI tool', step: 2 },
              { icon: Shield, label: 'Validate', desc: 'Check NSF compliance automatically', step: 3 },
              { icon: Upload, label: 'Push', desc: 'Sync changes back to the cloud', step: 4 },
            ].map(({ icon: Icon, label, desc, step }) => (
              <div key={step} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-b from-electric-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-midnight-800/50 backdrop-blur border border-midnight-700 rounded-2xl p-6 text-center hover:border-electric-500/50 transition-colors">
                  <div className="w-14 h-14 rounded-2xl bg-electric-500/10 border border-electric-500/30 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-electric-400" />
                  </div>
                  <div className="text-xs font-bold text-electric-400 uppercase tracking-wider mb-2">Step {step}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{label}</h3>
                  <p className="text-sm text-midnight-300">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Terminal */}
          <div className="terminal shadow-2xl">
            <div className="terminal-header">
              <div className="terminal-dot bg-danger-500" />
              <div className="terminal-dot bg-warning-500" />
              <div className="terminal-dot bg-success-500" />
              <span className="ml-4 text-midnight-400 text-sm">Terminal</span>
            </div>
            <div className="terminal-body space-y-4">
              <div>
                <span className="text-midnight-500"># Install GrantKit CLI</span>
                <div className="text-electric-400">$ pip install grantkit</div>
              </div>
              <div>
                <span className="text-midnight-500"># Pull grants from the cloud</span>
                <div className="text-electric-400">$ grantkit sync pull</div>
                <div className="text-success-400 ml-2">✅ Pulled 10 grants, 94 responses</div>
              </div>
              <div>
                <span className="text-midnight-500"># Edit with your favorite AI tool</span>
                <div className="text-electric-400">$ claude "improve the broader impacts section"</div>
              </div>
              <div>
                <span className="text-midnight-500"># Validate NSF compliance</span>
                <div className="text-electric-400">$ grantkit validate</div>
                <div className="text-success-400 ml-2">✅ All checks passed</div>
              </div>
              <div>
                <span className="text-midnight-500"># Push changes back</span>
                <div className="text-electric-400">$ grantkit sync push</div>
                <div className="text-success-400 ml-2">✅ Synced 3 responses to cloud</div>
              </div>
            </div>
          </div>

          {/* File Structure */}
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-electric-400" />
                Local File Structure
              </h3>
              <div className="bg-midnight-800/50 backdrop-blur rounded-xl border border-midnight-700 p-6 font-mono text-sm">
                <div className="text-midnight-300">
                  <div className="text-electric-400">my-grants/</div>
                  <div className="ml-4 text-midnight-400">├── nsf-cssi/</div>
                  <div className="ml-8">├── grant.yaml</div>
                  <div className="ml-8">└── responses/</div>
                  <div className="ml-12">├── abstract.md</div>
                  <div className="ml-12">├── broader_impacts.md</div>
                  <div className="ml-12">└── technical_approach.md</div>
                  <div className="ml-4 text-midnight-400">├── arnold-labor/</div>
                  <div className="ml-4 text-midnight-400">└── ...</div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-electric-400" />
                Response Format
              </h3>
              <div className="bg-midnight-800/50 backdrop-blur rounded-xl border border-midnight-700 p-6 font-mono text-sm">
                <div className="text-midnight-500">---</div>
                <div><span className="text-electric-400">title:</span> <span className="text-midnight-200">Broader Impacts</span></div>
                <div><span className="text-electric-400">key:</span> <span className="text-midnight-200">broader_impacts</span></div>
                <div><span className="text-electric-400">word_limit:</span> <span className="text-warning-400">2500</span></div>
                <div><span className="text-electric-400">status:</span> <span className="text-success-400">draft</span></div>
                <div className="text-midnight-500">---</div>
                <div className="mt-2 text-midnight-200"># Broader Impacts</div>
                <div className="text-midnight-400 mt-1">PolicyEngine democratizes...</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: '$4.9M', label: 'Total Requested' },
              { value: '10', label: 'Active Grants' },
              { value: '94', label: 'Response Sections' },
              { value: '8', label: 'Foundations' },
            ].map(({ value, label }) => (
              <div key={label} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-b from-electric-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="stat-value text-secondary-900 mb-2">{value}</div>
                  <div className="stat-label">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="card p-12 border-2 border-midnight-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-electric-500/5 via-transparent to-transparent" />
          <div className="relative">
            <h2 className="text-4xl font-bold text-secondary-900 mb-4 tracking-tight">Let your AI agent write your next grant</h2>
            <p className="text-xl text-secondary-500 mb-8">Sign in to try GrantKit. Currently in beta.</p>
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="btn btn-primary text-lg px-8 py-4 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-secondary-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-secondary-500">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="GrantKit" className="h-8 w-auto rounded-lg" />
            <span className="font-semibold text-secondary-700">GrantKit</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/GrantKit" className="hover:text-secondary-700 transition-colors flex items-center gap-2">
              <Code2 size={16} />
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Response card component - Redesigned with Technical Editorial aesthetic
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

  // Determine progress bar style based on percentage
  const getProgressStyle = () => {
    if (percentage > 100) return 'progress-bar-fill-danger'
    if (percentage > 80) return 'progress-bar-fill-warning'
    return 'progress-bar-fill-electric'
  }

  // Determine status badge style
  const getStatusStyle = () => {
    if (overLimit) return 'badge-danger'
    if (wordCount === 0) return 'badge-warning'
    return 'badge-success'
  }

  return (
    <>
      <div
        className={cn(
          "card p-6 hover-lift cursor-pointer group relative overflow-hidden transition-all duration-300",
          "border-l-4",
          overLimit ? "border-l-danger-500" :
          wordCount === 0 ? "border-l-warning-500" :
          "border-l-electric-500"
        )}
        onClick={() => setExpanded(true)}
      >
        {/* Subtle hover gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-electric-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-secondary-900 pr-10 leading-tight tracking-tight">{response.title}</h3>
            <button
              onClick={handleCopy}
              className={cn(
                "absolute top-0 right-0 p-2.5 rounded-xl transition-all duration-200",
                "opacity-0 group-hover:opacity-100 transform group-hover:translate-x-0 translate-x-2",
                copied
                  ? "bg-success-500/10 text-success-600"
                  : "bg-midnight-100 text-midnight-500 hover:bg-midnight-200 hover:text-midnight-700"
              )}
              title="Copy to clipboard"
            >
              {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
            </button>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-xs font-medium text-secondary-500 mb-2">
              <span className="font-mono">{limitText}</span>
              {percentage > 0 && (
                <span className={cn(
                  "font-semibold",
                  percentage > 100 ? "text-danger-600" :
                  percentage > 80 ? "text-warning-600" :
                  "text-electric-600"
                )}>
                  {percentage.toFixed(0)}%
                </span>
              )}
            </div>
            {percentage > 0 && (
              <div className="progress-bar">
                <div
                  className={cn("progress-bar-fill", getProgressStyle())}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            )}
          </div>

          <div className={cn("badge", getStatusStyle())}>
            {overLimit ? <AlertTriangle size={12} /> : wordCount === 0 ? <Circle size={12} /> : <CheckCircle size={12} />}
            <span>{overLimit ? 'Over Limit' : wordCount === 0 ? 'Empty' : 'Draft'}</span>
          </div>
        </div>
      </div>

      {/* Modal - Redesigned */}
      {expanded && (
        <div className="modal-backdrop" onClick={() => { setExpanded(false); setEditing(false) }}>
          <div className="modal-content w-full max-w-4xl max-h-[90vh] flex flex-col mx-4" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-6 border-b border-midnight-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-secondary-900 tracking-tight">{response.title}</h2>
                <div className={cn("badge mt-2", getStatusStyle())}>
                  {overLimit ? <AlertTriangle size={12} /> : wordCount === 0 ? <Circle size={12} /> : <CheckCircle size={12} />}
                  <span>{overLimit ? 'Over Limit' : wordCount === 0 ? 'Empty' : 'Draft'}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="btn btn-primary"
                  >
                    <Edit3 size={16} />
                    Edit
                  </button>
                )}
                <button
                  onClick={() => { setExpanded(false); setEditing(false) }}
                  className="p-2.5 rounded-xl text-midnight-400 hover:text-midnight-600 hover:bg-midnight-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar bg-midnight-50/50 flex-1">
              {/* Question prompt */}
              {response.question && (
                <div className="relative mb-6 p-5 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-electric-500/10 to-transparent" />
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-electric-500" />
                  <div className="relative">
                    <h4 className="font-bold text-electric-700 mb-2 uppercase text-xs tracking-wider flex items-center gap-2">
                      <FileText size={12} />
                      Question
                    </h4>
                    <p className="text-midnight-700 leading-relaxed">{response.question}</p>
                  </div>
                </div>
              )}

              {/* Progress bar and copy button */}
              <div className="card p-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm font-medium text-secondary-600 mb-2">
                      <span className="font-mono">{limitText}</span>
                      <span className={cn(
                        "font-semibold",
                        percentage > 100 ? "text-danger-600" :
                        percentage > 80 ? "text-warning-600" :
                        "text-electric-600"
                      )}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    {percentage > 0 && (
                      <div className="progress-bar">
                        <div
                          className={cn("progress-bar-fill", getProgressStyle())}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleCopy}
                    className={cn(
                      "btn transition-all active:scale-95",
                      copied ? "btn-electric" : "btn-primary"
                    )}
                  >
                    {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Content area */}
              {editing ? (
                <div className="space-y-4">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="input h-96 resize-none font-mono text-sm"
                    placeholder="Enter your response..."
                    autoFocus
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => { setContent(response.content || ''); setEditing(false) }}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="btn btn-electric"
                    >
                      <Save size={16} />
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="card p-8">
                  <div className="prose prose-slate max-w-none">
                    <div className="whitespace-pre-wrap text-base text-secondary-700 leading-relaxed">
                      {content || <span className="text-secondary-400 italic">No content yet. Click Edit to add your response.</span>}
                    </div>
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

// Internal document card component (letters, emails - private)
function InternalDocumentCard({ doc, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(doc.content || '')
  const [title, setTitle] = useState(doc.title || '')
  const [recipient, setRecipient] = useState(doc.recipient || '')
  const [copied, setCopied] = useState(false)

  const docTypeIcons = {
    letter_request: Mail,
    email: Send,
    budget: FileText,
    notes: FileKey,
  }
  const Icon = docTypeIcons[doc.doc_type] || FileKey

  const statusColors = {
    draft: 'text-amber-700 bg-amber-50 border-amber-200',
    sent: 'text-blue-700 bg-blue-50 border-blue-200',
    received: 'text-green-700 bg-green-50 border-green-200',
  }

  const handleCopy = async (e) => {
    e.stopPropagation()
    const success = await copyToClipboard(content)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSave = async () => {
    await onUpdate(doc.id, { title, recipient, content })
    setEditing(false)
  }

  return (
    <>
      <div
        className="border rounded-xl p-4 hover:shadow-md transition-all cursor-pointer bg-white border-secondary-200 group"
        onClick={() => setExpanded(true)}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-secondary-100 text-secondary-600 rounded-lg">
            <Icon size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-secondary-900 truncate">{doc.title}</h4>
            {doc.recipient && (
              <p className="text-sm text-secondary-500 truncate">To: {doc.recipient}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full border font-medium",
                statusColors[doc.status] || statusColors.draft
              )}>
                {doc.status || 'draft'}
              </span>
              <span className="text-xs text-secondary-400">
                {doc.doc_type?.replace('_', ' ')}
              </span>
            </div>
          </div>
          <button
            onClick={handleCopy}
            className={cn(
              "p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100",
              copied ? "bg-primary-100 text-primary-700" : "bg-secondary-100 text-secondary-600 hover:bg-secondary-200"
            )}
            title="Copy content"
          >
            {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Modal */}
      {expanded && (
        <div className="fixed inset-0 bg-secondary-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setExpanded(false); setEditing(false) }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-secondary-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary-100 text-secondary-600 rounded-lg">
                  <Icon size={20} />
                </div>
                <div>
                  <span className="text-xs text-secondary-500 uppercase font-semibold">
                    {doc.doc_type?.replace('_', ' ')} · Private
                  </span>
                  <h2 className="text-lg font-bold text-secondary-900">{doc.title}</h2>
                </div>
              </div>
              <div className="flex gap-2">
                {!editing && (
                  <button onClick={() => setEditing(true)} className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
                    Edit
                  </button>
                )}
                <button onClick={() => onDelete(doc.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 size={18} />
                </button>
                <button onClick={() => { setExpanded(false); setEditing(false) }} className="p-2 text-secondary-400 hover:text-secondary-600 rounded-lg">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-secondary-50/50">
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">Recipient</label>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., Dan Feenberg, John Ricco"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">Content</label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full h-64 px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none font-mono text-sm"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button onClick={() => { setContent(doc.content || ''); setTitle(doc.title || ''); setRecipient(doc.recipient || ''); setEditing(false) }} className="px-4 py-2 border border-secondary-300 text-secondary-700 rounded-lg">
                      Cancel
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-xl border border-secondary-200">
                  {doc.recipient && (
                    <div className="mb-4 text-sm text-secondary-600">
                      <strong>To:</strong> {doc.recipient}
                    </div>
                  )}
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{content || '*No content yet*'}</ReactMarkdown>
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

// Submission Checklist component
function SubmissionChecklist({ grant, responses }) {
  const [expanded, setExpanded] = useState(false)

  // Check which narrative sections exist and have content
  const narrativeSections = [
    { name: 'Project Summary', key: 'project_summary', required: true },
    { name: 'Project Description', key: 'project_description', required: true },
    { name: 'Budget Justification', key: 'budget_justification', required: true },
    { name: 'Data Management Plan', key: 'data_management_plan', required: true },
    { name: 'Facilities & Resources', key: 'facilities_resources', required: false },
    { name: 'Personnel & Organizations', key: 'personnel_organizations', required: false },
    { name: 'Delivery Metrics', key: 'delivery_metrics', required: false },
  ]

  const nsfToolSections = [
    { name: 'Bio Sketch (PI)', tool: 'SciENcv', url: 'https://sciencv.ncbi.nlm.nih.gov', required: true },
    { name: 'Bio Sketch (Co-PI)', tool: 'SciENcv', url: 'https://sciencv.ncbi.nlm.nih.gov', required: false },
    { name: 'Current & Pending Support', tool: 'Research.gov', url: 'https://research.gov', required: true },
    { name: 'Budget Form', tool: 'Research.gov', url: 'https://research.gov', required: true },
  ]

  const supplementary = [
    { name: 'Letters of Collaboration', required: false },
    { name: 'Postdoc Mentoring Plan', required: false },
  ]

  // Check if a response exists and has content
  const hasContent = (key) => {
    const response = responses.find(r => r.key === key || r.title?.toLowerCase().includes(key.replace('_', ' ')))
    return response && response.content && response.content.trim().length > 100
  }

  const narrativeComplete = narrativeSections.filter(s => hasContent(s.key)).length
  const narrativeTotal = narrativeSections.length
  const progress = Math.round((narrativeComplete / narrativeTotal) * 100)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-secondary-200 mb-8 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-secondary-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <CheckCircle size={20} />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-secondary-900">Submission Checklist</h3>
            <p className="text-sm text-secondary-500">
              {narrativeComplete}/{narrativeTotal} narrative sections complete
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-32 h-2 bg-secondary-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                progress === 100 ? "bg-green-500" : progress > 50 ? "bg-blue-500" : "bg-amber-500"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-medium text-secondary-600">{progress}%</span>
          <svg
            className={cn("w-5 h-5 text-secondary-400 transition-transform", expanded && "rotate-180")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-secondary-100 p-6 bg-secondary-50/50">
          {/* Narrative Documents */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-green-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText size={14} />
              Narrative Documents
              <span className="font-normal text-secondary-500 normal-case">(GrantKit generates)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {narrativeSections.map((section) => {
                const complete = hasContent(section.key)
                return (
                  <div key={section.key} className="flex items-center gap-3 py-2">
                    {complete ? (
                      <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                    ) : section.required ? (
                      <X size={18} className="text-red-500 flex-shrink-0" />
                    ) : (
                      <Circle size={18} className="text-secondary-300 flex-shrink-0" />
                    )}
                    <span className={cn(
                      "text-sm",
                      complete ? "text-secondary-700" : section.required ? "text-red-700" : "text-secondary-500"
                    )}>
                      {section.name}
                      {section.required && !complete && <span className="text-red-500 ml-1">*</span>}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* NSF Tools */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Globe size={14} />
              Required Forms
              <span className="font-normal text-secondary-500 normal-case">(use NSF tools)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {nsfToolSections.map((section) => (
                <div key={section.name} className="flex items-center gap-3 py-2">
                  <Circle size={18} className="text-secondary-300 flex-shrink-0" />
                  <span className="text-sm text-secondary-600">
                    {section.name}
                    {section.required && <span className="text-red-500 ml-1">*</span>}
                  </span>
                  <a
                    href={section.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {section.tool} <ExternalLink size={10} />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Supplementary */}
          <div>
            <h4 className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileKey size={14} />
              Supplementary
              <span className="font-normal text-secondary-500 normal-case">(if applicable)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {supplementary.map((section) => (
                <div key={section.name} className="flex items-center gap-3 py-2">
                  <Circle size={18} className="text-secondary-300 flex-shrink-0" />
                  <span className="text-sm text-secondary-500">{section.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Permissions Modal (Google Drive-style sharing)
function PermissionsModal({ grantId, grant, isOpen, onClose, onGrantUpdate }) {
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [newEmail, setNewEmail] = useState('')
  const [newDomain, setNewDomain] = useState('')
  const [newRole, setNewRole] = useState('viewer')
  const [addMode, setAddMode] = useState('email') // 'email' or 'domain'
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const [generatingLink, setGeneratingLink] = useState(false)

  const shareUrl = grant?.share_token
    ? `${window.location.origin}/share/${grant.share_token}`
    : null

  const handleCopyLink = async () => {
    if (!shareUrl) {
      // Generate share token first
      setGeneratingLink(true)
      const { token } = await generateShareToken(grantId)
      setGeneratingLink(false)
      if (token) {
        const url = `${window.location.origin}/share/${token}`
        await navigator.clipboard.writeText(url)
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 2000)
        // Trigger parent to refresh grant data
        if (onGrantUpdate) onGrantUpdate()
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadPermissions()
    }
  }, [isOpen, grantId])

  const loadPermissions = async () => {
    setLoading(true)
    const { data } = await getGrantPermissions(grantId)
    setPermissions(data || [])
    setLoading(false)
  }

  const handleAdd = async () => {
    if (addMode === 'email' && !newEmail) return
    if (addMode === 'domain' && !newDomain) return

    setSaving(true)
    setError(null)
    const { data, error: addError } = await addPermission(grantId, {
      email: addMode === 'email' ? newEmail : null,
      domain: addMode === 'domain' ? newDomain : null,
      role: newRole
    })

    if (addError) {
      console.error('Permission add error:', addError)
      setError(addError.message || 'Failed to add permission')
    } else {
      setNewEmail('')
      setNewDomain('')
      await loadPermissions()
    }
    setSaving(false)
  }

  const handleRemove = async (permissionId) => {
    await removePermission(permissionId)
    await loadPermissions()
  }

  const handleRoleChange = async (permissionId, role) => {
    await updatePermissionRole(permissionId, role)
    await loadPermissions()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-secondary-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-secondary-900 flex items-center gap-2">
              <Users size={24} className="text-primary-600" />
              Share Grant
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-secondary-100 rounded-lg transition-colors">
              <X size={20} className="text-secondary-500" />
            </button>
          </div>
          <p className="text-sm text-secondary-500 mt-1">
            Control who can view or edit this grant proposal
          </p>
        </div>

        {/* Add new permission */}
        <div className="p-6 border-b border-secondary-200 bg-secondary-50">
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setAddMode('email')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5",
                addMode === 'email'
                  ? "bg-primary-600 text-white"
                  : "bg-white text-secondary-600 hover:bg-secondary-100"
              )}
            >
              <Mail size={14} /> Person
            </button>
            <button
              onClick={() => setAddMode('domain')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5",
                addMode === 'domain'
                  ? "bg-primary-600 text-white"
                  : "bg-white text-secondary-600 hover:bg-secondary-100"
              )}
            >
              <Building size={14} /> Domain
            </button>
          </div>

          <div className="flex gap-2">
            {addMode === 'email' ? (
              <input
                type="email"
                placeholder="Enter email address"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                className="flex-1 px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            ) : (
              <div className="flex-1 flex items-center gap-1">
                <span className="text-secondary-400 text-sm">Anyone @</span>
                <input
                  type="text"
                  placeholder="policyengine.org"
                  value={newDomain}
                  onChange={e => setNewDomain(e.target.value)}
                  className="flex-1 px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            )}
            <select
              value={newRole}
              onChange={e => setNewRole(e.target.value)}
              className="px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
            <button
              onClick={handleAdd}
              disabled={saving || (addMode === 'email' && !newEmail) || (addMode === 'domain' && !newDomain)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Adding...' : 'Add'}
            </button>
          </div>
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Permissions list */}
        <div className="p-6 overflow-y-auto max-h-[40vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-200 border-t-primary-600"></div>
            </div>
          ) : permissions.length === 0 ? (
            <div className="text-center py-8 text-secondary-400">
              <Users size={32} className="mx-auto mb-2 opacity-50" />
              <p>No one else has access yet</p>
              <p className="text-sm mt-1">Add people or domains above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {permissions.map(perm => (
                <div key={perm.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      perm.domain ? "bg-purple-100 text-purple-600" : "bg-primary-100 text-primary-600"
                    )}>
                      {perm.domain ? <Building size={18} /> : <User size={18} />}
                    </div>
                    <div>
                      <div className="font-medium text-secondary-900">
                        {perm.domain ? `Anyone @${perm.domain}` : perm.user_email}
                      </div>
                      <div className="text-xs text-secondary-400">
                        {perm.domain ? 'Domain access' : 'Individual access'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={perm.role}
                      onChange={e => handleRoleChange(perm.id, e.target.value)}
                      className="px-2 py-1 border border-secondary-200 rounded text-sm bg-white"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                    </select>
                    <button
                      onClick={() => handleRemove(perm.id)}
                      className="p-1.5 hover:bg-red-100 text-secondary-400 hover:text-red-600 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Copy Link Section - Google Drive style */}
        <div className="p-4 border-t border-secondary-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center">
                <Link size={18} className="text-secondary-600" />
              </div>
              <div>
                <div className="font-medium text-secondary-900 text-sm">Anyone with the link</div>
                <div className="text-xs text-secondary-500">
                  {shareUrl ? 'Can view this grant' : 'No link created yet'}
                </div>
              </div>
            </div>
            <button
              onClick={handleCopyLink}
              disabled={generatingLink}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                linkCopied
                  ? "bg-green-100 text-green-700"
                  : "bg-primary-100 text-primary-700 hover:bg-primary-200 disabled:opacity-50"
              )}
            >
              {generatingLink ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-300 border-t-primary-600" />
                  Creating...
                </>
              ) : linkCopied ? (
                <>
                  <Check size={16} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copy link
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Grant Metadata Section (expandable details)
function GrantMetadataSection({ grant }) {
  const [expanded, setExpanded] = useState(false)

  // Extract metadata from various possible locations
  const researchGov = grant.nsf_config || {}
  const metadata = grant.metadata || {}
  const contact = grant.contact || {}
  const project = grant.project || {}

  // Check if we have any extended metadata to show
  const hasExtendedData = grant.requested_start_date ||
    researchGov.directorate || researchGov.division || researchGov.requested_start_date ||
    grant.pi_name || grant.pi_email || contact.pi_name ||
    grant.repo_url || grant.solicitation_url

  if (!hasExtendedData) return null

  // Helper to format dates nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return null
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  // Gather all metadata fields
  const fields = [
    // Dates
    { label: 'Requested Start', value: formatDate(grant.requested_start_date || researchGov.requested_start_date), category: 'Timeline' },
    { label: 'Duration', value: researchGov.requested_duration_months ? `${researchGov.requested_duration_months} months` : null, category: 'Timeline' },

    // NSF/Research.gov specific
    { label: 'Directorate', value: researchGov.directorate, category: 'NSF' },
    { label: 'Division', value: researchGov.division, category: 'NSF' },
    { label: 'Program Announcement', value: researchGov.program_announcement, category: 'NSF' },
    { label: 'Proposal Type', value: researchGov.proposal_type, category: 'NSF' },

    // Organization
    { label: 'Organization', value: researchGov.organization_name || metadata.organization, category: 'Organization' },
    { label: 'UEI', value: researchGov.organization_uei, category: 'Organization' },
    { label: 'Fiscal Sponsor', value: grant.fiscal_sponsor || metadata.fiscal_sponsor, category: 'Organization' },

    // PI Info
    { label: 'PI Name', value: grant.pi_name || researchGov.pi_name || contact.pi_name, category: 'Personnel' },
    { label: 'PI Email', value: grant.pi_email || researchGov.pi_email || contact.pi_email, category: 'Personnel' },
    { label: 'Co-PI', value: grant.co_pi_name || contact.co_pi_name, category: 'Personnel' },
  ].filter(f => f.value)

  // Group by category
  const categories = [...new Set(fields.map(f => f.category))]

  return (
    <div className="mt-6 border-t border-secondary-100 pt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-secondary-500 hover:text-secondary-700 transition-colors"
      >
        <svg
          className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
        <span className="font-medium">{expanded ? 'Hide' : 'Show'} Details</span>
        <span className="text-secondary-400">({fields.length} fields)</span>
      </button>

      {expanded && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <div key={category}>
              <h4 className="text-xs font-bold text-secondary-400 uppercase tracking-wider mb-3">{category}</h4>
              <div className="space-y-2">
                {fields.filter(f => f.category === category).map(field => (
                  <div key={field.label} className="flex justify-between items-start gap-2">
                    <span className="text-sm text-secondary-500">{field.label}</span>
                    <span className="text-sm font-medium text-secondary-900 text-right">{field.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// NSF Budget Form Component - mirrors Research.gov interface
function BudgetForm({ grantId }) {
  const [budget, setBudget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const yearsInBudget = budget?.years_in_budget || 3

  useEffect(() => {
    async function loadBudget() {
      setLoading(true)
      const { data } = await getBudget(grantId)
      setBudget(data)
      setLoading(false)
    }
    loadBudget()
  }, [grantId])

  const handleSave = async () => {
    setSaving(true)
    await updateBudget(grantId, budget)
    setHasChanges(false)
    setSaving(false)
  }

  const updateField = (path, value) => {
    setBudget(prev => {
      const updated = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let obj = updated
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {}
        obj = obj[keys[i]]
      }
      obj[keys[keys.length - 1]] = value
      return updated
    })
    setHasChanges(true)
  }

  const formatCurrency = (val) => {
    if (val === null || val === undefined || val === '') return ''
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val)
  }

  const parseCurrency = (str) => {
    if (!str) return 0
    return parseInt(str.replace(/[^0-9.-]/g, '')) || 0
  }

  // Calculate totals
  const calcTotals = () => {
    if (!budget) return { direct: 0, indirect: 0, total: 0 }

    const senior = budget.summary?.total?.senior_personnel || 0
    const other = budget.summary?.total?.other_personnel || 0
    const fringe = budget.summary?.total?.fringe_benefits || 0
    const equipment = budget.summary?.total?.equipment || 0
    const travel = budget.summary?.total?.travel || 0
    const participant = budget.summary?.total?.participant_support || 0
    const otherDirect = budget.summary?.total?.other_direct || 0

    const direct = senior + other + fringe + equipment + travel + participant + otherDirect
    const indirect = budget.summary?.total?.indirect || 0
    const total = direct + indirect

    return { direct, indirect, total }
  }

  const totals = calcTotals()

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-secondary-200 mb-8 p-6">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary-200 rounded-lg"></div>
          <div className="h-6 bg-secondary-200 rounded w-32"></div>
        </div>
      </div>
    )
  }

  if (!budget) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-secondary-200 mb-8 p-6">
        <div className="flex items-center gap-3 text-secondary-400">
          <DollarSign size={20} />
          <span>No budget data. Run <code className="bg-secondary-100 px-2 py-1 rounded text-sm">grantkit sync push</code> to sync budget.yaml</span>
        </div>
      </div>
    )
  }

  // Editable currency input
  const CurrencyInput = ({ value, onChange, className = '' }) => (
    <input
      type="text"
      value={formatCurrency(value)}
      onChange={(e) => onChange(parseCurrency(e.target.value))}
      className={cn(
        "w-24 px-2 py-1 text-right border border-secondary-200 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm",
        className
      )}
    />
  )

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-secondary-200 mb-8 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-secondary-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-green-100 text-green-600 rounded-lg">
            <DollarSign size={20} />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-secondary-900">Budget (Prime Organization)</h3>
            <p className="text-sm text-secondary-500">
              {formatCurrency(totals.total)} Total Requested • {yearsInBudget} Years
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {hasChanges && (
            <span className="text-xs text-amber-600 font-medium">Unsaved changes</span>
          )}
          <svg
            className={cn("w-5 h-5 text-secondary-400 transition-transform", expanded && "rotate-180")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-secondary-100">
          {/* Save button */}
          {hasChanges && (
            <div className="p-4 bg-amber-50 border-b border-amber-100 flex justify-between items-center">
              <span className="text-sm text-amber-700">You have unsaved changes</span>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Budget'}
              </button>
            </div>
          )}

          {/* Personnel Direct Costs */}
          <div className="border-b border-secondary-100">
            <div className="bg-[#1a5276] text-white px-4 py-2 font-semibold text-sm">
              Personnel Direct Costs
            </div>
            <table className="w-full text-sm">
              <thead className="bg-[#d4ac0d] text-white">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Section</th>
                  {[...Array(yearsInBudget)].map((_, i) => (
                    <th key={i} className="px-4 py-2 text-center font-medium" colSpan="3">
                      Year {i + 1}
                    </th>
                  ))}
                  <th className="px-4 py-2 text-right font-medium">Total Funds Requested</th>
                </tr>
                <tr className="bg-[#d4ac0d]/80 text-xs">
                  <th></th>
                  {[...Array(yearsInBudget)].map((_, i) => (
                    <>
                      <th key={`${i}-p`} className="px-2 py-1 text-center"># Personnel</th>
                      <th key={`${i}-m`} className="px-2 py-1 text-center">Months</th>
                      <th key={`${i}-f`} className="px-2 py-1 text-center">Funds</th>
                    </>
                  ))}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {/* Senior/Key Personnel */}
                <tr className="bg-secondary-50">
                  <td className="px-4 py-2 font-medium" colSpan={1 + yearsInBudget * 3 + 1}>
                    A. Senior/Key Personnel
                  </td>
                </tr>
                {budget.personnel?.senior_key?.map((person, idx) => {
                  // Support both per-year (year_1, year_2) and flat (funds_per_year) formats
                  const getYearFunds = (y) => person[`year_${y + 1}`] ?? person.funds_per_year ?? 0
                  const getYearMonths = (y) => person[`year_${y + 1}_months`] ?? person.months_per_year
                  const totalFunds = [...Array(yearsInBudget)].reduce((sum, _, i) => sum + getYearFunds(i), 0)
                  return (
                  <tr key={idx} className="border-b border-secondary-100">
                    <td className="px-4 py-2 pl-8">{person.name} ({person.role})</td>
                    {[...Array(yearsInBudget)].map((_, yearIdx) => (
                      <>
                        <td key={`${yearIdx}-p`} className="px-2 py-2 text-center">1</td>
                        <td key={`${yearIdx}-m`} className="px-2 py-2 text-center">{getYearMonths(yearIdx)?.toFixed(2)}</td>
                        <td key={`${yearIdx}-f`} className="px-2 py-2 text-center">{formatCurrency(getYearFunds(yearIdx))}</td>
                      </>
                    ))}
                    <td className="px-4 py-2 text-right font-medium">
                      {formatCurrency(totalFunds)}
                    </td>
                  </tr>
                )})}

                {/* Other Personnel */}
                <tr className="bg-secondary-50">
                  <td className="px-4 py-2 font-medium" colSpan={1 + yearsInBudget * 3 + 1}>
                    B. Other Personnel
                  </td>
                </tr>
                {budget.personnel?.other?.map((person, idx) => {
                  // Support both per-year (year_1, year_2) and flat (funds_per_year) formats
                  const getYearFunds = (y) => person[`year_${y + 1}`] ?? person.funds_per_year ?? 0
                  const getYearFte = (y) => person[`year_${y + 1}_fte`] ?? person.fte ?? 1
                  const totalFunds = [...Array(yearsInBudget)].reduce((sum, _, i) => sum + getYearFunds(i), 0)
                  return (
                  <tr key={idx} className="border-b border-secondary-100">
                    <td className="px-4 py-2 pl-8">{person.title || person.category}</td>
                    {[...Array(yearsInBudget)].map((_, yearIdx) => (
                      <>
                        <td key={`${yearIdx}-p`} className="px-2 py-2 text-center">1</td>
                        <td key={`${yearIdx}-m`} className="px-2 py-2 text-center">{(getYearFte(yearIdx) * 12).toFixed(2)}</td>
                        <td key={`${yearIdx}-f`} className="px-2 py-2 text-center">{formatCurrency(getYearFunds(yearIdx))}</td>
                      </>
                    ))}
                    <td className="px-4 py-2 text-right font-medium">
                      {formatCurrency(totalFunds)}
                    </td>
                  </tr>
                )})}

                {/* Fringe Benefits */}
                <tr className="bg-secondary-50">
                  <td className="px-4 py-2 font-medium">C. Fringe Benefits ({(budget.fringe_benefits?.rate * 100 || 0)}%)</td>
                  {[...Array(yearsInBudget)].map((_, yearIdx) => (
                    <>
                      <td key={`${yearIdx}-p`} className="px-2 py-2"></td>
                      <td key={`${yearIdx}-m`} className="px-2 py-2"></td>
                      <td key={`${yearIdx}-f`} className="px-2 py-2 text-center">{formatCurrency(budget.summary?.[`year_${yearIdx + 1}`]?.fringe_benefits ?? budget.fringe_benefits?.funds_per_year)}</td>
                    </>
                  ))}
                  <td className="px-4 py-2 text-right font-medium">
                    {formatCurrency(budget.summary?.total?.fringe_benefits)}
                  </td>
                </tr>

                {/* Total Salaries */}
                <tr className="bg-[#d4ac0d]/20 font-medium">
                  <td className="px-4 py-2">Total Salaries, Wages & Fringe Benefits (A-C)</td>
                  {[...Array(yearsInBudget)].map((_, yearIdx) => (
                    <>
                      <td key={`${yearIdx}-p`} className="px-2 py-2"></td>
                      <td key={`${yearIdx}-m`} className="px-2 py-2"></td>
                      <td key={`${yearIdx}-f`} className="px-2 py-2 text-center">
                        {formatCurrency(
                          (budget.summary?.[`year_${yearIdx + 1}`]?.senior_personnel || 0) +
                          (budget.summary?.[`year_${yearIdx + 1}`]?.other_personnel || 0) +
                          (budget.summary?.[`year_${yearIdx + 1}`]?.fringe_benefits || 0)
                        )}
                      </td>
                    </>
                  ))}
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(
                      (budget.summary?.total?.senior_personnel || 0) +
                      (budget.summary?.total?.other_personnel || 0) +
                      (budget.summary?.total?.fringe_benefits || 0)
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Additional Direct Costs */}
          <div className="border-b border-secondary-100">
            <div className="bg-[#1a5276] text-white px-4 py-2 font-semibold text-sm">
              Additional Direct Costs
            </div>
            <table className="w-full text-sm">
              <thead className="bg-[#d4ac0d] text-white">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Section</th>
                  {[...Array(yearsInBudget)].map((_, i) => (
                    <th key={i} className="px-4 py-2 text-center font-medium">Year {i + 1}</th>
                  ))}
                  <th className="px-4 py-2 text-right font-medium">Total Funds Requested</th>
                </tr>
              </thead>
              <tbody>
                {/* Equipment */}
                <tr className="border-b border-secondary-100">
                  <td className="px-4 py-2 font-medium">D. Equipment</td>
                  {[...Array(yearsInBudget)].map((_, i) => (
                    <td key={i} className="px-4 py-2 text-center">$0</td>
                  ))}
                  <td className="px-4 py-2 text-right font-medium">$0</td>
                </tr>

                {/* Travel */}
                <tr className="bg-secondary-50">
                  <td className="px-4 py-2 font-medium">E. Travel</td>
                  {[...Array(yearsInBudget)].map((_, i) => (
                    <td key={i} className="px-4 py-2 text-center">
                      {formatCurrency(budget.summary?.[`year_${i + 1}`]?.travel)}
                    </td>
                  ))}
                  <td className="px-4 py-2 text-right font-medium">
                    {formatCurrency(budget.summary?.total?.travel)}
                  </td>
                </tr>
                {budget.travel?.domestic?.map((trip, idx) => (
                  <tr key={idx} className="border-b border-secondary-100 text-secondary-600">
                    <td className="px-4 py-2 pl-8 text-sm">{trip.description}</td>
                    {[...Array(yearsInBudget)].map((_, i) => (
                      <td key={i} className="px-4 py-2 text-center text-sm">
                        {formatCurrency(trip.funds_per_year)}
                      </td>
                    ))}
                    <td className="px-4 py-2 text-right text-sm">
                      {formatCurrency(trip.funds_per_year * yearsInBudget)}
                    </td>
                  </tr>
                ))}

                {/* Participant Support */}
                <tr className="border-b border-secondary-100">
                  <td className="px-4 py-2 font-medium">F. Participant Support Costs</td>
                  {[...Array(yearsInBudget)].map((_, i) => (
                    <td key={i} className="px-4 py-2 text-center">$0</td>
                  ))}
                  <td className="px-4 py-2 text-right font-medium">$0</td>
                </tr>

                {/* Other Direct Costs */}
                <tr className="bg-secondary-50">
                  <td className="px-4 py-2 font-medium">G. Other Direct Costs</td>
                  {[...Array(yearsInBudget)].map((_, i) => (
                    <td key={i} className="px-4 py-2 text-center">
                      {formatCurrency(budget.summary?.[`year_${i + 1}`]?.other_direct)}
                    </td>
                  ))}
                  <td className="px-4 py-2 text-right font-medium">
                    {formatCurrency(budget.summary?.total?.other_direct)}
                  </td>
                </tr>
                {budget.other_direct_costs?.map((cost, idx) => (
                  <tr key={idx} className="border-b border-secondary-100 text-secondary-600">
                    <td className="px-4 py-2 pl-8 text-sm">{cost.description}</td>
                    {[...Array(yearsInBudget)].map((_, i) => (
                      <td key={i} className="px-4 py-2 text-center text-sm">
                        {formatCurrency(cost.funds_per_year)}
                      </td>
                    ))}
                    <td className="px-4 py-2 text-right text-sm">
                      {formatCurrency(cost.funds_per_year * yearsInBudget)}
                    </td>
                  </tr>
                ))}

                {/* Total Direct */}
                <tr className="bg-[#d4ac0d]/20 font-medium">
                  <td className="px-4 py-2">H. Total Direct Costs (A-G)</td>
                  {[...Array(yearsInBudget)].map((_, i) => (
                    <td key={i} className="px-4 py-2 text-center">
                      {formatCurrency(budget.summary?.[`year_${i + 1}`]?.total_direct)}
                    </td>
                  ))}
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(budget.summary?.total?.total_direct)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Indirect Costs */}
          <div>
            <div className="bg-[#1a5276] text-white px-4 py-2 font-semibold text-sm">
              Indirect Costs
            </div>
            <table className="w-full text-sm">
              <thead className="bg-[#d4ac0d] text-white">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Section</th>
                  {[...Array(yearsInBudget)].map((_, i) => (
                    <th key={i} className="px-4 py-2 text-center font-medium">Year {i + 1}<br/><span className="text-xs font-normal">Rate x Base</span></th>
                  ))}
                  <th className="px-4 py-2 text-right font-medium">Total Funds Requested</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-secondary-100">
                  <td className="px-4 py-2 font-medium">I. Indirect Costs ({(budget.indirect_costs?.rate * 100 || 0)}% {budget.indirect_costs?.base?.toUpperCase()})</td>
                  {[...Array(yearsInBudget)].map((_, i) => (
                    <td key={i} className="px-4 py-2 text-center">
                      {formatCurrency(budget.summary?.[`year_${i + 1}`]?.indirect)}
                    </td>
                  ))}
                  <td className="px-4 py-2 text-right font-medium">
                    {formatCurrency(budget.summary?.total?.indirect)}
                  </td>
                </tr>

                {/* Grand Total */}
                <tr className="bg-[#1a5276] text-white font-bold">
                  <td className="px-4 py-3">J. Total Amount Requested (H + I)</td>
                  {[...Array(yearsInBudget)].map((_, i) => (
                    <td key={i} className="px-4 py-3 text-center">
                      {formatCurrency(budget.summary?.[`year_${i + 1}`]?.total)}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right text-lg">
                    {formatCurrency(budget.summary?.total?.total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Export hint */}
          <div className="p-4 bg-secondary-50 text-sm text-secondary-600">
            <p>💡 Use these values to fill the Research.gov budget form. Edit <code className="bg-white px-1 rounded">budget.yaml</code> locally and run <code className="bg-white px-1 rounded">grantkit sync push</code> to update.</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Grant detail view
function GrantDetail({ onArchive, onRestore, showArchived }) {
  const { grantId } = useParams()
  const navigate = useNavigate()
  const [grant, setGrant] = useState(null)
  const [responses, setResponses] = useState([])
  const [internalDocs, setInternalDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [shareUrl, setShareUrl] = useState(null)
  const [shareCopied, setShareCopied] = useState(false)
  const [showNewDocForm, setShowNewDocForm] = useState(false)
  const [showPermissions, setShowPermissions] = useState(false)

  useEffect(() => {
    async function loadGrant() {
      setLoading(true)
      const { data: grantData } = await getGrant(grantId)
      const { data: responsesData } = await getResponses(grantId)
      const { data: docsData } = await getInternalDocuments(grantId)
      setGrant(grantData)
      setResponses(responsesData || [])
      setInternalDocs(docsData || [])
      // If grant already has share_token, show the URL
      if (grantData?.share_token) {
        setShareUrl(`${window.location.origin}/share/${grantData.share_token}`)
      }
      setLoading(false)
    }
    loadGrant()
  }, [grantId])

  const handleResponseUpdate = async (responseId, updates) => {
    await updateResponse(responseId, updates)
    const { data } = await getResponses(grantId)
    setResponses(data || [])
  }

  const handleInternalDocUpdate = async (docId, updates) => {
    await updateInternalDocument(docId, updates)
    const { data } = await getInternalDocuments(grantId)
    setInternalDocs(data || [])
  }

  const handleInternalDocDelete = async (docId) => {
    if (window.confirm('Delete this document?')) {
      await deleteInternalDocument(docId)
      const { data } = await getInternalDocuments(grantId)
      setInternalDocs(data || [])
    }
  }

  const handleCreateInternalDoc = async (docType) => {
    const title = docType === 'letter_request' ? 'New Letter Request'
      : docType === 'email' ? 'New Email Draft'
      : docType === 'budget' ? 'Budget Notes'
      : 'New Document'
    await createInternalDocument({
      grant_id: grantId,
      doc_type: docType,
      title: title,
      content: '',
      status: 'draft'
    })
    const { data } = await getInternalDocuments(grantId)
    setInternalDocs(data || [])
    setShowNewDocForm(false)
  }

  const handleShare = async () => {
    if (shareUrl) {
      // Already have a share URL, just copy it
      await copyToClipboard(shareUrl)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    } else {
      // Generate new share token
      const { error, token } = await generateShareToken(grantId)
      if (!error && token) {
        const url = `${window.location.origin}/share/${token}`
        setShareUrl(url)
        await copyToClipboard(url)
        setShareCopied(true)
        setTimeout(() => setShareCopied(false), 2000)
      }
    }
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
            {showArchived ? (
              <button
                onClick={() => {
                  onRestore(grantId)
                  navigate('/')
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition-all"
              >
                <RotateCcw size={16} /> Restore
              </button>
            ) : (
              <button
                onClick={() => {
                  if (window.confirm('Archive this grant? You can restore it later.')) {
                    onArchive(grantId, 'other')
                    navigate('/')
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg font-medium text-sm hover:bg-secondary-200 transition-all"
              >
                <Archive size={16} /> Archive
              </button>
            )}
            <button
              onClick={() => setShowPermissions(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium text-sm hover:bg-purple-700 transition-all"
            >
              <Users size={16} /> Manage Access
            </button>
            <button
              onClick={handleShare}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all",
                shareCopied
                  ? "bg-green-600 text-white"
                  : "bg-primary-600 text-white hover:bg-primary-700"
              )}
            >
              {shareCopied ? <CheckCircle size={16} /> : <Share2 size={16} />}
              {shareCopied ? 'Link Copied!' : shareUrl ? 'Copy Link' : 'Share'}
            </button>
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

        {/* Expandable Metadata Section */}
        <GrantMetadataSection grant={grant} />
      </div>

      {/* Submission Checklist */}
      <SubmissionChecklist grant={grant} responses={responses} />

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

      {/* Internal Documents (Private - not shared) */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-secondary-800 flex items-center gap-2">
            <div className="p-2 bg-secondary-100 text-secondary-600 rounded-lg">
              <FileKey size={20} />
            </div>
            Internal Documents
            <span className="ml-2 text-xs font-normal text-secondary-400 bg-secondary-100 px-2 py-1 rounded">Private</span>
          </h2>
          <div className="relative">
            <button
              onClick={() => setShowNewDocForm(!showNewDocForm)}
              className="flex items-center gap-2 px-3 py-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              Add Document
            </button>
            {showNewDocForm && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-2 z-20">
                <button
                  onClick={() => handleCreateInternalDoc('letter_request')}
                  className="w-full px-4 py-2 text-left text-sm text-secondary-700 hover:bg-secondary-50 flex items-center gap-2"
                >
                  <Mail size={14} /> Letter Request
                </button>
                <button
                  onClick={() => handleCreateInternalDoc('email')}
                  className="w-full px-4 py-2 text-left text-sm text-secondary-700 hover:bg-secondary-50 flex items-center gap-2"
                >
                  <Send size={14} /> Email Draft
                </button>
                <button
                  onClick={() => handleCreateInternalDoc('budget')}
                  className="w-full px-4 py-2 text-left text-sm text-secondary-700 hover:bg-secondary-50 flex items-center gap-2"
                >
                  <FileText size={14} /> Budget Notes
                </button>
                <button
                  onClick={() => handleCreateInternalDoc('notes')}
                  className="w-full px-4 py-2 text-left text-sm text-secondary-700 hover:bg-secondary-50 flex items-center gap-2"
                >
                  <FileKey size={14} /> Other Notes
                </button>
              </div>
            )}
          </div>
        </div>

        {internalDocs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {internalDocs.map((doc) => (
              <InternalDocumentCard
                key={doc.id}
                doc={doc}
                onUpdate={handleInternalDocUpdate}
                onDelete={handleInternalDocDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white border border-secondary-200 border-dashed rounded-xl">
            <FileKey size={32} className="mx-auto mb-3 text-secondary-300" />
            <p className="text-secondary-500">No internal documents yet</p>
            <p className="text-sm text-secondary-400 mt-1">Add letter requests, email drafts, or budget notes</p>
          </div>
        )}
      </div>

      {/* Budget Form */}
      <BudgetForm grantId={grantId} />

      {/* Permissions Modal */}
      <PermissionsModal
        grantId={grantId}
        grant={grant}
        isOpen={showPermissions}
        onClose={() => setShowPermissions(false)}
        onGrantUpdate={async () => {
          // Refresh grant data when share link is created
          const { data } = await getGrant(grantId)
          if (data) {
            setGrant(data)
            if (data.share_token) {
              setShareUrl(`${window.location.origin}/share/${data.share_token}`)
            }
          }
        }}
      />
    </div>
  )
}

// Public grant view (no auth required)
function PublicGrantView() {
  const { shareToken } = useParams()
  const [grant, setGrant] = useState(null)
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadGrant() {
      setLoading(true)
      const { data: grantData, error: grantError } = await getGrantByShareToken(shareToken)
      if (grantError || !grantData) {
        setError('Grant not found or link has expired')
        setLoading(false)
        return
      }
      const { data: responsesData } = await getResponses(grantData.id)
      setGrant(grantData)
      setResponses(responsesData || [])
      setLoading(false)
    }
    loadGrant()
  }, [shareToken])

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-amber-500" />
          <h1 className="text-xl font-bold text-secondary-900 mb-2">{error}</h1>
          <a href="/" className="text-primary-600 hover:underline">Go to GrantKit</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Simple header for public view */}
      <header className="bg-white border-b border-secondary-200 py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="GrantKit" className="h-8 w-auto" />
            <span className="text-lg font-bold text-secondary-900">GrantKit</span>
            <span className="text-secondary-400">|</span>
            <span className="text-secondary-600">Shared Proposal</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 md:p-10">
        {/* Grant header */}
        <div className="bg-white rounded-2xl shadow-sm border border-secondary-200 p-8 mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-3">{grant.name}</h1>
          <div className="flex flex-wrap gap-2 items-center mb-6">
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
              <div className="text-xl font-bold text-secondary-900 capitalize">{grant.status?.replace('_', ' ')}</div>
            </div>
          </div>
        </div>

        {/* Responses (read-only) */}
        {responses.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-secondary-800 mb-6 flex items-center gap-2">
              <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                <FileText size={20} />
              </div>
              Application Responses
            </h2>
            <div className="space-y-6">
              {responses.map((response) => (
                <div key={response.id} className="bg-white rounded-xl border border-secondary-200 p-6">
                  <h3 className="text-lg font-bold text-secondary-900 mb-2">{response.title}</h3>
                  {response.question && (
                    <div className="bg-primary-50 border-l-4 border-primary-500 p-4 mb-4 rounded-r-lg">
                      <p className="text-primary-900 text-sm">{response.question}</p>
                    </div>
                  )}
                  <div className="markdown-content">
                    {response.content ? (
                      <ReactMarkdown>{response.content}</ReactMarkdown>
                    ) : (
                      <span className="italic text-secondary-400">No content yet</span>
                    )}
                  </div>
                  {(response.word_limit || response.char_limit) && (
                    <div className="mt-4 text-sm text-secondary-500">
                      {response.word_limit && `${response.content?.trim().split(/\s+/).filter(Boolean).length || 0} / ${response.word_limit} words`}
                      {response.char_limit && `${response.content?.length || 0} / ${response.char_limit} characters`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Domain configuration
const hostname = window.location.hostname
const DEV_MODE = hostname === 'localhost'
// Note: grantkit.io and app.grantkit.io both serve the app for now
// TODO: Set up separate landing page at grantkit.io

// Simple login page for app.grantkit.io
function LoginPage() {
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    await signInWithGoogle()
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary-50 to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-secondary-200 shadow-lg p-8 text-center">
        <img src="/logo.svg" alt="GrantKit" className="h-16 w-auto mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-secondary-900 mb-2">Welcome to GrantKit</h1>
        <p className="text-secondary-600 mb-8">
          Sign in to manage your grant applications.
        </p>
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>
        <p className="mt-6 text-sm text-secondary-500">
          <a href="https://grantkit.io" className="text-primary-600 hover:underline">Learn more about GrantKit</a>
        </p>
      </div>
    </div>
  )
}

// Authenticated app content
// Authenticated App - Redesigned with Technical Editorial aesthetic
function AuthenticatedApp({ session, onSignOut }) {
  const [grants, setGrants] = useState([])
  const [showArchived, setShowArchived] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const loadGrants = async () => {
      const { data } = showArchived ? await getArchivedGrants() : await getActiveGrants()
      setGrants(data || [])
    }
    loadGrants()
  }, [showArchived])

  const refreshGrants = async () => {
    const { data } = showArchived ? await getArchivedGrants() : await getActiveGrants()
    setGrants(data || [])
  }

  const handleArchive = async (grantId, reason = 'other') => {
    await archiveGrant(grantId, reason)
    refreshGrants()
  }

  const handleRestore = async (grantId) => {
    await restoreGrant(grantId, 'draft')
    refreshGrants()
  }

  const defaultGrant = grants.length > 0 ? grants[0].id : null

  return (
    <div className="min-h-screen hero-gradient text-secondary-900 flex">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 glass border-b border-midnight-100/50 z-30 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -ml-2 text-midnight-600 hover:text-midnight-900 hover:bg-midnight-100 rounded-xl transition-colors"
        >
          <Menu size={24} />
        </button>
        <a href="https://grantkit.io" className="flex items-center gap-2">
          <img src="/logo.svg" alt="GrantKit" className="h-8 w-auto rounded-lg" />
          <span className="font-bold text-midnight-900 tracking-tight">GrantKit</span>
        </a>
        <div className="w-10" />
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-midnight-900/60 backdrop-blur-sm z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-out Menu */}
      <aside className={cn(
        "md:hidden fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white z-50 transform transition-transform duration-300 overflow-y-auto shadow-2xl",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-5 border-b border-midnight-100 flex items-center justify-between sidebar-brand">
          <a href="https://grantkit.io" className="flex items-center gap-3">
            <div className="relative">
              <img src="/logo.svg" alt="GrantKit" className="h-10 w-auto rounded-xl" />
              <div className="absolute -inset-1 bg-electric-500/20 rounded-xl blur-lg -z-10" />
            </div>
            <span className="text-xl font-bold text-midnight-900 tracking-tight">GrantKit</span>
          </a>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-midnight-400 hover:text-midnight-600 hover:bg-midnight-100 rounded-xl transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-4 border-b border-midnight-100">
          <p className="text-xs text-midnight-500 font-semibold tracking-wider uppercase mb-3 flex items-center gap-2">
            <FolderOpen size={12} />
            Grant Applications
          </p>
          <div className="flex gap-2 p-1 bg-midnight-100 rounded-xl">
            <button
              onClick={() => setShowArchived(false)}
              className={cn(
                "flex-1 px-4 py-2 text-xs font-medium rounded-lg transition-all",
                !showArchived
                  ? "bg-white text-midnight-900 shadow-sm"
                  : "text-midnight-500 hover:text-midnight-700"
              )}
            >
              Active
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={cn(
                "flex-1 px-4 py-2 text-xs font-medium rounded-lg transition-all",
                showArchived
                  ? "bg-white text-midnight-900 shadow-sm"
                  : "text-midnight-500 hover:text-midnight-700"
              )}
            >
              <Archive size={12} className="inline mr-1" />
              Archived
            </button>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {grants.map((grant, index) => (
            <NavLink
              key={grant.id}
              to={`/${grant.id}`}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  "block px-4 py-3 rounded-xl text-sm transition-all animate-fade-in",
                  isActive
                    ? "bg-white text-midnight-900 font-medium shadow-md"
                    : "text-midnight-600 hover:bg-midnight-50"
                )
              }
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="truncate font-medium">{grant.name}</div>
              <div className="text-xs text-midnight-400 mt-0.5 truncate">{grant.foundation}</div>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-midnight-100 mt-auto bg-midnight-50/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-electric-500/20 to-electric-500/5 rounded-xl flex items-center justify-center border border-electric-500/20">
              <User size={16} className="text-electric-600" />
            </div>
            <div className="flex-1 min-w-0 text-sm text-midnight-700 truncate font-medium">
              {session.user.email}
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="w-full btn btn-ghost text-sm"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="w-80 h-screen fixed overflow-y-auto hidden md:flex flex-col z-20 border-r border-midnight-100 bg-white/80 backdrop-blur-xl">
        <div className="p-6 border-b border-midnight-100 sticky top-0 bg-white/95 backdrop-blur z-10 sidebar-brand">
          <a
            href="https://grantkit.io"
            className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity"
            title="GrantKit home"
          >
            <div className="relative">
              <img src="/logo.svg" alt="GrantKit" className="h-10 w-auto rounded-xl" />
              <div className="absolute -inset-1 bg-electric-500/20 rounded-xl blur-lg -z-10" />
            </div>
            <span className="text-xl font-bold text-midnight-900 tracking-tight">GrantKit</span>
          </a>
          <p className="text-xs text-midnight-500 font-semibold tracking-wider uppercase mb-3 flex items-center gap-2">
            <FolderOpen size={12} />
            Grant Applications
          </p>
          <div className="flex gap-2 p-1 bg-midnight-100 rounded-xl">
            <button
              onClick={() => setShowArchived(false)}
              className={cn(
                "flex-1 px-4 py-2 text-xs font-medium rounded-lg transition-all",
                !showArchived
                  ? "bg-white text-midnight-900 shadow-sm"
                  : "text-midnight-500 hover:text-midnight-700"
              )}
            >
              Active
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={cn(
                "flex-1 px-4 py-2 text-xs font-medium rounded-lg transition-all",
                showArchived
                  ? "bg-white text-midnight-900 shadow-sm"
                  : "text-midnight-500 hover:text-midnight-700"
              )}
            >
              <Archive size={12} className="inline mr-1" />
              Archived
            </button>
          </div>
        </div>

        <nav className="p-3 flex-1 space-y-1 overflow-y-auto scrollbar-hide">
          {grants.map((grant, index) => (
            <NavLink
              key={grant.id}
              to={`/${grant.id}`}
              className={({ isActive }) =>
                cn(
                  "block px-4 py-3 rounded-xl text-sm transition-all duration-200 group animate-fade-in",
                  isActive
                    ? "bg-white text-midnight-900 font-medium shadow-md border border-midnight-100"
                    : "text-midnight-600 hover:bg-midnight-50 hover:text-midnight-900"
                )
              }
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                  "bg-midnight-100 text-midnight-500 group-hover:bg-electric-500/10 group-hover:text-electric-600"
                )}>
                  <FileText size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium leading-snug">{grant.name}</div>
                  <div className="text-xs mt-0.5 truncate text-midnight-400 group-hover:text-midnight-500">
                    {grant.foundation}
                  </div>
                </div>
              </div>
            </NavLink>
          ))}

          {grants.length === 0 && (
            <div className="text-center py-12 text-midnight-400">
              <div className="w-12 h-12 rounded-2xl bg-midnight-100 flex items-center justify-center mx-auto mb-3">
                <FolderOpen size={24} className="text-midnight-300" />
              </div>
              <p className="text-sm font-medium">No grants yet</p>
              <p className="text-xs text-midnight-300 mt-1">Create one to get started</p>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-midnight-100 bg-midnight-50/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-electric-500/20 to-electric-500/5 rounded-xl flex items-center justify-center border border-electric-500/20">
              <User size={16} className="text-electric-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-midnight-700 truncate">
                {session.user.email}
              </div>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="w-full btn btn-ghost text-sm"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-80 min-h-screen pt-16 md:pt-0">
        <div className="max-w-7xl mx-auto p-6 md:p-10 lg:p-12">
          <Routes>
            <Route path="/" element={defaultGrant ? <Navigate to={`/${defaultGrant}`} replace /> : (
              <div className="text-center py-24">
                <div className="w-16 h-16 rounded-2xl bg-midnight-100 flex items-center justify-center mx-auto mb-4">
                  <FolderOpen size={32} className="text-midnight-300" />
                </div>
                <p className="text-lg font-medium text-midnight-500">No grants yet</p>
                <p className="text-midnight-400 mt-1">Create your first grant to get started</p>
              </div>
            )} />
            <Route path="/:grantId" element={<GrantDetail onArchive={handleArchive} onRestore={handleRestore} showArchived={showArchived} />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

// Device Auth page for CLI OAuth flow
function DeviceAuthPage() {
  // Get device code from URL
  const searchParams = new URLSearchParams(window.location.search)
  const deviceCode = searchParams.get('code')

  // Initialize state based on device code presence
  const [status, setStatus] = useState(deviceCode ? 'loading' : 'error')
  const [error, setError] = useState(deviceCode ? null : 'No device code provided. Please start authentication from the CLI.')
  const [session, setSession] = useState(null)

  useEffect(() => {
    if (!deviceCode) {
      return
    }

    // Check if already logged in
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (existingSession) {
        setSession(existingSession)
        setStatus('authorizing')
      } else {
        setStatus('signing_in')
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === 'SIGNED_IN' && newSession) {
        setSession(newSession)
        setStatus('authorizing')
      }
    })

    return () => subscription.unsubscribe()
  }, [deviceCode])

  // When we have a session, complete the device auth
  useEffect(() => {
    const completeAuth = async () => {
      try {
        // The CLI creates the device code - we just complete it
        const { data, error: completeError } = await completeDeviceAuth(deviceCode, session)

        if (completeError) {
          // Might be expired or already used
          if (completeError.message?.includes('No rows') || completeError.code === 'PGRST116') {
            setError('Device code expired or already used. Please run "grantkit auth login" again.')
          } else {
            setError(completeError.message)
          }
          setStatus('error')
        } else if (!data) {
          // No data returned - device code not found or not in pending state
          setError('Device code not found or already used. Please run "grantkit auth login" again.')
          setStatus('error')
        } else {
          setStatus('success')
        }
      } catch (err) {
        setError(err.message)
        setStatus('error')
      }
    }

    if (status === 'authorizing' && session && deviceCode) {
      completeAuth()
    }
  }, [status, session, deviceCode])

  const handleSignIn = async () => {
    setStatus('signing_in')
    // Redirect back to this page after auth
    const redirectUrl = window.location.href
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl },
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary-50 to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-secondary-200 shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Terminal className="w-8 h-8" />
        </div>

        {status === 'loading' && (
          <>
            <h1 className="text-2xl font-bold text-secondary-900 mb-3">
              CLI Authentication
            </h1>
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600 mx-auto" />
          </>
        )}

        {status === 'signing_in' && (
          <>
            <h1 className="text-2xl font-bold text-secondary-900 mb-3">
              Sign in to authorize CLI
            </h1>
            <p className="text-secondary-600 mb-6">
              Sign in with Google to authorize the GrantKit CLI on your device.
            </p>
            <button
              onClick={handleSignIn}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          </>
        )}

        {status === 'authorizing' && (
          <>
            <h1 className="text-2xl font-bold text-secondary-900 mb-3">
              Authorizing...
            </h1>
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600 mx-auto" />
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-secondary-900 mb-3">
              CLI Authorized!
            </h1>
            <p className="text-secondary-600 mb-6">
              You can close this window and return to your terminal.
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-secondary-900 mb-3">
              Authorization Failed
            </h1>
            <p className="text-red-600 mb-6">
              {error || 'Something went wrong. Please try again.'}
            </p>
            <p className="text-secondary-500 text-sm">
              Run <code className="bg-secondary-100 px-2 py-1 rounded">grantkit auth login</code> to try again.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

// Waitlist page for non-PolicyEngine users
function WaitlistPage({ email, onSignOut }) {
  const [submitted, setSubmitted] = useState(false)

  const handleJoinWaitlist = async () => {
    // Store email in waitlist (we'll add the table)
    try {
      await supabase.from('waitlist').insert({ email })
    } catch {
      // Ignore errors (might already exist)
    }
    setSubmitted(true)
    // Sign them out after a delay
    setTimeout(() => {
      onSignOut()
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary-50 to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-secondary-200 shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-secondary-900 mb-3">
          Thanks for your interest!
        </h1>
        <p className="text-secondary-600 mb-6">
          GrantKit is currently in private beta. We'll notify you at <strong>{email}</strong> when we open up access.
        </p>
        {!submitted ? (
          <button
            onClick={handleJoinWaitlist}
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
          >
            Join the waitlist
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
            <Check className="w-5 h-5" />
            You're on the list!
          </div>
        )}
        <button
          onClick={onSignOut}
          className="mt-4 text-sm text-secondary-500 hover:text-secondary-700"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

// Check if email is allowed (PolicyEngine domain)
const isAllowedEmail = (email) => {
  return email?.endsWith('@policyengine.org')
}

// Main App
function App() {
  const [session, setSession] = useState(DEV_MODE ? { user: { email: 'dev@localhost' } } : null)
  const [loading, setLoading] = useState(!DEV_MODE)

  useEffect(() => {
    if (DEV_MODE) {
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await signOut()
  }

  // Marketing domain (grantkit.io) always shows landing page
  // App domain (app.grantkit.io) shows the authenticated app
  return (
    <Router>
      <Routes>
        {/* Public share route - works on both domains */}
        <Route path="/share/:shareToken" element={<PublicGrantView />} />

        {/* CLI device auth route */}
        <Route path="/auth/device" element={<DeviceAuthPage />} />

        {/* All other routes depend on auth state */}
        <Route path="*" element={
          loading ? (
            <div className="min-h-screen flex items-center justify-center bg-secondary-50">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
            </div>
          ) : !session ? (
            // Not logged in - show simple login (landing page is on grantkit.io)
            <LoginPage />
          ) : !isAllowedEmail(session.user?.email) ? (
            // Non-PolicyEngine users see waitlist
            <WaitlistPage email={session.user?.email} onSignOut={handleSignOut} />
          ) : (
            // PolicyEngine users with session see the app
            <AuthenticatedApp session={session} onSignOut={handleSignOut} />
          )
        } />
      </Routes>
    </Router>
  )
}

export default App
