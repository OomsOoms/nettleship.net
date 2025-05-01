"use client"

import { useState } from "react"
import UnoCard from "../UnoCard/UnoCard"
import type { Card } from "../Game"
import useMobile from "../../../../../hooks/useMobile"
import "./PlayerHand.scss"

// Update the PlayerHandProps interface
interface PlayerHandProps {
    cards: Card[]
    handlePlayCard: (card: Card, index: number) => void
    isPlayerTurn: boolean
}

// Update the component to use indices instead of IDs
const PlayerHand = ({ cards, handlePlayCard, isPlayerTurn }: PlayerHandProps) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const isMobile = useMobile()

    const handleCardClick = (card: Card, index: number) => {
        // If it's not the player's turn, don't allow playing cards
        if (!isPlayerTurn) return

        setSelectedIndex(index)

        // Play the card immediately (for wild cards, the colour selection will happen after)
        handlePlayCard(card, index)

        // Reset selection
        setTimeout(() => {
            setSelectedIndex(null)
        }, 300)
    }

    // Calculate how much to offset each card
    const getOffset = () => {
        if (isMobile) {
            if (cards.length <= 5) return -4
            if (cards.length <= 8) return -8
            return -12 // For many cards, overlap them more on mobile
        } else {
            if (cards.length <= 7) return -8
            if (cards.length <= 10) return -12
            return -16 // For many cards, overlap them more
        }
    }

    return (
        <div className="player-hand">
            {/* Drawn card prompt */}
            {/* {drawnCardIndex !== null && isPlayerTurn && (
                <div className="drawn-card-prompt">
                    <span className="prompt-text">Play this card?</span>
                    <button className="keep-button" onClick={onKeepDrawnCard}>
                        Keep
                    </button>
                    <button className="play-button" onClick={() => onPlayCard(cards[drawnCardIndex], drawnCardIndex)}>
                        Play Now
                    </button>
                </div>
            )} */}

            {/* Cards */}
            <div className="cards-container">
                {cards.map((card, index) => {
                    return (
                        <div
                            key={index}
                            className={`card-wrapper ${!isPlayerTurn ? "inactive" : ""} ${selectedIndex === index ? "selected" : ""}`}
                            style={{
                                zIndex: index,
                                marginLeft: index === 0 ? "0" : `${getOffset()}px`,
                            }}
                        >
                            {/* Pass the index explicitly */}
                            <UnoCard card={card} size={isMobile ? "sm" : "md"} onClick={() => handleCardClick(card, index)} />
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

export default PlayerHand

