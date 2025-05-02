import Button from "@components/ui/Button";
import InputField from "@components/ui/InputField";

const ResetPasswordForm = ({
  formData,
  handleChange,
  handleSubmit,
  buttonDisabled,
}: {
  formData: any;
  handleChange: any;
  handleSubmit: any;
  buttonDisabled: any;
}) => {
  return (
    <form onSubmit={handleSubmit}>
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
      <Button type="submit" disabled={buttonDisabled()}>
        Change Password
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
