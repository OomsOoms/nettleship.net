import Button from "@components/ui/Button";
import InputField from "@components/ui/InputField";
import "../../styles/LobbyEntry.scss"

interface LobbyEntryProps {
  isAuthenticated: boolean;
  displayName: string;
  setDisplayName: (displayName: string) => void;
  saveDisplayName: boolean;
  setSaveDisplayName: (saveDisplayName: boolean) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function LobbyEntry({ isAuthenticated = false, displayName, setDisplayName, saveDisplayName, setSaveDisplayName, handleSubmit }: LobbyEntryProps) {
  return (
    <div className="lobby-entry-container">
      <div className="lobby-entry-card">
        <h1>Welcome to the Game</h1>
        <p>Please choose a display name before entering the lobby</p>

        <form onSubmit={handleSubmit} className="lobby-entry-form">
          <div className="form-group">
              <InputField
                  name="displayName"
                  value={displayName}
                  onChange={(e) => {setDisplayName(e.target.value)}}
              />
          </div>

          {isAuthenticated && (
            <div className="form-group checkbox-group">
              <label className="checkbox-container">
                <input type="checkbox" checked={saveDisplayName} onChange={(e) => setSaveDisplayName(e.target.checked)} />
                <span className="checkbox-label">Save this name to my account</span>
              </label>
            </div>
          )}

          <Button disabled={!displayName} type="submit">Enter Lobby</Button>
        </form>
      </div>
    </div>
  )
}

