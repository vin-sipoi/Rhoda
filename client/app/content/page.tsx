"use client"

import type React from "react"

import { Bell, List, LinkIcon, Quote, Italic, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useRef, useCallback, useEffect } from "react"

const scrollbarStyles = `
  .text-editor::-webkit-scrollbar {
    width: 8px;
  }
  .text-editor::-webkit-scrollbar-track {
    background: transparent;
  }
  .text-editor::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }
  .text-editor::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`

export default function RhodaEditor() {
  const [title, setTitle] = useState("Title")
  const [content, setContent] = useState("")
  const [wordCount, setWordCount] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const [isEditorFocused, setIsEditorFocused] = useState(false)
  const [showPlaceholder, setShowPlaceholder] = useState(true)
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const countWords = useCallback((text: string) => {
    if (!text || text.trim() === "") return 0
    const words = text
      .trim()
      .replace(/\s+/g, " ")
      .split(" ")
      .filter((word) => word.length > 0)
    return words.length
  }, [])

  const checkActiveFormats = useCallback(() => {
    const formats = new Set<string>()

    try {
      if (document.queryCommandState("bold")) formats.add("bold")
      if (document.queryCommandState("italic")) formats.add("italic")
      if (document.queryCommandValue("formatBlock") === "h2") formats.add("heading")

      // Better list detection
      if (document.queryCommandState("insertUnorderedList")) {
        formats.add("list")
      } else {
        // Alternative check - see if cursor is inside a list item
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          let node = selection.getRangeAt(0).commonAncestorContainer
          while (node && node !== contentRef.current) {
            if (node.nodeName === "LI" || node.nodeName === "UL") {
              formats.add("list")
              break
            }
            node = node.parentNode
          }
        }
      }
    } catch (e) {
      // Ignore errors from queryCommand
    }

    setActiveFormats(formats)
  }, [])

  const handleContentChange = (value: string) => {
    setContent(value)
    setWordCount(countWords(value))
    setShowPlaceholder(!value.trim())
  }

  const handleSelectionChange = useCallback(() => {
    checkActiveFormats()
  }, [checkActiveFormats])

  const handleEditorFocus = () => {
    setIsFocused(true)
    setIsEditorFocused(true)
    setShowPlaceholder(false)
    // Focus the textarea
    if (contentRef.current) {
      contentRef.current.focus()
    }
  }

  const handleEditorBlur = () => {
    setIsFocused(false)
    setIsEditorFocused(false)
    if (!content.trim()) {
      setShowPlaceholder(true)
    }
  }

  const applyFormat = (format: string) => {
    if (!contentRef.current) return

    const textarea = contentRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)

    let formattedText = ""
    let newContent = ""
    let cursorOffset = 0

    if (selectedText.trim()) {
      // Text is selected - apply formatting to selection
      switch (format) {
        case "bold":
          if (selectedText.startsWith("**") && selectedText.endsWith("**") && selectedText.length > 4) {
            // Remove bold formatting
            formattedText = selectedText.slice(2, -2)
            cursorOffset = formattedText.length
          } else {
            // Add bold formatting
            formattedText = `**${selectedText}**`
            cursorOffset = formattedText.length
          }
          break
        case "italic":
          if (
            selectedText.startsWith("*") &&
            selectedText.endsWith("*") &&
            selectedText.length > 2 &&
            !selectedText.startsWith("**")
          ) {
            // Remove italic formatting
            formattedText = selectedText.slice(1, -1)
            cursorOffset = formattedText.length
          } else {
            // Add italic formatting
            formattedText = `*${selectedText}*`
            cursorOffset = formattedText.length
          }
          break
        default:
          return
      }

      newContent = content.substring(0, start) + formattedText + content.substring(end)
    } else {
      // No text selected - insert formatting markers and place cursor between them
      switch (format) {
        case "bold":
          formattedText = "****"
          cursorOffset = 2 // Place cursor between the asterisks
          break
        case "italic":
          formattedText = "**"
          cursorOffset = 1 // Place cursor between the asterisks
          break
        default:
          return
      }

      newContent = content.substring(0, start) + formattedText + content.substring(end)
    }

    setContent(newContent)
    setWordCount(countWords(newContent))

    // Set cursor position
    setTimeout(() => {
      if (selectedText.trim()) {
        // If text was selected, place cursor at end of formatted text
        textarea.selectionStart = textarea.selectionEnd = start + cursorOffset
      } else {
        // If no text was selected, place cursor between formatting markers
        textarea.selectionStart = textarea.selectionEnd = start + cursorOffset
      }
      textarea.focus()
    }, 0)
  }

  const applyHeading = () => {
    if (!contentRef.current) return

    const textarea = contentRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd

    // Get all selected lines
    const beforeSelection = content.substring(0, start)
    const afterSelection = content.substring(end)
    const selectedText = content.substring(start, end)

    // Find the start of the first selected line
    const firstLineStart = beforeSelection.lastIndexOf("\n") + 1

    // Find the end of the last selected line
    const lastLineEndIndex = afterSelection.indexOf("\n")
    const lastLineEnd = lastLineEndIndex === -1 ? content.length : end + lastLineEndIndex

    // Get the full text that includes all affected lines
    const fullText = content.substring(firstLineStart, lastLineEnd)
    const lines = fullText.split("\n")

    // Process each line
    const processedLines = lines.map((line) => {
      if (line.startsWith("## ")) {
        // Remove heading
        return line.substring(3)
      } else if (line.trim()) {
        // Add heading (only to non-empty lines)
        return `## ${line}`
      }
      return line // Keep empty lines as is
    })

    const newText = processedLines.join("\n")
    const newContent = content.substring(0, firstLineStart) + newText + content.substring(lastLineEnd)

    setContent(newContent)
    setWordCount(countWords(newContent))

    // Maintain selection or cursor position
    setTimeout(() => {
      const lengthDiff = newText.length - fullText.length
      const newStart = Math.max(firstLineStart, start + lengthDiff)
      const newEnd = Math.max(firstLineStart, end + lengthDiff)

      textarea.selectionStart = newStart
      textarea.selectionEnd = selectedText ? newEnd : newStart
      textarea.focus()
    }, 0)
  }

  const toggleList = () => {
    if (!contentRef.current) return

    const textarea = contentRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd

    // Get all selected lines
    const beforeSelection = content.substring(0, start)
    const afterSelection = content.substring(end)

    // Find the start of the first selected line
    const firstLineStart = beforeSelection.lastIndexOf("\n") + 1

    // Find the end of the last selected line
    const lastLineEndIndex = afterSelection.indexOf("\n")
    const lastLineEnd = lastLineEndIndex === -1 ? content.length : end + lastLineEndIndex

    // Get the full text that includes all affected lines
    const fullText = content.substring(firstLineStart, lastLineEnd)
    const lines = fullText.split("\n")

    // Check if any line has bullets to determine action
    const hasBullets = lines.some((line) => line.match(/^[\s]*[•\-*]\s/))

    // Process each line
    const processedLines = lines.map((line) => {
      const trimmedLine = line.trim()

      if (!trimmedLine) return line // Keep empty lines as is

      if (hasBullets) {
        // Remove bullets
        return line.replace(/^(\s*)[•\-*]\s/, "$1")
      } else {
        // Add bullets, preserving indentation
        const leadingWhitespace = line.match(/^\s*/)?.[0] || ""
        const restOfLine = line.substring(leadingWhitespace.length)
        return `${leadingWhitespace}• ${restOfLine}`
      }
    })

    const newText = processedLines.join("\n")
    const newContent = content.substring(0, firstLineStart) + newText + content.substring(lastLineEnd)

    setContent(newContent)
    setWordCount(countWords(newContent))

    // Maintain selection or cursor position
    setTimeout(() => {
      const lengthDiff = newText.length - fullText.length
      const newStart = Math.max(firstLineStart, start + lengthDiff)
      const newEnd = Math.max(firstLineStart, end + lengthDiff)

      textarea.selectionStart = newStart
      textarea.selectionEnd = end > start ? newEnd : newStart
      textarea.focus()
    }, 0)
  }

  const applyQuote = () => {
    if (!contentRef.current) return

    const textarea = contentRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd

    // Get all selected lines
    const beforeSelection = content.substring(0, start)
    const afterSelection = content.substring(end)

    // Find the start of the first selected line
    const firstLineStart = beforeSelection.lastIndexOf("\n") + 1

    // Find the end of the last selected line
    const lastLineEndIndex = afterSelection.indexOf("\n")
    const lastLineEnd = lastLineEndIndex === -1 ? content.length : end + lastLineEndIndex

    // Get the full text that includes all affected lines
    const fullText = content.substring(firstLineStart, lastLineEnd)
    const lines = fullText.split("\n")

    // Check if any line has quotes to determine action
    const hasQuotes = lines.some((line) => line.match(/^[\s]*>\s/))

    // Process each line
    const processedLines = lines.map((line) => {
      const trimmedLine = line.trim()

      if (!trimmedLine) return line // Keep empty lines as is

      if (hasQuotes) {
        // Remove quotes
        return line.replace(/^(\s*)>\s/, "$1")
      } else {
        // Add quotes, preserving indentation
        const leadingWhitespace = line.match(/^\s*/)?.[0] || ""
        const restOfLine = line.substring(leadingWhitespace.length)
        return `${leadingWhitespace}> ${restOfLine}`
      }
    })

    const newText = processedLines.join("\n")
    const newContent = content.substring(0, firstLineStart) + newText + content.substring(lastLineEnd)

    setContent(newContent)
    setWordCount(countWords(newContent))

    // Maintain selection or cursor position
    setTimeout(() => {
      const lengthDiff = newText.length - fullText.length
      const newStart = Math.max(firstLineStart, start + lengthDiff)
      const newEnd = Math.max(firstLineStart, end + lengthDiff)

      textarea.selectionStart = newStart
      textarea.selectionEnd = end > start ? newEnd : newStart
      textarea.focus()
    }, 0)
  }

  const handleImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      // For textarea, we'll insert a placeholder text for the image
      const imagePlaceholder = `[Image: ${file.name}]`

      if (contentRef.current) {
        const textarea = contentRef.current
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const newContent = content.substring(0, start) + imagePlaceholder + content.substring(end)

        setContent(newContent)
        setWordCount(countWords(newContent))

        // Set cursor position after the inserted text
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + imagePlaceholder.length
          textarea.focus()
        }, 0)
      }
    }
    // Reset the input
    event.target.value = ""
  }

  const createLink = () => {
    if (!contentRef.current) return

    const textarea = contentRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)

    if (selectedText.trim()) {
      // Text is selected
      const url = prompt("Enter URL:")
      if (url) {
        const linkText = `[${selectedText}](${url})`
        const newContent = content.substring(0, start) + linkText + content.substring(end)

        setContent(newContent)
        setWordCount(countWords(newContent))

        // Set cursor position after the link
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + linkText.length
          textarea.focus()
        }, 0)
      }
    } else {
      // No text selected - insert link template
      const url = prompt("Enter URL:")
      if (url) {
        const linkText = prompt("Enter link text:") || "link text"
        const fullLink = `[${linkText}](${url})`
        const newContent = content.substring(0, start) + fullLink + content.substring(end)

        setContent(newContent)
        setWordCount(countWords(newContent))

        // Select the link text for easy editing
        setTimeout(() => {
          textarea.selectionStart = start + 1
          textarea.selectionEnd = start + 1 + linkText.length
          textarea.focus()
        }, 0)
      }
    }
  }

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "b":
            e.preventDefault()
            applyFormat("bold")
            break
          case "i":
            e.preventDefault()
            applyFormat("italic")
            break
          case "k":
            e.preventDefault()
            createLink()
            break
        }
      }
    }

    const handleSelectionChangeEvent = () => {
      if (isEditorFocused) {
        handleSelectionChange()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("selectionchange", handleSelectionChangeEvent)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("selectionchange", handleSelectionChangeEvent)
    }
  }, [isEditorFocused, handleSelectionChange])

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse 800px 600px at 50% 50%, #61b693 0%, transparent 70%),
          radial-gradient(ellipse 700px 500px at 15% 85%, #2c304c 0%, #2c304c 30%, transparent 60%),
          radial-gradient(ellipse 600px 500px at 85% 15%, #1f2020 0%, #1f2020 40%, transparent 70%),
          radial-gradient(ellipse 600px 500px at 85% 85%, #1e1e1e 0%, #1e1e1e 40%, transparent 70%),
          radial-gradient(ellipse 500px 400px at 10% 10%, #1e1e1e 0%, transparent 60%),
          linear-gradient(135deg, #1e1e1e 0%, #2c304c 25%, #3c6351 50%, #61b693 75%, #1f2020 100%)
        `,
      }}
    >
      {/* Background Grid Lines - Only in background areas */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage: `
            radial-gradient(ellipse 800px 600px at 50% 50%, transparent 0%, transparent 40%, rgba(0,0,0,1) 70%),
            radial-gradient(ellipse 600px 400px at 50% 50%, transparent 0%, rgba(0,0,0,1) 100%)
          `,
          WebkitMaskImage: `
            radial-gradient(ellipse 800px 600px at 50% 50%, transparent 0%, transparent 40%, rgba(0,0,0,1) 70%),
            radial-gradient(ellipse 600px 400px at 50% 50%, transparent 0%, rgba(0,0,0,1) 100%)
          `,
        }}
      />

      {/* Subtle Texture Overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 1px,
              rgba(255, 255, 255, 0.015) 1px,
              rgba(255, 255, 255, 0.015) 2px
            )
          `,
          filter: "blur(0.5px)",
          mixBlendMode: "overlay",
        }}
      />

      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between px-8 py-4">
          {/* Logo */}
          <div className="text-white text-xl font-semibold tracking-tight">Rhoda</div>

          {/* Right Side - Navigation Links + Actions */}
          <div className="flex items-center space-x-8">
            {/* Navigation Links */}
            <div className="flex items-center space-x-8">
              <span className="text-white/80 hover:text-white cursor-pointer text-sm font-medium transition-colors">
                Dashboard
              </span>
              <span className="text-white cursor-pointer text-sm font-medium">Content</span>
              <span className="text-white/80 hover:text-white cursor-pointer text-sm font-medium transition-colors">
                About Us
              </span>
            </div>

            {/* Action Items */}
            <div className="flex items-center space-x-4">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Create Content
              </Button>
              <Bell className="w-5 h-5 text-white cursor-pointer hover:text-white/80 transition-colors" />
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center">
                <img src="/placeholder.svg?height=32&width=32" alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hidden file input for image upload */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

      {/* Main Content Card */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 pt-24 pb-8 h-full">
        <div
          className={`w-full max-w-5xl bg-transparent rounded-[2rem] p-8 border-2 ${
            isFocused ? "border-white/60 shadow-2xl shadow-white/10" : "border-white/30"
          } transition-all duration-300 relative overflow-hidden backdrop-blur-sm flex-1 flex flex-col`}
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
          }}
        >
          <div className="relative z-10 flex-1 flex flex-col">
            {/* Title Section */}
            <div className="mb-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onFocus={() => {
                  setIsFocused(true)
                  if (title === "Title") setTitle("")
                }}
                onBlur={() => {
                  setIsFocused(false)
                  if (!title.trim()) setTitle("Title")
                }}
                className="text-4xl font-bold text-white mb-2 tracking-tight bg-transparent border-none outline-none placeholder-white/50 w-full"
                style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                placeholder="Enter your title..."
              />

              {/* Tell your story placeholder */}
              {showPlaceholder && (
                <div className="text-white/70 text-lg font-light cursor-text mb-4" onClick={handleEditorFocus}>
                  Tell your story
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col relative">
              {/* Main textarea with scrollbar - aligned with title */}
              <div className="mb-6 flex-1 overflow-hidden">
                <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
                <textarea
                  ref={contentRef}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value)
                    setWordCount(countWords(e.target.value))
                    setShowPlaceholder(!e.target.value.trim())
                  }}
                  onFocus={handleEditorFocus}
                  onBlur={handleEditorBlur}
                  onMouseUp={handleSelectionChange}
                  onKeyUp={handleSelectionChange}
                  className="text-editor w-full h-full text-white/90 text-lg font-light leading-relaxed bg-transparent border-none outline-none transition-colors rounded-lg resize-none overflow-y-auto"
                  style={{
                    caretColor: "white",
                    minHeight: "300px",
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(255, 255, 255, 0.3) transparent",
                    padding: "0",
                    margin: "0",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                  }}
                  placeholder=""
                />
              </div>

              {/* Center placeholder text when no content and not focused */}
              {!content && !isEditorFocused && !showPlaceholder && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-white/60 text-lg font-light">
                    Select text to change formatting, add headers, or create links.
                  </p>
                </div>
              )}

              {/* Floating Toolbar */}
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between shadow-xl border border-white/30 mb-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleImageUpload}
                    className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200 text-gray-700"
                    title="Upload Image"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => applyFormat("bold")}
                    className={`p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200 font-semibold ${
                      activeFormats.has("bold") ? "bg-blue-100 text-blue-600" : "text-gray-700"
                    }`}
                    title="Bold (Ctrl+B)"
                  >
                    B
                  </button>
                  <button
                    onClick={() => applyFormat("italic")}
                    className={`p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200 ${
                      activeFormats.has("italic") ? "bg-blue-100 text-blue-600" : "text-gray-700"
                    }`}
                    title="Italic (Ctrl+I)"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    onClick={applyHeading}
                    className={`p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200 font-semibold ${
                      activeFormats.has("heading") ? "bg-blue-100 text-blue-600" : "text-gray-700"
                    }`}
                    title="Heading"
                  >
                    H
                  </button>
                  <button
                    onClick={toggleList}
                    className={`p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200 ${
                      activeFormats.has("list") ? "bg-blue-100 text-blue-600" : "text-gray-700"
                    }`}
                    title="Bullet List"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={createLink}
                    className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200 text-gray-700"
                    title="Link (Ctrl+K)"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => applyQuote()}
                    className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200 text-gray-700"
                    title="Quote"
                  >
                    <Quote className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-gray-600 text-sm font-medium">
                  {wordCount} {wordCount === 1 ? "word" : "words"}
                </div>
              </div>

              {/* Bottom Text */}
              <div className="text-center mb-4">
                <p className="text-white/60 text-sm font-light">Writing on Rhoda</p>
              </div>
            </div>
          </div>
        </div>

        {/* Publish Button */}
        <div className="mt-4">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-lg font-medium shadow-xl hover:shadow-blue-500/25 transition-all duration-200">
            Publish Content
          </Button>
        </div>
      </div>
    </div>
  )
}
