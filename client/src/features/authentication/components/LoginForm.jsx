import { useState, useContext } from 'react';
import { UserContext } from '../../../context/userContext.jsx';
import { useLogin } from '../hooks/useLogin';

const LoginForm = () => {
    const { user, loading } = useContext(UserContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { handleLogin, loading: loginLoading, error } = useLogin();

    const onSubmit = (e) => {
        e.preventDefault(); // Prevent the default form submission
        handleLogin(username, password);
    };

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
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <button type="submit" disabled={loginLoading}>
                {loginLoading ? 'Logging in...' : 'Login'}
            </button>
            {error && <div>{error}</div>}
        </form>
    );
};

export default LoginForm;