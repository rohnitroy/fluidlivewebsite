import { useRef } from 'react'

const toolbar = [
  { label: 'H1', prefix: '# ', suffix: '', block: true },
  { label: 'H2', prefix: '## ', suffix: '', block: true },
  { label: 'H3', prefix: '### ', suffix: '', block: true },
  { label: 'B', prefix: '**', suffix: '**', block: false, style: 'font-bold' },
  { label: 'I', prefix: '*', suffix: '*', block: false, style: 'italic' },
  { label: 'Quote', prefix: '> ', suffix: '', block: true },
  { label: 'Code', prefix: '`', suffix: '`', block: false },
  { label: 'Link', prefix: '[', suffix: '](url)', block: false },
  { label: '• List', prefix: '- ', suffix: '', block: true },
  { label: '1. List', prefix: '1. ', suffix: '', block: true },
  { label: '---', prefix: '\n---\n', suffix: '', block: true },
]

export default function MarkdownEditor({ value, onChange, placeholder }) {
  const textareaRef = useRef(null)

  const applyFormat = (item) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const beforeText = value.substring(0, start)
    const afterText = value.substring(end)

    let newText
    let cursorPos

    if (item.block) {
      // For block-level items, ensure we're on a new line
      const needsNewline = beforeText.length > 0 && !beforeText.endsWith('\n')
      const prefix = (needsNewline ? '\n' : '') + item.prefix
      const insertText = selectedText || 'text'
      newText = beforeText + prefix + insertText + item.suffix + afterText
      cursorPos = beforeText.length + prefix.length + insertText.length + item.suffix.length
    } else {
      const insertText = selectedText || 'text'
      newText = beforeText + item.prefix + insertText + item.suffix + afterText
      cursorPos = beforeText.length + item.prefix.length + insertText.length
    }

    onChange(newText)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      if (!selectedText) {
        // Select the placeholder text for easy replacement
        const selectStart = beforeText.length + item.prefix.length + (item.block && beforeText.length > 0 && !beforeText.endsWith('\n') ? 1 : 0)
        textarea.setSelectionRange(selectStart, selectStart + (selectedText || 'text').length)
      } else {
        textarea.setSelectionRange(cursorPos, cursorPos)
      }
    }, 0)
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:border-blue-500 transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200">
        {toolbar.map((item, index) => (
          <button
            key={index}
            type="button"
            onClick={() => applyFormat(item)}
            className={`px-2.5 py-1 text-xs rounded hover:bg-gray-200 transition-colors text-gray-700 ${item.style || 'font-medium'}`}
            title={item.label}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows="20"
        className="w-full px-4 py-3 bg-white text-gray-900 placeholder-gray-400 focus:outline-none resize-y font-mono text-sm leading-relaxed min-h-[400px]"
        placeholder={placeholder || 'Write your content in Markdown...'}
      />
    </div>
  )
}
