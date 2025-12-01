import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink, useParams, Navigate, useNavigate } from 'react-router-dom'
import { FileText, ExternalLink, AlertTriangle, CheckCircle, Circle, Copy, LogOut, User, Terminal, Globe, ShieldCheck, X, Check, Minus, Download, Edit3, Shield, Upload, ArrowRight, Share2, Link, Mail, FileKey, Plus, Trash2, Send, Archive, RotateCcw, Menu, DollarSign, Save } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'
import { supabase, signInWithGoogle, signOut, getGrant, getResponses, updateResponse, getGrantByShareToken, generateShareToken, getInternalDocuments, createInternalDocument, updateInternalDocument, deleteInternalDocument, completeDeviceAuth, archiveGrant, restoreGrant, getActiveGrants, getArchivedGrants, getBudget, updateBudget } from './lib/supabase'

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
                {budget.personnel?.senior_key?.map((person, idx) => (
                  <tr key={idx} className="border-b border-secondary-100">
                    <td className="px-4 py-2 pl-8">{person.name} ({person.role})</td>
                    {[...Array(yearsInBudget)].map((_, yearIdx) => (
                      <>
                        <td key={`${yearIdx}-p`} className="px-2 py-2 text-center">1</td>
                        <td key={`${yearIdx}-m`} className="px-2 py-2 text-center">{person.months_per_year?.toFixed(2)}</td>
                        <td key={`${yearIdx}-f`} className="px-2 py-2 text-center">{formatCurrency(person.funds_per_year)}</td>
                      </>
                    ))}
                    <td className="px-4 py-2 text-right font-medium">
                      {formatCurrency(person.funds_per_year * yearsInBudget)}
                    </td>
                  </tr>
                ))}

                {/* Other Personnel */}
                <tr className="bg-secondary-50">
                  <td className="px-4 py-2 font-medium" colSpan={1 + yearsInBudget * 3 + 1}>
                    B. Other Personnel
                  </td>
                </tr>
                {budget.personnel?.other?.map((person, idx) => (
                  <tr key={idx} className="border-b border-secondary-100">
                    <td className="px-4 py-2 pl-8">{person.title || person.category}</td>
                    {[...Array(yearsInBudget)].map((_, yearIdx) => (
                      <>
                        <td key={`${yearIdx}-p`} className="px-2 py-2 text-center">1</td>
                        <td key={`${yearIdx}-m`} className="px-2 py-2 text-center">{((person.fte || 1) * 12).toFixed(2)}</td>
                        <td key={`${yearIdx}-f`} className="px-2 py-2 text-center">{formatCurrency(person.funds_per_year)}</td>
                      </>
                    ))}
                    <td className="px-4 py-2 text-right font-medium">
                      {formatCurrency(person.funds_per_year * yearsInBudget)}
                    </td>
                  </tr>
                ))}

                {/* Fringe Benefits */}
                <tr className="bg-secondary-50">
                  <td className="px-4 py-2 font-medium">C. Fringe Benefits ({(budget.fringe_benefits?.rate * 100 || 0)}%)</td>
                  {[...Array(yearsInBudget)].map((_, yearIdx) => (
                    <>
                      <td key={`${yearIdx}-p`} className="px-2 py-2"></td>
                      <td key={`${yearIdx}-m`} className="px-2 py-2"></td>
                      <td key={`${yearIdx}-f`} className="px-2 py-2 text-center">{formatCurrency(budget.fringe_benefits?.funds_per_year)}</td>
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
            <img src="/logo-icon.jpeg" alt="GrantKit" className="h-8 w-auto" />
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
const isMarketingDomain = hostname === 'grantkit.io' || hostname === 'www.grantkit.io'

// Redirect marketing domain to static website
if (isMarketingDomain && typeof window !== 'undefined') {
  window.location.replace('https://grantkit.io')
}

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
        <img src="/logo-icon.jpeg" alt="GrantKit" className="h-16 w-auto mx-auto mb-6" />
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
    <div className="min-h-screen bg-secondary-50 font-sans text-secondary-900 flex">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-secondary-200 z-30 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -ml-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg"
        >
          <Menu size={24} />
        </button>
        <a href="https://grantkit.io" className="flex items-center gap-2">
          <img src="/logo-icon.jpeg" alt="GrantKit" className="h-8 w-auto" />
          <span className="font-bold text-secondary-900">GrantKit</span>
        </a>
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-out Menu */}
      <aside className={cn(
        "md:hidden fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white z-50 transform transition-transform duration-300 overflow-y-auto",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 border-b border-secondary-100 flex items-center justify-between">
          <a href="https://grantkit.io" className="flex items-center gap-2">
            <img src="/logo-icon.jpeg" alt="GrantKit" className="h-10 w-auto" />
            <span className="text-xl font-bold text-secondary-900">GrantKit</span>
          </a>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-secondary-500 hover:text-secondary-900"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-4 border-b border-secondary-100">
          <p className="text-xs text-secondary-500 font-semibold tracking-wider uppercase mb-3">Grant Applications</p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowArchived(false)}
              className={cn(
                "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                !showArchived ? "bg-primary-100 text-primary-700" : "text-secondary-500 hover:bg-secondary-100"
              )}
            >
              Active
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={cn(
                "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                showArchived ? "bg-primary-100 text-primary-700" : "text-secondary-500 hover:bg-secondary-100"
              )}
            >
              Archived
            </button>
          </div>
        </div>
        <nav className="p-3">
          {grants.map((grant) => (
            <NavLink
              key={grant.id}
              to={`/${grant.id}`}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  "block px-3 py-2.5 rounded-lg text-sm transition-all",
                  isActive ? "bg-primary-50 text-primary-800 font-semibold" : "text-secondary-600"
                )
              }
            >
              <div className="truncate">{grant.name}</div>
              <div className="text-xs text-secondary-400">{grant.foundation}</div>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-secondary-100 mt-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-secondary-200 rounded-full flex items-center justify-center">
              <User size={16} className="text-secondary-600" />
            </div>
            <div className="flex-1 min-w-0 text-sm text-secondary-900 truncate">
              {session.user.email}
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-secondary-600 hover:bg-secondary-100 rounded-lg text-sm"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="w-80 bg-white border-r border-secondary-200 h-screen fixed overflow-y-auto hidden md:flex flex-col z-20 shadow-sm">
        <div className="p-6 border-b border-secondary-100 sticky top-0 bg-white/95 backdrop-blur z-10">
          <a
            href="https://grantkit.io"
            className="flex items-center gap-3 mb-1 hover:opacity-80 transition-opacity"
            title="GrantKit home"
          >
            <img src="/logo-icon.jpeg" alt="GrantKit" className="h-10 w-auto" />
            <span className="text-xl font-bold text-secondary-900">GrantKit</span>
          </a>
          <p className="text-xs text-secondary-500 font-semibold tracking-wider uppercase ml-1">Grant Applications</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setShowArchived(false)}
              className={cn(
                "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                !showArchived
                  ? "bg-primary-100 text-primary-700"
                  : "text-secondary-500 hover:bg-secondary-100"
              )}
            >
              Active
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={cn(
                "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                showArchived
                  ? "bg-primary-100 text-primary-700"
                  : "text-secondary-500 hover:bg-secondary-100"
              )}
            >
              Archived
            </button>
          </div>
        </div>

        <nav className="p-3 flex-1">
          {grants.map((grant) => (
            <NavLink
              key={grant.id}
              to={`/${grant.id}`}
              className={({ isActive }) =>
                cn(
                  "block px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group border border-transparent",
                  isActive
                    ? "bg-primary-50 text-primary-800 font-semibold shadow-sm border-primary-100"
                    : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
                )
              }
            >
              <div className="truncate leading-snug">{grant.name}</div>
              <div className="text-xs mt-0.5 truncate text-secondary-400 group-hover:text-secondary-500">
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
            onClick={onSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors text-sm font-medium"
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
            <Route path="/" element={defaultGrant ? <Navigate to={`/${defaultGrant}`} replace /> : <div className="text-center py-20 text-secondary-400">No grants yet</div>} />
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
            // Not logged in - show login page
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
