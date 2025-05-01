"use client"

import { Crown, User, Bot } from "../../../../assets/Icons"
import "../../styles/PlayerAvatar.scss"

interface PlayerAvatarProps {
    name: string
    isEmpty?: boolean
    isHost?: boolean
    isYou?: boolean
    isAI?: boolean
    onKick?: () => void
}

function PlayerAvatar({
    name,
    isEmpty = false,
    isHost = false,
    isYou = false,
    isAI = false,
    onKick,
}: PlayerAvatarProps) {
    return (
        <div className="player-avatar">
            <div className={`player-avatar__image ${isEmpty ? "player-avatar__image--empty" : ""}`}>
                {!isEmpty && (
                    <>
                        {!isEmpty && (
                            isAI ? <Bot className="player-item__bot-icon" /> : <User className="player-item__user-icon" />
                        )}                       
                        {isHost && (
                            <div className="player-avatar__crown">
                                <Crown className="player-avatar__crown-icon" />
                            </div>
                        )}
                    </>
                )}
            </div>
            <span className={`player-avatar__name ${isEmpty ? "player-avatar__name--empty" : ""}`}>
                {name}
                {isYou && <span className="player-avatar__you-tag">(You)</span>}
            </span>

            {onKick && !isEmpty && isHost && (
                <button
                    className="player-avatar__kick-button"
                    onClick={(e) => {
                        e.stopPropagation()
                        onKick()
                    }}
                    aria-label="Kick player"
                >
                    ×
                </button>
            )}
        </div>
    )
}

export default PlayerAvatar

