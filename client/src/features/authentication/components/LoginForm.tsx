import InputField from "@components/ui/InputField";
import Button from "@components/ui/Button";

const LoginForm = ({
  formData,
  handleChange,
  handleSubmit,
  setShowModal,
  buttonDisabled,
}: {
  formData: any;
  handleChange: any;
  handleSubmit: any;
  setShowModal: any;
  buttonDisabled: any;
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <InputField
        name="username"
        value={formData.username}
        onChange={handleChange}
      />
      <InputField
        name="password"
        value={formData.password}
        onChange={handleChange}
      />
      <div className="forgot-password">
        <span
          onClick={() => setShowModal(true)}
          className="forgot-password-link"
        >
          Forgot Password?
        </span>
      </div>
      <Button type="submit" disabled={buttonDisabled()}>
        Login
      </Button>
    </form>
  );
};

export default LoginForm;
