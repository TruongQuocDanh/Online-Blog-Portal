"use client"
import type React from "react"

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const renderContent = (text: string) => {
    return text.split("\n").map((line, idx) => {
      const element = line

      // Handle headings
      if (element.startsWith("## ")) {
        return (
          <h2 key={idx} className="text-2xl font-bold mt-6 mb-3">
            {element.substring(3)}
          </h2>
        )
      }

      // Handle lists
      if (element.startsWith("- ")) {
        return (
          <li key={idx} className="ml-6 mb-1">
            {element.substring(2)}
          </li>
        )
      }

      // Handle bold, italic, and inline code
      const processFormatting = (str: string) => {
        const parts: (string | React.ReactElement)[] = []
        let lastIndex = 0

        const patterns = [
          { regex: /\*\*(.+?)\*\*/g, tag: "strong" },
          { regex: /\*(.+?)\*/g, tag: "em" },
          { regex: /`(.+?)`/g, tag: "code" },
        ]

        for (const pattern of patterns) {
          let match
          const regex = new RegExp(pattern.regex)
          while ((match = regex.exec(str)) !== null) {
            if (match.index > lastIndex) {
              parts.push(str.substring(lastIndex, match.index))
            }

            const Tag = pattern.tag as any
            parts.push(<Tag key={`${pattern.tag}-${match.index}`}>{match[1]}</Tag>)
            lastIndex = match.index + match[0].length
          }
        }

        if (lastIndex < str.length) {
          parts.push(str.substring(lastIndex))
        }

        return parts.length > 0 ? parts : str
      }

      // Skip empty lines in lists
      if (line.trim() === "") {
        return <br key={idx} />
      }

      return (
        <p key={idx} className="mb-3 leading-relaxed">
          {processFormatting(element)}
        </p>
      )
    })
  }

  return (
    <div className="prose prose-invert max-w-none space-y-2 text-foreground text-lg leading-relaxed">
      {renderContent(content)}
    </div>
  )
}
