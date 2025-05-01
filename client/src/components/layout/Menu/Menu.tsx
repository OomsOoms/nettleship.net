"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import "./Menu.scss"

interface MenuItem {
  label: string
  onClick: () => void
  icon?: React.ReactNode
  danger?: boolean
}

interface GameMenuProps {
  items: MenuItem[]
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
  playerName?: string
}

export default function Menu({ items, position = "top-right", playerName }: GameMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Close menu when ESC key is pressed
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleEscKey)
    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [])

  return (
    <div className={`menu ${position} ${isOpen ? "open" : ""}`} ref={menuRef}>
      <button className="menu-toggle" onClick={toggleMenu} aria-expanded={isOpen} aria-label="Game menu">
        <div className="burger-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      <div className={`menu-dropdown ${isOpen ? "open" : ""}`}>
        <div className="menu-header">
          <h3>Game Menu</h3>
          <button className="close-button" onClick={() => setIsOpen(false)} aria-label="Close menu">
            ✕
          </button>
        </div>

        <ul className="menu-items">
          {items.map((item, index) => (
            <li key={index}>
              <button
                onClick={() => {
                  item.onClick()
                  setIsOpen(false)
                }}
                className={item.danger ? "danger" : ""}
              >
                {item.icon && <span className="item-icon">{item.icon}</span>}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {isOpen && <div className="menu-backdrop" onClick={() => setIsOpen(false)} />}
    </div>
  )
}

