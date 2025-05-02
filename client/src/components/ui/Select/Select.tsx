"use client";

import { useState, useRef, useEffect } from "react";
import "./Select.scss";

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
  className?: string;
  disabled?: boolean;
}

function Select({
  options,
  defaultValue,
  onChange,
  className = "",
  disabled,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(
    defaultValue || options[0]?.value || "",
  );
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(
    (option) => option.value === selectedValue,
  );

  const handleSelect = (value: string | number) => {
    setSelectedValue(value);
    setIsOpen(false);
    if (onChange) onChange(value);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`select ${className} ${disabled ? "select--disabled" : ""}`}
      ref={selectRef}
    >
      <button
        className="select__trigger"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        disabled={disabled}
      >
        <span className="select__value">{selectedOption?.label}</span>
        {!disabled && <span className="select__arrow">▼</span>}
      </button>

      {isOpen && !disabled && (
        <div className="select__dropdown">
          {options.map((option) => (
            <div
              key={option.value}
              className={`select__option ${option.value === selectedValue ? "select__option--selected" : ""}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Select;
