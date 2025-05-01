import Button from "@components/ui/Button";
import MainLayout from "@components/layout/MainLayout";

import RegisterForm from "../components/RegisterForm";
import useRegister from "../hooks/useRegister";
import { useUser } from '../../../context/UserContext';
import '../styles/Page.scss'

const RegisterPage = () => {
    // redirect if user is already logged in
    const { user } = useUser();
    if (user) {
        window.location.href = '/';
    }
    const {
        formData,
        handleChange,
        handleToken,
        handleSubmit,
        buttonDisabled,
        loading,
        handleGoogleLogin
    } = useRegister();

    return (
        <MainLayout>
            <div className="page">
                <h1>Create Account</h1>
                <RegisterForm 
                    formData={formData}
                    handleChange={handleChange}
                    handleToken={handleToken}
                    handleSubmit={handleSubmit}
                    buttonDisabled={buttonDisabled}
                />
                <div className="divider"><span>or</span></div>
                <Button className="google-btn" onClick={handleGoogleLogin}>Continue with Google</Button>
                {loading && <div className="loading">Registering...</div>}
                <p>Already have an account? <a href="/login">Login</a></p>
            </div>
        </MainLayout>
    );
};

export default RegisterPage;
