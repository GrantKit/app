import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink, useParams, Navigate, useNavigate } from 'react-router-dom'
import { FileText, ExternalLink, AlertTriangle, CheckCircle, Circle, Copy, LogOut, User, Terminal, Globe, ShieldCheck, X, Check, Minus, Download, Edit3, Shield, Upload, ArrowRight, Share2, Link, Mail, FileKey, Plus, Trash2, Send, Archive, RotateCcw } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'
import { supabase, signInWithGoogle, signOut, getGrant, getResponses, updateResponse, getGrantByShareToken, generateShareToken, getInternalDocuments, createInternalDocument, updateInternalDocument, deleteInternalDocument, completeDeviceAuth, archiveGrant, restoreGrant, getActiveGrants, getArchivedGrants } from './lib/supabase'

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
      {/* Sidebar */}
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
      <main className="flex-1 md:ml-80 min-h-screen">
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
  const [status, setStatus] = useState('loading') // loading, signing_in, authorizing, success, error
  const [error, setError] = useState(null)
  const [session, setSession] = useState(null)

  // Get device code from URL
  const searchParams = new URLSearchParams(window.location.search)
  const deviceCode = searchParams.get('code')

  useEffect(() => {
    if (!deviceCode) {
      setStatus('error')
      setError('No device code provided. Please start authentication from the CLI.')
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
    if (status === 'authorizing' && session && deviceCode) {
      completeAuth()
    }
  }, [status, session, deviceCode])

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
    } catch (e) {
      setError(e.message)
      setStatus('error')
    }
  }

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
    } catch (e) {
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
