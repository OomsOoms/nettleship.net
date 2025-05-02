import HCaptcha from "@hcaptcha/react-hcaptcha";
import "./HCaptchaButton.scss";

import { RefObject } from "react";

interface HCaptchaButtonProps {
  show?: boolean;
  onToken: (token: string | null) => void;
  ref?: RefObject<HCaptcha | null>;
}

const HCaptchaButton = ({ show = true, onToken, ref }: HCaptchaButtonProps) => {
  return (
    <div>
      {show && (
        <HCaptcha
          ref={ref}
          sitekey={
            import.meta.env.MODE === "development"
              ? "10000000-ffff-ffff-ffff-000000000001"
              : import.meta.env.VITE_HCAPTCHA_SITE_KEY
          }
          onVerify={onToken}
          onExpire={() => onToken(null)}
          onError={(err) => {
            onToken(null);
            console.error(err);
          }}
        />
      )}
    </div>
  );
};

export default HCaptchaButton;
