"use client"

import { useState } from "react"
import Tabs from "@components/ui/Tabs"
import Select from "@components/ui/Select"
import Button from "@components/ui/Button"
import PlayerItem from "./PlayerItem" // used when isMobile is false
import PlayerAvatar from "./PlayerAvatar" // used when isMobile is true
import DeckEditor from "./DeckEditor"
import Settings from "./Settings"
import useMobile from "../../../../hooks/useMobile"
import "../../styles/Lobby.scss"

interface Player {
    displayName: string
    isHost: boolean
    isAI?: boolean
    userId: string
}

interface GameSettings {
    maxPlayers: number
    playerHandSize: number
    replacePlayers: boolean
    declareLastCardPenalty: number
    autoPlay: boolean
    chaining: boolean
    stacking: boolean
    jumpIn: boolean
    sevensAndZeros: boolean
    drawUntilPlayable: boolean
    playOnDraw: boolean
    public: boolean
}

interface LobbyProps {
    handleStartGame: () => void
    player: Player
    players: Player[]
    gameSettings: GameSettings
    defaultDeckConfig: any
    deckConfig: any
    setDeckConfig: (deckConfig: any) => void
    onChange: (field: string, value: any) => void
    handleAddBot: () => void
    handleKickPlayer: (userId: string) => void
}

export const Lobby = ({ handleStartGame, player, players, gameSettings, defaultDeckConfig, deckConfig, setDeckConfig, onChange, handleAddBot, handleKickPlayer }: LobbyProps) => {
    const isMobile = useMobile()
    const [activeTab, setActiveTab] = useState("settings")

    // Player count options for the dropdown
    const playerCountOptions = Array.from({ length: 9 }, (_, i) => ({
        value: i + 2,
        label: `${i + 2} PLAYERS`,
    }))

    return (
        <div className="lobby-wrapper">
            <div className="lobby__container">
                <div className="lobby__content">
                    <div className={`lobby__layout ${isMobile ? "lobby__mobile-layout" : "lobby__desktop-layout"}`}>
                        {/* Players section - adapts based on screen size */}
                        <div className={`players-section ${!isMobile ? "players-section--desktop" : ""}`}>
                            <div className="players-section__header">
                                <h2 className={`players-section__title ${!isMobile ? "players-section__title--desktop" : ""}`}>
                                    PLAYERS {players.length}/{gameSettings.maxPlayers}
                                </h2>
                                <div className={`${!isMobile ? "players-section__select" : ""}`}>
                                    <Select disabled={!player.isHost} options={playerCountOptions} onChange={(value) => onChange("maxPlayers", value)} />
                                </div>
                            </div>

                            {/* conditionally render avatars or list items based on screen size */}
                            {isMobile ? (
                                <div className="players-section__avatars">
                                    {players.map((p, index) => (
                                        <PlayerAvatar
                                            key={index}
                                            name={p.displayName}
                                            isHost={p.isHost}
                                            isEmpty={false}
                                            isYou={p.displayName === player.displayName}
                                            isAI={p.isAI}
                                            onKick={player.isHost && !p.isHost ? () => handleKickPlayer(p.userId) : undefined}
                                        />
                                    ))}

                                    {/* rest of the slots are empty, with the first one containing the add bot button */}
                                    {Array.from({ length: gameSettings.maxPlayers - players.length }, (_, index) =>
                                        index === 0 && player.isHost ? (
                                            <div key={index + players.length} className="players-section__add-bot">
                                                <Button
                                                    onClick={handleAddBot}
                                                    className="players-section__add-bot-button"
                                                    disabled={!player.isHost}
                                                >
                                                    ADD BOT
                                                </Button>
                                            </div>
                                        ) : (
                                            <PlayerAvatar key={index + players.length} name="" isHost={false} isEmpty={true} />
                                        ),
                                    )}
                                </div>
                            ) : (
                                <div className="players-section__list">
                                    {players.map((p, index) => (
                                        <PlayerItem
                                            key={index}
                                            name={p.displayName}
                                            isHost={p.isHost}
                                            isEmpty={false}
                                            isYou={p.displayName === player.displayName}
                                            isAI={p.isAI}
                                            onKick={player.isHost && !p.isHost ? () => handleKickPlayer(p.userId) : undefined}
                                        />
                                    ))}

                                    {/* rest of the slots are empty, with the first one containing the add bot button */}
                                    {Array.from({ length: gameSettings.maxPlayers - players.length }, (_, index) =>
                                        index === 0 && player.isHost ? (
                                            <div key={index + players.length} className="players-section__add-bot-item">
                                                <Button
                                                    onClick={handleAddBot}
                                                    className="players-section__add-bot-button"
                                                    disabled={!player.isHost}
                                                >
                                                    ADD BOT
                                                </Button>
                                            </div>
                                        ) : (
                                            <PlayerItem key={index + players.length} name="" isHost={false} isEmpty={true} />
                                        ),
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Settings section */}
                        <div className="settings-section">
                            <Tabs
                                activeTab={activeTab}
                                onChange={setActiveTab}
                                tabs={[
                                    { id: "settings", label: "SETTINGS" },
                                    { id: "deck", label: "DECK" },
                                ]}
                            />
                            <div className="settings-section__content">
                                <div className="settings-section__scrollable-container">
                                    {activeTab === "settings" && (
                                        <Settings isMobile={isMobile} gameSettings={gameSettings} player={player} onChange={onChange} />
                                    )}
                                    {activeTab === "deck" && <DeckEditor defaultDeckConfig={defaultDeckConfig} deckConfig={deckConfig} setDeckConfig={setDeckConfig} />}
                                </div>
                            </div>

                            {/* Invite and Start buttons */}
                            <div className="settings-section__buttons">
                                <Button
                                    className="settings-section__button settings-section__button--invite"
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href)
                                        const inviteButton = document.querySelector(".settings-section__button--invite")
                                        if (inviteButton) {
                                            const originalText = inviteButton.textContent
                                            inviteButton.textContent = "LINK COPIED!"
                                            setTimeout(() => {
                                                inviteButton.textContent = originalText
                                            }, 1000)
                                        }
                                    }}
                                >
                                    INVITE
                                </Button>
                                {player.isHost && (
                                    <Button className="settings-section__button settings-section__button--start" onClick={handleStartGame}>
                                        START
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Lobby

