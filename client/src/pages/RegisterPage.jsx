import { RegisterForm } from "../features/authentication";
import GoogleLoginButton from '../components/ui/GoogleLoginButton.jsx';

import MainLayout from '../layouts/MainLayout.jsx';

const LoginPage = () => {
    return (
        <MainLayout>
            <div className="register-page">
                <h1>Register</h1>
                <RegisterForm />
                <hr />
                <GoogleLoginButton />
                <p>Already have an account? <a href="/login">Login</a></p>
            </div>
        </MainLayout>
    );
};

export default LoginPage;