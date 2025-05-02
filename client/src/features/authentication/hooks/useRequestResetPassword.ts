import { useState, useRef } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import useValidation from "../../../hooks/useValidation";
import { requestResetPassword } from "../services/authService";

const useResetPasswordRequest = () => {
  const [showModal, setShowModal] = useState(false);
  const [showSentMessage, setShowSentMessage] = useState(false);
  const [modalFormData, setModalFormData] = useState({
    email: "",
    hCaptchaToken: "",
  });

  const { validateField } = useValidation();
  const hCaptchaRef = useRef<HCaptcha | null>(null);

  const handleModalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setModalFormData({ ...modalFormData, [e.target.name]: e.target.value });
  };

  const handleToken = async (token: string | null) => {
    const updatedModalFormData = {
      ...modalFormData,
      hCaptchaToken: token ?? "",
    };
    setModalFormData(updatedModalFormData);
    if (!validateField("email", updatedModalFormData.email)) {
      await requestResetPassword(updatedModalFormData);
      setShowSentMessage(true);
    } else {
      hCaptchaRef.current?.resetCaptcha();
    }
  };

  const onClose = () => {
    setShowModal(false);
    setShowSentMessage(false);
    setModalFormData({ email: "", hCaptchaToken: "" });
  };

  return {
    showModal,
    setShowModal,
    showSentMessage,
    modalFormData,
    handleModalChange,
    handleToken,
    onClose,
    hCaptchaRef,
  };
};

export default useResetPasswordRequest;
