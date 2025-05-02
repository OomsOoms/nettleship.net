"use client";

import type { CardColour } from "../Game";
import "./ColourSelector.scss";

interface ColourSelectorProps {
  handleColourSelect: (colour: CardColour) => void;
}

const ColourSelector = ({ handleColourSelect }: ColourSelectorProps) => {
  const colours: { name: CardColour; className: string; textClass: string }[] =
    [
      { name: "red", className: "red", textClass: "white" },
      { name: "blue", className: "blue", textClass: "white" },
      { name: "green", className: "green", textClass: "white" },
      { name: "yellow", className: "yellow", textClass: "black" },
    ];

  return (
    <div className="colour-selector">
      <div className="selector-header">
        <h2 className="selector-title">Choose a Colour</h2>
      </div>
      <div className="selector-content">
        <div className="colour-grid">
          {colours.map((colour) => (
            <button
              key={colour.name}
              className={`colour-button ${colour.className} ${colour.textClass}`}
              onClick={() => handleColourSelect(colour.name)}
            >
              {colour.name.charAt(0).toUpperCase() + colour.name.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColourSelector;
