import Button from "@components/ui/Button";
import InputField from "@components/ui/InputField";
import HCaptchaButton from "@components/ui/HCaptchaButton";
import Modal from "@components/ui/Modal/Modal";
import MainLayout from '@components/layout/MainLayout';
import LoginForm from '../components/LoginForm';
import useLogin from '../hooks/useLogin';
import useResetPasswordRequest from '../hooks/useRequestResetPassword';
import { useUser } from '../../../context/UserContext';
import '../styles/Page.scss'

const LoginPage = () => {
    // redirect if user is already logged in
    const { user } = useUser();
    if (user) {
        window.location.href = '/';
    }
    const {
        formData,
        handleChange,
        handleSubmit,
        buttonDisabled,
        handleGoogleLogin,
        loading,
    } = useLogin();

    const {
        showModal,
        setShowModal,
        showSentMessage,
        modalFormData,
        handleModalChange,
        handleToken,
        onClose,
        hCaptchaRef,
    } = useResetPasswordRequest();

    return (
        <MainLayout>
            <div className="page">
                <h1>Login</h1>
                <LoginForm
                    formData={formData}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    setShowModal={setShowModal}
                    buttonDisabled={buttonDisabled}
                />
                <div className="divider"><span>or</span></div>
                <Button className="google-btn" onClick={handleGoogleLogin}>Continue with Google</Button>
                {loading && <div className="loading">Logging in...</div>}
                <p>Don't have an account? <a href="/register">Register</a></p>
            </div>
            <Modal show={showModal} onClose={onClose}>
                {!showSentMessage ? (
                    <>
                        <h1>Forgot Password</h1>
                        <InputField
                            name="email"
                            value={modalFormData.email}
                            onChange={handleModalChange}
                            validate
                        />
                        <div className="hcaptcha-container">
                            <HCaptchaButton
                                ref={hCaptchaRef}
                                onToken={handleToken}
                            />
                        </div>
                    </>
                ) : (
                    <div className="sent-message">
                        <h1>Email Sent</h1>
                        <p>Please check your email for further instructions.</p>
                    </div>
                )}
            </Modal>
        </MainLayout>
    )
}

export default LoginPage;
