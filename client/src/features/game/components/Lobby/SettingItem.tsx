"use client";

import Select from "@components/ui/Select";
import Button from "@components/ui/Button";
import useMobile from "../../../../hooks/useMobile";
import "../../styles/SettingItem.scss";

interface SettingItemProps {
  title: string;
  description: string;
  value?: string | number | boolean;
  options?: Array<{ value: string | number; label: string }>;
  isToggle?: boolean;
  disabled?: boolean;
  onChange?: (field: string, value: string | number | boolean) => void;
}

function SettingItem({
  title,
  description,
  value,
  options,
  isToggle = false,
  onChange,
  disabled,
}: SettingItemProps) {
  const isMobile = useMobile();
  const handleToggle = (newValue: boolean) => {
    if (onChange) {
      console.log("Toggle value:", newValue);
      onChange(title, newValue);
    }
  };

  return (
    <div className={`setting-item ${isMobile ? "setting-item--mobile" : ""}`}>
      {isMobile ? (
        <>
          <div className="setting-item__header">
            <h3 className="setting-item__title">{title}</h3>
          </div>
          {isToggle ? (
            <div className="setting-item__toggle">
              {disabled && value ? (
                // Show the "ON" button as active and disabled
                <Button
                  className="setting-item__toggle-btn setting-item__toggle-btn--on"
                  disabled
                >
                  ON
                </Button>
              ) : disabled && !value ? (
                // Show the "OFF" button as active and disabled
                <Button
                  className="setting-item__toggle-btn setting-item__toggle-btn--off"
                  disabled
                >
                  OFF
                </Button>
              ) : (
                // Show interactive toggle buttons when not disabled
                <>
                  <Button
                    className={`setting-item__toggle-btn ${value ? "setting-item__toggle-btn--on" : "setting-item__toggle-btn--off"}`}
                    onClick={() => handleToggle(false)}
                    disabled={disabled}
                  >
                    OFF
                  </Button>
                  <Button
                    className={`setting-item__toggle-btn ${!value ? "setting-item__toggle-btn--on" : "setting-item__toggle-btn--off"}`}
                    onClick={() => handleToggle(true)}
                    disabled={disabled}
                  >
                    ON
                  </Button>
                </>
              )}
            </div>
          ) : (
            <Select
              defaultValue={typeof value === "boolean" ? undefined : value}
              options={options || []}
              className="setting-item__select"
              onChange={(selectedValue) =>
                onChange && onChange(title, selectedValue)
              }
              disabled={disabled}
            />
          )}
        </>
      ) : (
        <>
          <div className="setting-item__content">
            <h3 className="setting-item__title">{title}</h3>
            <p className="setting-item__description">{description}</p>
          </div>
          {isToggle ? (
            <div className="setting-item__toggle">
              {disabled && value ? (
                // Show the "ON" button as active and disabled
                <Button
                  className="setting-item__toggle-btn setting-item__toggle-btn--on"
                  disabled
                >
                  ON
                </Button>
              ) : disabled && !value ? (
                // Show the "OFF" button as active and disabled
                <Button
                  className="setting-item__toggle-btn setting-item__toggle-btn--off"
                  disabled
                >
                  OFF
                </Button>
              ) : (
                // Show interactive toggle buttons when not disabled
                <>
                  <Button
                    className={`setting-item__toggle-btn ${value ? "setting-item__toggle-btn--on" : "setting-item__toggle-btn--off"}`}
                    onClick={() => handleToggle(false)}
                    disabled={disabled}
                  >
                    OFF
                  </Button>
                  <Button
                    className={`setting-item__toggle-btn ${!value ? "setting-item__toggle-btn--on" : "setting-item__toggle-btn--off"}`}
                    onClick={() => handleToggle(true)}
                    disabled={disabled}
                  >
                    ON
                  </Button>
                </>
              )}
            </div>
          ) : (
            <Select
              defaultValue={typeof value === "boolean" ? undefined : value}
              options={options || []}
              className="setting-item__select"
              onChange={(selectedValue) =>
                onChange && onChange(title, selectedValue)
              }
              disabled={disabled}
            />
          )}
        </>
      )}
    </div>
  );
}

export default SettingItem;
