const GoogleLoginButton = () => {
    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
    };

    return (
        <button onClick={handleGoogleLogin} className="google-login-button">
            Continue with Google
        </button>
    );
};

export default GoogleLoginButton;