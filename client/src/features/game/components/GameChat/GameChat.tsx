"use client"

import type React from "react"
import "./GameChat.scss"

import { useState, useEffect, useRef, type FormEvent } from "react"

interface Message {
  player: string
  message: string
  timestamp: number
}

interface GameChatProps {
  maxMessages?: number
  messageDisplayTime?: number
  recentMessageLimit?: number
  messages: Message[]
  onSendMessage: (message: string) => void
}

export function GameChat({
  maxMessages = 50,
  messageDisplayTime = 5000, // Time in ms to display new messages
  recentMessageLimit = 3, // Maximum number of recent messages to show
  messages,
  onSendMessage,
}: GameChatProps) {
  const [isTypingMode, setIsTypingMode] = useState(false)
  const [input, setInput] = useState("")
  const [recentMessages, setRecentMessages] = useState<Message[]>([])
  const [showRecentMessages, setShowRecentMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const messageTimersRef = useRef<NodeJS.Timeout[]>([])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTypingMode, recentMessages])

  // Focus input when typing mode is activated
  useEffect(() => {
    if (isTypingMode) {
      inputRef.current?.focus()
    }
  }, [isTypingMode])

  // Handle new messages - detect when a new message arrives and stack them
  useEffect(() => {
    if (messages.length > 0) {
      // Get the latest message
      const latestMessage = messages[messages.length - 1]

      // Only add to recent messages if we're not in typing mode
      if (!isTypingMode) {
        // Add to recent messages (limited to recentMessageLimit)
        setRecentMessages((prev) => {
          // Create a new array with the latest message added
          const updatedMessages = [...prev, latestMessage]

          // Limit to the most recent messages based on the prop
          return updatedMessages.slice(-recentMessageLimit)
        })

        setShowRecentMessages(true)

        // Set timer to remove this specific message after display time
        const timer = setTimeout(() => {
          setRecentMessages((prev) => prev.filter((msg) => msg !== latestMessage))

          // If no messages left, hide the container
          if (recentMessages.length <= 1) {
            setShowRecentMessages(false)
          }
        }, messageDisplayTime)

        messageTimersRef.current.push(timer)
      }
    }
    
    return () => {
      // Clear all timers on unmount
      messageTimersRef.current.forEach((timer) => clearTimeout(timer))
    }
  }, [messages, messageDisplayTime, isTypingMode, recentMessageLimit])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  // Handle form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim()) {
      onSendMessage(input)
      setInput("")
      setIsTypingMode(false)
    }
  }

  // Toggle typing mode with T key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "t" && !isTypingMode && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault()
        setIsTypingMode(true)
      } else if (e.key === "Escape" && isTypingMode) {
        setIsTypingMode(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isTypingMode])

  // Limit the number of messages shown
  const displayMessages = messages.slice(-maxMessages)

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="game-chat">
      {/* Full chat history when typing */}
      {isTypingMode ? (
        <>
          <div className="chat-header">
            <span>Game Chat</span>
            <button className="hide-chat-button" onClick={() => setIsTypingMode(false)} aria-label="Close chat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className="messages-container">
            <div className="fade-overlay"></div>
            {displayMessages.length === 0 ? (
              <div className="empty-message">No messages yet.</div>
            ) : (
              <div className="messages">
                {displayMessages.map((msg, index) => (
                  <div key={index} className="message">
                    <span className="timestamp">{formatTime(msg.timestamp)}</span>
                    <span className="player-name">{msg.player}: </span>
                    <span className="message-content">{msg.message}</span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="input-form">
            <input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="chat-input"
            />
            <button type="submit" className="send-button">
              send
            </button>
          </form>
        </>
      ) : (
        /* Only show recent messages when not typing */
        <>
          {!isTypingMode && showRecentMessages && recentMessages.length > 0 && (
            <div className="recent-messages-container">
              <div className="messages">
                {recentMessages.map((msg, index) => (
                  <div key={index} className="message recent-message">
                    <span className="player-name">{msg.player}: </span>
                    <span className="message-content">{msg.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => setIsTypingMode(true)} className="chat-toggle">
            {/* fuck coursework remove this temp */}
            {/* <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="chat-icon"
            >
              <path
                d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg> */}
            {/* should make this change based on screen width, phones will just use a button originaly text, changing cuz courseowkr is shit fuckmy life: Press T to chat */}
            Chat
          </button>
        </>
      )}
    </div>
  )
}

export default GameChat

