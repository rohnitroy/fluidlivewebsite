import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import MarkdownEditor from '../components/MarkdownEditor'

export default function AdminBlogEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    excerpt: '',
    readTime: '',
    published: true
  })
  const [status, setStatus] = useState({ type: '', message: '' })
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(true)

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001'

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('blog_token')
    if (!token) {
      navigate('/admin/blog', { replace: true })
      return
    }

    // If editing, fetch the post
    if (isEditing) {
      fetchPost(token)
    } else {
      setLoading(false)
    }
  }, [id, navigate])

  const fetchPost = async (token) => {
    try {
      const res = await fetch(`${backendUrl}/api/blog/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok && data.success) {
        const post = data.post
        setFormData({
          title: post.title,
          content: post.content,
          category: post.category,
          excerpt: post.excerpt,
          readTime: post.readTime,
          published: post.published
        })
      } else {
        setStatus({ type: 'error', message: 'Post not found' })
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to load post' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      setStatus({ type: 'error', message: 'Title and content are required.' })
      return
    }

    setSaving(true)
    setStatus({ type: '', message: '' })
    const token = localStorage.getItem('blog_token')

    try {
      const url = isEditing
        ? `${backendUrl}/api/blog/${id}`
        : `${backendUrl}/api/blog`
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      const data = await res.json()

      if (res.ok) {
        setStatus({ type: 'success', message: isEditing ? 'Post updated!' : 'Post published!' })
        setTimeout(() => navigate('/admin/blog'), 1000)
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to save post' })
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to connect to server' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-20 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/blog')}
                className="text-gray-500 hover:text-gray-700 transition p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-lg font-medium text-gray-900">
                {isEditing ? 'Edit Post' : 'New Post'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {status.message && (
                <span className={`text-sm ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {status.message}
                </span>
              )}
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition ${showPreview ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
              >
                {showPreview ? 'Editor' : 'Preview'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary text-sm px-5 py-2 disabled:opacity-50"
              >
                {saving ? 'Saving...' : isEditing ? 'Update' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showPreview ? (
          /* Preview Mode */
          <div className="max-w-3xl mx-auto bg-white rounded-xl border border-gray-200 p-8 sm:p-12 min-h-[70vh]">
            <span className="text-xs font-semibold tracking-wider uppercase" style={{color: '#4F8CFF'}}>
              {formData.category || 'CATEGORY'}
            </span>
            <h1 className="text-4xl font-medium text-gray-900 mt-3 mb-4" style={{letterSpacing: '-0.02em'}}>
              {formData.title || 'Untitled Post'}
            </h1>
            <p className="text-sm text-gray-500 mb-8">
              {formData.readTime || '5 min read'} · Preview
            </p>
            <div className="border-t border-gray-100 pt-8">
              {formData.content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={previewComponents}>
                  {formData.content}
                </ReactMarkdown>
              ) : (
                <p className="text-gray-400 italic">No content yet...</p>
              )}
            </div>
          </div>
        ) : (
          /* Editor Mode */
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Title */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full text-3xl font-medium text-gray-900 placeholder-gray-300 focus:outline-none"
                style={{letterSpacing: '-0.02em'}}
                placeholder="Post title..."
              />
            </div>

            {/* Meta */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="AI STRATEGY">AI Strategy</option>
                    <option value="AI THINKING">AI Thinking</option>
                    <option value="CASE STUDY">Case Study</option>
                    <option value="TECHNOLOGY">Technology</option>
                    <option value="DESIGN">Design</option>
                    <option value="BUSINESS">Business</option>
                    <option value="GENERAL">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Read Time</label>
                  <input
                    type="text"
                    value={formData.readTime}
                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="5 min read"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Excerpt</label>
                  <input
                    type="text"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Auto-generated if empty"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg w-full">
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Published</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Content Editor */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-xs font-medium text-gray-500 mb-3">Content (Markdown)</label>
              <MarkdownEditor
                value={formData.content}
                onChange={(val) => setFormData({ ...formData, content: val })}
                placeholder="Start writing your blog post..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Preview components matching site theme
const previewComponents = {
  h1: ({ children }) => <h1 className="text-3xl font-medium text-gray-900 mt-10 mb-5" style={{letterSpacing: '-0.02em'}}>{children}</h1>,
  h2: ({ children }) => <h2 className="text-2xl font-medium text-gray-900 mt-8 mb-4" style={{letterSpacing: '-0.02em'}}>{children}</h2>,
  h3: ({ children }) => <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3" style={{letterSpacing: '-0.02em'}}>{children}</h3>,
  h4: ({ children }) => <h4 className="text-lg font-medium text-gray-900 mt-5 mb-2" style={{letterSpacing: '-0.02em'}}>{children}</h4>,
  p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-5 text-lg">{children}</p>,
  a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-4" style={{color: '#4F8CFF'}}>{children}</a>,
  ul: ({ children }) => <ul className="space-y-2 mb-5 ml-1">{children}</ul>,
  ol: ({ children }) => <ol className="space-y-2 mb-5 ml-1 list-decimal list-inside">{children}</ol>,
  li: ({ children }) => (
    <li className="text-gray-700 text-lg flex items-start gap-3">
      <span className="mt-2.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{backgroundColor: '#4F8CFF'}}></span>
      <span>{children}</span>
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 pl-5 py-2 my-6 bg-blue-50 rounded-r-lg pr-5" style={{borderColor: '#4F8CFF'}}>
      <div className="text-gray-700 italic text-lg">{children}</div>
    </blockquote>
  ),
  code: ({ inline, children }) => {
    if (inline) return <code className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded text-sm font-mono">{children}</code>
    return (
      <pre className="bg-gray-900 text-gray-100 rounded-xl p-5 overflow-x-auto mb-5">
        <code className="text-sm font-mono leading-relaxed">{children}</code>
      </pre>
    )
  },
  pre: ({ children }) => <>{children}</>,
  hr: () => <hr className="my-8 border-gray-200" />,
  strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
  em: ({ children }) => <em className="italic text-gray-600">{children}</em>,
  table: ({ children }) => (
    <div className="overflow-x-auto mb-5 rounded-xl border border-gray-200">
      <table className="w-full text-left">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-gray-50 border-b border-gray-200">{children}</thead>,
  th: ({ children }) => <th className="px-5 py-3 text-sm font-semibold text-gray-900">{children}</th>,
  td: ({ children }) => <td className="px-5 py-3 text-gray-700 border-b border-gray-100">{children}</td>,
}
