import { useContext, useState } from 'react';

import Captcha from '../../../components/ui/Captcha.jsx';
import { UserContext } from '../../../context/userContext.jsx';
import { useRegister } from '../hooks/useRegister.js';
import validator from 'validator';

const RegisterForm = () => {
    const { user, loading } = useContext(UserContext);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [captchaToken, setCaptchaToken] = useState('');
    const { handleRegister, loading: registerLoading, error } = useRegister();

    const [usernameError, setUsernameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleUsernameChange = (e) => {
        const username = e.target.value;
        setUsername(username);
        setUsernameError(usernameValidations(username));
    }
    const handleEmailChange = (e) => {
        const email = e.target.value;
        setEmail(email);
        setEmailError(emailValidations(email));
    }
    const handlePasswordChange = (e) => {
        const password = e.target.value;
        setPassword(password);
        setPasswordError(passwordValidations(password));
    };
    // TODO: make functions for each input field and move validations to another file
    const usernameValidations = (username) => {
        if (!validator.isLength(username, { min: 3 })) {
            return 'Username is too short'
        } else if (!validator.isLength(username, { max: 20 })) {
            return 'Username is too long'
        } else if (!validator.matches(username, /^[a-z0-9_.-]+$/)) {
            return 'Username must contain only letters, numbers, and ._-'
        }
    }
    const emailValidations = (email) => {
        if (!validator.isEmail(email)) {
            return 'Invalid email';
        }
    }
    const passwordValidations = (password) => {
        if (!validator.isLength(password, { min: 8 })) {
            return 'Password is too short';
        } else if (!/[a-z]/.test(password)) {
            return 'Password must contain a lowercase letter';
        } else if (!/[A-Z]/.test(password)) {
            return 'Password must contain a capital letter';
        } else if (!/\d/.test(password)) {
            return 'Password must contain a number';
        }
    }
    const onSubmit = (e) => {
        e.preventDefault(); // Prevent the default form submission
        if (!username) {
            setUsernameError('Username is required');
            return;
        }
        if (!email) {
            setEmailError('Email is required');
            return;
        }
        if (!password) {
            setPasswordError('Password is required');
            return;
        }
        if (!captchaToken) {
            alert('Please complete the captcha');
            return;
        }
        const result = handleRegister(username, email, password, captchaToken);
        // Reload captcha on fail
        if (result !== 201) {
            console.log('reset captcha')
        }
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
                    onChange={handleUsernameChange}
                />
                {usernameError && <div>{usernameError}</div>}
            </div>
            <div>
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={handleEmailChange}
                />
                {emailError && <div>{emailError}</div>}
            </div>
            <div>
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={handlePasswordChange}
                />
                {passwordError && <div>{passwordError}</div>}
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