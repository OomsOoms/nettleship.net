"use client";

import type { CardColour, CardType } from "../Game";
import "./UnoCard.scss";

interface CardProps {
  card: {
    colour: CardColour;
    type: CardType;
    score: number;
  };
  size?: "sm" | "md" | "lg";
  faceDown?: boolean;
  onClick?: () => void;
}

const oneWords = [
  // Numerals in different languages
  "one",
  "eins",
  "un",
  "ένα",
  "один",
  "bir",
  "یک",
  "ett",
  "yksi",
  "一",
  "하나",
  "一つ",
  "một",
  "isa",
  "tahi",
  "hade",
  "moja",
  "jedan",
  "unu",
  "ien",
  "vienas",
  "bat",

  // Prefixes and root words meaning "one"
  "mono", // Greek/Latin (monologue, monochrome)
  "uni", // Latin (unicycle, unicorn)
  "sol", // Latin root (solo, solitude)
  "solo", // Spanish/Italian (alone, single)
  "haplo", // Greek (haploid, meaning single/simple)
  "prime", // Latin root (primary, first)
  "singular", // From Latin (meaning single, unique)
  "ace", // Used in cards, meaning "one" or "best"
  "simplex", // Latin (meaning single or simple)
  "first", // English (implying one in sequence)
  "chief", // Old French/Latin root (first, main)
  "single", // English (one, not multiple)
  "initial", // Latin root (beginning, one of something)
  "lone", // From "alone," meaning singular or one
  "only", // English (implying singularity)
];

const UnoCard = ({
  card,
  size = "md",
  faceDown = false,
  onClick,
}: CardProps) => {
  let { colour, type } = card;
  if (!colour) {
    colour = "black";
  }

  return (
    <div className={`uno-card size-${size}`} onClick={onClick}>
      {faceDown ? (
        <div className="card-back">
          <div className="card-back-text">Card</div>
        </div>
      ) : (
        <div className={`card-front card-${colour}`}>
          <div className="card-inner">
            <div className={`card-value card-${colour}`}>
              {type === "wild"
                ? "W"
                : type === "wildDrawFour"
                  ? "+4"
                  : type === "drawTwo"
                    ? "+2"
                    : type === "skip"
                      ? "⊘"
                      : type === "reverse"
                        ? "⟲"
                        : type === "number"
                          ? card.score
                          : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnoCard;
