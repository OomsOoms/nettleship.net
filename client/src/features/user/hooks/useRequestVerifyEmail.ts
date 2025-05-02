import { useState } from "react";
import { requestVerifyEmail } from "../services/userServices";

const useRequestVerifyEmail = () => {
  const [emailSent, setEmailSent] = useState(false);

  const requestVerification = async (email: string) => {
    try {
      await requestVerifyEmail(email);
      setEmailSent(true);
    } catch (error) {
      console.error("Error requesting email verification:", error);
    }
  };

  return { requestVerification, emailSent };
};
export default useRequestVerifyEmail;
