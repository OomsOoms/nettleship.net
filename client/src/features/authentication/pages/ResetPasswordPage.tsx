import ResetPasswordForm from "../components/ResetPasswordForm";
import useResetPassword from "../hooks/useResetPassword";
import MainLayout from '../../../components/layout/MainLayout';

const ResetPasswordPage = () => {
    const {
        formData,
        handleChange,
        handleSubmit,
        buttonDisabled,
        loading,
    } = useResetPassword();

    return (
        <MainLayout>
            <div className="page">
                <h1>Reset Password</h1>
                <ResetPasswordForm
                    formData={formData}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    buttonDisabled={buttonDisabled}
                />
                {loading && <div className="loading">Resetting password...</div>}
            </div>
        </MainLayout>
    );
};

export default ResetPasswordPage;