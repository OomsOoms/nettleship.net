import SettingItem from "./SettingItem"


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

interface Player {
    displayName: string
    isHost: boolean
    isAI?: boolean
    userId: string
}

interface SettingsProps {
    isMobile: boolean
    gameSettings: GameSettings
    player: Player
    onChange: (field: string, value: any) => void
}

const Settings = ({ isMobile, gameSettings, player, onChange }: SettingsProps) => {
    return (
        <div className={`settings-section__items ${isMobile ? "settings-section__items--mobile" : ""}`}>
            <SettingItem
                title="PLAYER HAND SIZE"
                description="Select the number of cards each player will receive at the start of the game."
                value={gameSettings.playerHandSize}
                options={[
                    { value: 1, label: "1 CARD" },
                    { value: 2, label: "2 CARDS" },
                    { value: 3, label: "3 CARDS" },
                    { value: 4, label: "4 CARDS" },
                    { value: 5, label: "5 CARDS" },
                    { value: 6, label: "6 CARDS" },
                    { value: 7, label: "7 CARDS" },
                    { value: 8, label: "8 CARDS" },
                    { value: 9, label: "9 CARDS" },
                    { value: 10, label: "10 CARDS" },
                ]}
                onChange={(_, value) => onChange("playerHandSize", value)}
                disabled={!player.isHost}
            />
            <SettingItem
                title="DECLARE LAST CARD PENALTY"
                description="Penalty for not declaring the last card."
                value={gameSettings.declareLastCardPenalty}
                options={[
                    { value: 0, label: "NO PENALTY" },
                    { value: 1, label: "1 CARD" },
                    { value: 2, label: "2 CARDS" },
                    { value: 3, label: "3 CARDS" },
                    { value: 4, label: "4 CARDS" },
                    { value: 5, label: "5 CARDS" },
                    { value: 6, label: "6 CARDS" },
                    { value: 7, label: "7 CARDS" },
                    { value: 8, label: "8 CARDS" },
                    { value: 9, label: "9 CARDS" },
                    { value: 10, label: "10 CARDS" },
                ]}
                onChange={(_, value) => onChange("declareLastCardPenalty", value)}
                disabled={!player.isHost}
            />
            <SettingItem
                title="PUBLIC"
                description="Make the game public and allow anyone to join."
                isToggle
                value={gameSettings.public}
                // field is _ because it is required for this function to work but its not used here
                onChange={(_, value) => onChange("public", value)}
                disabled={!player.isHost}
            />
            <SettingItem
                title="REPLACE PLAYERS"
                description="When a player leaves, replace them with a bot."
                isToggle
                value={gameSettings.replacePlayers}
                onChange={(_, value) => onChange("replacePlayers", value)}
                disabled={!player.isHost}
            />
            <SettingItem
                title="AUTO PLAY"
                description="Enable a time limit for playing cards, at the end of the turn the player will play a card automatically."
                isToggle
                value={gameSettings.autoPlay}
                onChange={(_, value) => onChange("autoPlay", value)}
                disabled={!player.isHost}
            />
            <SettingItem
                title="CHAINING"
                description="Play a draw card on top of another draw card to pass the penalty to the next player."
                isToggle
                value={gameSettings.chaining}
                onChange={(_, value) => onChange("chaining", value)}
                disabled={!player.isHost}
            />
            <SettingItem
                title="STACKING"
                description="Play multiple cards of the same number in one turn."
                isToggle
                value={gameSettings.stacking}
                onChange={(_, value) => onChange("stacking", value)}
                disabled={!player.isHost}
            />
            <SettingItem
                title="JUMP IN"
                description="Play a card of the same number and color as the top card during another player's turn."
                isToggle
                value={gameSettings.jumpIn}
                onChange={(_, value) => onChange("jumpIn", value)}
                disabled={!player.isHost}
            />
            <SettingItem
                title="DRAW UNTIL PLAYABLE"
                description="Draw cards until you get a playable one."
                isToggle
                value={gameSettings.drawUntilPlayable}
                onChange={(_, value) => onChange("drawUntilPlayable", value)}
                disabled={!player.isHost}
            />
            <SettingItem
                title="PLAY ON DRAW"
                description="Play a card immediately after drawing if it's playable."
                isToggle
                value={gameSettings.playOnDraw}
                onChange={(_, value) => onChange("playOnDraw", value)}
                disabled={!player.isHost}
            />
            <SettingItem
                title="SEVENS AND ZEROS"
                description="Play a 7 to swap hands with another player, or a 0 to rotate hands."
                isToggle
                value={gameSettings.sevensAndZeros}
                onChange={(_, value) => onChange("sevensAndZeros", value)}
                disabled={!player.isHost}
            />
        </div>
    )
}

export default Settings;