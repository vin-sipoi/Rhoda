"use client"

import type React from "react"
import Link from "next/link"
import { Bell, List, LinkIcon, Quote, Italic, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useRef, useCallback, useEffect } from "react"

const scrollbarStyles = `
.text-editor::-webkit-scrollbar {width: 8px;}
.text-editor::-webkit-scrollbar-track {background: transparent;}
.text-editor::-webkit-scrollbar-thumb {background: rgba(255, 255, 255, 0.2);border-radius: 4px;}
.text-editor::-webkit-scrollbar-thumb:hover {background: rgba(255, 255, 255, 0.3);}

/* Styling for H2 within the editor */
.text-editor h2 {
  font-size: 2.25rem; /* Equivalent to Tailwind's text-4xl */
  font-weight: 700; /* Equivalent to Tailwind's font-bold */
  line-height: 1.2;
  margin-top: 1.5em; /* Add some vertical spacing */
  margin-bottom: 0.5em;
  color: white; /* Ensure the heading text is white */
}

.text-editor a {
  text-decoration: underline;
}
` // Removed TipTap placeholder styles as they are not applicable here.

export default function RhodaEditor() {
  const [title, setTitle] = useState("Title")
  const [content, setContent] = useState("") // Stores the HTML content
  const [wordCount, setWordCount] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const [isEditorFocused, setIsEditorFocused] = useState(false)
  const [showPlaceholder, setShowPlaceholder] = useState(true)
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())
  const contentRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize contentEditable div's innerHTML once on mount
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.innerHTML = content || "<p><br></p>" // Ensure a default paragraph
      // Set initial placeholder state based on actual content
      setShowPlaceholder(!contentRef.current.innerText.trim())
    }
  }, []) // Empty dependency array ensures this runs only once

  // Ensure there's always a <p> tag when content is truly empty and manage placeholder
  useEffect(() => {
    if (contentRef.current) {
      const currentText = contentRef.current.innerText.trim()
      if (!currentText && !isEditorFocused) {
        setShowPlaceholder(true)
        // Ensure there's a paragraph tag for execCommand to work on
        if (!contentRef.current.innerHTML.trim()) {
          contentRef.current.innerHTML = "<p><br></p>"
        }
      } else if (currentText && showPlaceholder) {
        setShowPlaceholder(false)
      }
    }
  }, [content, isEditorFocused, showPlaceholder])

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

      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        let node = selection.getRangeAt(0).commonAncestorContainer
        // Traverse up to find the block element or list item
        while (node && node !== contentRef.current) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = (node as HTMLElement).tagName.toLowerCase()
            if (tagName === "h2") {
              formats.add("heading")
            }
            if (tagName === "blockquote") {
              formats.add("quote")
            }
            if (tagName === "li" || tagName === "ul") {
              // Check for list item or its parent ul
              formats.add("list")
            }
          }
          node :node.parentNode
        }
      }
    } catch (e) {
      // Ignore errors from queryCommand
    }
    setActiveFormats(formats)
  }, [])

  const handleInput = () => {
    if (contentRef.current) {
      const newContentHtml = contentRef.current.innerHTML
      setContent(newContentHtml) // Update React state with current HTML
      setWordCount(countWords(contentRef.current.innerText)) // Use innerText for word count
    }
  }

  const handleSelectionChange = useCallback(() => {
    checkActiveFormats()
  }, [checkActiveFormats])

  const handleEditorFocus = () => {
    setIsFocused(true)
    setIsEditorFocused(true)
    setShowPlaceholder(false) // Hide placeholder when focused
    if (contentRef.current) {
      contentRef.current.focus()
    }
  }

  const handleEditorBlur = () => {
    setIsFocused(false)
    setIsEditorFocused(false)
    if (contentRef.current && !contentRef.current.innerText.trim()) {
      setShowPlaceholder(true) // Show placeholder if content is empty after blur
    }
  }

  const applyFormat = (format: string) => {
    if (!contentRef.current) return
    contentRef.current.focus()
    document.execCommand(format, false, undefined)
    handleInput() // Update state after execCommand
    checkActiveFormats()
  }

  const applyHeading = () => {
    if (!contentRef.current) return
    contentRef.current.focus()
    if (activeFormats.has("heading")) {
      document.execCommand("formatBlock", false, "p") // Toggle off heading
    } else {
      document.execCommand("formatBlock", false, "h2") // Apply heading
    }
    handleInput()
    checkActiveFormats()
  }

  const toggleList = () => {
    if (!contentRef.current) return
    contentRef.current.focus()
    document.execCommand("insertUnorderedList", false, undefined) // This command toggles the list on/off
    handleInput()
    checkActiveFormats()
  }

  const applyQuote = () => {
    if (!contentRef.current) return
    contentRef.current.focus()
    if (activeFormats.has("quote")) {
      document.execCommand("formatBlock", false, "p") // Toggle off quote
    } else {
      document.execCommand("formatBlock", false, "blockquote") // Apply quote
    }
    handleInput()
    checkActiveFormats()
  }

  const handleImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (contentRef.current && e.target?.result) {
          contentRef.current.focus()
          const imageHtml = `<img src="${
            e.target.result as string
          }" style="max-width: 100%; height: auto; border-radius: 0.5rem; box-shadow: 0 0 10px rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1);" />`
          document.execCommand("insertHTML", false, imageHtml)
          handleInput()
        }
      }
      reader.readAsDataURL(file)
    }
    // Reset the input
    event.target.value = ""
  }

  const createLink = () => {
    if (!contentRef.current) return
    contentRef.current.focus()
    let url = prompt("Enter URL:")
    if (url) {
      if (!/^https?:\/\//i.test(url)) {
        url = "http://" + url
      }
      document.execCommand("createLink", false, url)
      handleInput()
    }
    checkActiveFormats()
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

  // Make links clickable
  useEffect(() => {
    const editor = contentRef.current
    if (!editor) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === "A") {
        const href = target.getAttribute("href")
        if (href) {
          e.preventDefault()
          window.open(href, "_blank", "noopener,noreferrer")
        }
      }
    }

    editor.addEventListener("click", handleClick)

    return () => {
      editor.removeEventListener("click", handleClick)
    }
  }, [])

  return (
    <div
      className="h-screen relative overflow-hidden"
      style={{
        background: `    radial-gradient(ellipse 800px 600px at 50% 50%, #61b693 0%, transparent 70%),
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
          backgroundImage: `      linear-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.4) 1px, transparent 1px)
    `,
          backgroundSize: "60px 60px",
          maskImage: `      radial-gradient(ellipse 800px 600px at 50% 50%, transparent 0%, transparent 40%, rgba(0,0,0,1) 70%),
      radial-gradient(ellipse 600px 400px at 50% 50%, transparent 0%, rgba(0,0,0,1) 100%)
    `,
          WebkitMaskImage: `      radial-gradient(ellipse 800px 600px at 50% 50%, transparent 0%, transparent 40%, rgba(0,0,0,1) 70%),
      radial-gradient(ellipse 600px 400px at 50% 50%, transparent 0%, rgba(0,0,0,1) 100%)
    `,
        }}
      />
      {/* Subtle Texture Overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `      radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
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
          <Link href="/" className="text-white text-xl font-semibold tracking-tight">
            Rhoda
          </Link>
          {/* Right Side - Navigation Links + Actions */}
          <div className="flex items-center space-x-8">
            {/* Navigation Links */}
            <div className="flex items-center space-x-8">
              <Link
                href="/dashboard"
                className="text-white/80 hover:text-white cursor-pointer text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
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
              {/* Main contentEditable div with scrollbar - aligned with title */}
              <div className="mb-6 flex-1 overflow-hidden">
                <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
                <div
                  ref={contentRef}
                  contentEditable="true"
                  suppressContentEditableWarning={true} // Suppress React warning for contentEditable
                  onInput={handleInput}
                  onFocus={handleEditorFocus}
                  onBlur={handleEditorBlur}
                  onMouseUp={handleSelectionChange}
                  onKeyUp={handleSelectionChange}
                  className="text-editor w-full h-full text-white text-lg font-light leading-relaxed bg-transparent border-none outline-none transition-colors rounded-lg resize-none p-6 overflow-y-auto"
                  style={{
                    caretColor: "white",
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(255, 255, 255, 0.3) transparent",
                    margin: "0",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                  }}
                  // No dangerouslySetInnerHTML here after initial render
                />
              </div>
              {/* Instruction header - always visible */}
              {
                <p className="text-white text-lg font-medium mb-4 text-center">
                  Select text to change formatting, add headers, or create links.
                </p>
              }
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
                <p className="text-white text-sm font-medium">Writing on Rhoda</p>
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