import { useState, useContext } from 'react';
import { UserContext } from '../../../context/userContext.jsx';
import { useRegister } from '../hooks/useRegister.js';
import Captcha from '../../../components/ui/Captcha.jsx';

const RegisterForm = () => {
    const { user, loading } = useContext(UserContext);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [captchaToken, setCaptchaToken] = useState('');
    const { handleRegister, loading: registerLoading, error } = useRegister();

    const onSubmit = (e) => {
        e.preventDefault(); // Prevent the default form submission
        handleRegister(username, email, password, captchaToken);
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    if (user) {
        window.location.href = '/';
    }

    return (
        <form onSubmit={onSubmit}>
            <div>
                <label htmlFor="username">Username:</label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <Captcha show={true} onToken={setCaptchaToken} />
            <button type="submit" disabled={registerLoading}>
                {registerLoading ? 'Signing up...' : 'Signup'}
            </button>
            {error && <div>{error}</div>}
        </form>
    );
};

export default RegisterForm;