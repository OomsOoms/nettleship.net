"use client"

import Button from "@components/ui/Button"
import InputField from "@components/ui/InputField"
import Select from "@components/ui/Select"
import { RefreshIcon } from "../../../../assets/Icons"
import '../../styles/GameFilter.scss'

const GameFilters = ({
  filters,
  handleChange,
  refresh,
}: {
  filters: {
    status: "" | "lobby" | "inProgress"
    gameType: "" | "uno"
    maxPlayers: number | ""
    search: string
  }
  handleChange: <K extends keyof typeof filters>(field: K, value: string | number) => void
  refresh: () => void
}) => {
  return (
    <div className="GameFilters">
      <div className="filters-row">
        <InputField
          className="search-box"
          name="search"
          value={filters.search}
          onChange={(e) => handleChange("search", e.target.value)}
        />

        <div className="filters-group">
          <Select
            className="select-status"
            onChange={(value) => handleChange("status", value)}
            options={[
              { label: "All", value: "" },
              { label: "Lobby", value: "lobby" },
              { label: "In Progress", value: "inProgress" }
            ]}
          />

          <Select
            className="select-game-type"
            onChange={(value) => handleChange("gameType", value)}
            options={[
              { label: "All", value: "" },
              { label: "UNO", value: "uno" }
            ]}
          />
        </div>
      </div>

      <div className="filters-row player-filter">
        <div className="slider-container">
          <div className="slider-labels">
            <span className="slider-label">Players:</span>
            <span className="slider-value">
              {filters.maxPlayers === "" ? "No Limit" : `${filters.maxPlayers} Players`}
            </span>
          </div>
          <input
            type="range"
            min="2"
            max="11"
            value={filters.maxPlayers === "" ? 11 : filters.maxPlayers}
            onChange={(e) => {
              const value = Number(e.target.value)
              handleChange("maxPlayers", value === 11 ? "" : value)
            }}
          />
        </div>

        <Button onClick={refresh} className="refresh-button">
          <RefreshIcon />
        </Button>
      </div>
    </div>
  )
}

export default GameFilters
