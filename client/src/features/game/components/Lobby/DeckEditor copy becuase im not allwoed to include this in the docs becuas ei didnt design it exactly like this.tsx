import { useEffect, useState } from "react";
import Button from "@components/ui/Button";
import Tabs from "@components/ui/Tabs";

interface CardConfig {
  type: string;
  colour?: string;
  value?: number;
  count: number;
}

interface DeckEditorProps {
  defaultDeckConfig: any;
  deckConfig: any;
  setDeckConfig: (deckConfig: any) => void;
}

const DeckEditor = ({
  defaultDeckConfig,
  deckConfig,
  setDeckConfig,
}: DeckEditorProps) => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [totalCards, setTotalCards] = useState<number>(0);

  // Update the total cards in the deck config
  useEffect(() => {
    const total = deckConfig.reduce((sum, card) => sum + card.count, 0);
    setTotalCards(total);
  }, [deckConfig]);

  // Card count adjustment handler
  const handleCardCountChange = (index: number, increment: boolean) => {
    setDeckConfig((prevConfig) => {
      const newConfig = [...prevConfig];

      // Prevent negative card counts
      if (!increment && newConfig[index].count <= 0) {
        return prevConfig;
      }

      newConfig[index] = {
        ...newConfig[index],
        count: increment
          ? newConfig[index].count + 1
          : newConfig[index].count - 1,
      };

      return newConfig;
    });
  };

  // Reset the deck to default configuration
  const resetDeck = () => {
    setDeckConfig(defaultDeckConfig);
  };

  const filteredCards = deckConfig.filter((card) => {
    if (activeTab === "all") return true;
    if (activeTab === "wild")
      return card.type === "wild" || card.type === "wildDrawFour";
    return card.colour === activeTab;
  });

  // Format card name for display
  const formatCardName = (card: CardConfig) => {
    if (card.type === "number") {
      return `${card.value}`;
    }
    if (card.type === "drawTwo") {
      return "+2";
    }
    if (card.type === "wildDrawFour") {
      return "+4";
    }
    // Capitalize first letter
    return card.type.charAt(0).toUpperCase() + card.type.slice(1);
  };

  // Get color class for card
  const getCardColorClass = (card: CardConfig) => {
    if (card.type === "wild" || card.type === "wildDrawFour") {
      return "card-wild";
    }
    return card.colour ? `card-${card.colour}` : "";
  };

  return (
    <div className="deck-editor">
      <div className="deck-editor__header">
        <div className="deck-editor__title">
          <h2>Deck Configuration</h2>
          <p className="deck-editor__total">Total cards: {totalCards}</p>
        </div>
      </div>

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: "all", label: "ALL" },
          { id: "red", label: "RED" },
          { id: "green", label: "GREEN" },
          { id: "blue", label: "BLUE" },
          { id: "yellow", label: "YELLOW" },
          { id: "wild", label: "WILD" },
        ]}
      />

      <div className="deck-editor__cards-container">
        <div className="deck-editor__cards">
          {filteredCards.map((card, index) => {
            const originalIndex = deckConfig.findIndex(
              (c) =>
                c.type === card.type &&
                c.colour === card.colour &&
                c.value === card.value,
            );

            return (
              <div key={index} className="deck-editor__card">
                <div
                  className={`deck-editor__card-color ${getCardColorClass(card)}`}
                >
                  <span className="deck-editor__card-value">
                    {formatCardName(card)}
                  </span>
                </div>
                <div className="deck-editor__card-details">
                  <div className="deck-editor__card-name">
                    {card.colour ? `${card.colour.toUpperCase()} ` : ""}
                    {card.type.toUpperCase()}
                    {card.type === "number" ? ` ${card.value}` : ""}
                  </div>
                  <div className="deck-editor__card-count">
                    <Button
                      className="deck-editor__count-button"
                      onClick={() =>
                        handleCardCountChange(originalIndex, false)
                      }
                      disabled={card.count <= 0}
                    >
                      -
                    </Button>
                    <span className="deck-editor__count-value">
                      {card.count}
                    </span>
                    <Button
                      className="deck-editor__count-button"
                      onClick={() => handleCardCountChange(originalIndex, true)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="deck-editor__footer">
        <Button onClick={resetDeck}>Reset to Default</Button>
      </div>
    </div>
  );
};

export default DeckEditor;
