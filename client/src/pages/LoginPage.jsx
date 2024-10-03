import { LoginForm } from "../features/authentication";

import MainLayout from '../layouts/MainLayout.jsx';

const LoginPage = () => {
    return (
        <MainLayout>
            <div className="login-page">
                <h1>Login</h1>
                <LoginForm />
                <p>Don't have an account? <a href="/register">Register</a></p>
            </div>
        </MainLayout>
    );
};

export default LoginPage;