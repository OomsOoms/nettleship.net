import type React from "react";

// none of this is currently in use

export interface FormFieldProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  validate?: boolean;
  compareValue?: string;
  type?: string;
}

export interface LoginFormProps {
  formData: {
    username: string;
    password: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  setShowModal: (show: boolean) => void;
  buttonDisabled: () => boolean;
  isLoading?: boolean;
}

export interface RegisterFormProps {
  formData: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleToken: (token: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  buttonDisabled: () => boolean;
  isLoading?: boolean;
}

export interface ResetPasswordFormProps {
  formData: {
    password: string;
    confirmPassword: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  buttonDisabled: () => boolean;
  isLoading?: boolean;
}

export interface RequestResetPasswordFormProps {
  formData: {
    email: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleToken: (token: string) => void;
  isLoading?: boolean;
}
