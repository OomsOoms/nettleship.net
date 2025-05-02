import InputField from "@components/ui/InputField";
import Button from "@components/ui/Button";
import HCaptchaButton from "@components/ui/HCaptchaButton";

const RegisterForm = ({
  formData,
  handleChange,
  handleToken,
  handleSubmit,
  buttonDisabled,
}: {
  formData: any;
  handleChange: any;
  handleToken: any;
  handleSubmit: any;
  buttonDisabled: any;
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <InputField
        name="username"
        value={formData.username}
        onChange={handleChange}
        validate
      />
      <InputField
        name="email"
        value={formData.email}
        onChange={handleChange}
        validate
      />
      <InputField
        name="password"
        value={formData.password}
        onChange={handleChange}
        validate
      />
      <InputField
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        validate
        compareValue={formData.password}
      />
      <div className="hcaptcha-container">
        <HCaptchaButton onToken={handleToken} />
      </div>
      <Button type="submit" disabled={buttonDisabled()}>
        Create Account
      </Button>
    </form>
  );
};

export default RegisterForm;
