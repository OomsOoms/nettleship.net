import { RegisterForm } from "../features/authentication";
import GoogleLoginButton from '../components/ui/GoogleLoginButton.jsx';

import MainLayout from '../layouts/MainLayout.jsx';

const RegisterPage = () => {
    return (
        <MainLayout>
            <div className="form-container">
                <h1>Create an account</h1>
                <RegisterForm />
                <div className="divider">
                    <span>or</span>
                </div>
                <GoogleLoginButton />
                <p style={{ color: '#888' }}>Already have an account? <a href="/login">Log in</a></p>
            </div>
        </MainLayout>
    );
};

export default RegisterPage;