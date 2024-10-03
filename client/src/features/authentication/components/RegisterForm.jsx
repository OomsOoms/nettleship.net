import { useContext, useState, useRef } from 'react';

import HCaptcha from '@hcaptcha/react-hcaptcha';

import { UserContext } from '../../../context/userContext.jsx';
import { useRegister } from '../hooks/useRegister.js';
import { emailValidations, passwordValidations, usernameValidations } from '../validations/registerValidations.js';


const RegisterForm = () => {
    // User context
    const { user, loading: userContextLoading } = useContext(UserContext);

    // Register service
    const { handleRegister, loading: registerLoading, error } = useRegister();
    
    // Form state
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [captchaToken, setCaptchaToken] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const captchaRef = useRef(null);

    // Form validation
    const [usernameError, setUsernameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    
    const handleUsernameChange = (e) => {
        const username = e.target.value.toLowerCase();
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

    const handleConfirmPasswordChange = (e) => {
        const confirmPassword = e.target.value;
       setConfirmPassword(confirmPassword);
       setConfirmPasswordError(password !== confirmPassword ? 'Passwords do not match' : '');
    }

    const handleCaptchaChange = (token) => {
        setCaptchaToken(token);
    };

    const onSubmit = (e) => {
        e.preventDefault(); // Prevent the default form submission
        setUsernameError(usernameValidations(username));
        setEmailError(emailValidations(email));
        setPasswordError(passwordValidations(password));
        setConfirmPasswordError(password !== confirmPassword ? 'Passwords do not match' : '');

        if (
            usernameValidations(username) ||
            emailValidations(email) ||
            passwordValidations(password) ||
            setConfirmPasswordError(password !== confirmPassword ? 'Passwords do not match' : '') ||
            !captchaToken
        ) return;

        handleRegister(username, email, password, captchaToken);
        
        if (error) {
            captchaRef.current.resetCaptcha()
            switch (error) {
                case 'Username already exists':
                    setUsernameError('Username already exists');
                    break;
                case 'Email already exists':
                    setEmailError('Email already exists');
                    break;
                default:
                    break;
            }
        }
    }

    if (userContextLoading) {
        return <div>Loading...</div>;
    }

    if (user) {
        window.location.href = '/';
    }

    return (
        <form onSubmit={onSubmit}>
            <div>
                <label>Username</label><br/>
                <input
                    htmlFor="username"
                    placeholder='Username'
                    type="text"
                    id="username"
                    value={username}
                    onChange={handleUsernameChange}
                    //onBlur={() => checkUsernameAvailability(username)} // possibly check username availability while typing or on blur
                />
                <div className="error-message">{usernameError || '\u00A0'}</div> {/* Non-breaking space */}            
            </div>
            <div>
                <label>Email</label><br/>
                <input
                    htmlFor="email"
                    placeholder='Email'
                    type="email"
                    id="email"
                    value={email}
                    onChange={handleEmailChange}
                />
                <div className="error-message">{emailError || '\u00A0'}</div> {/* Non-breaking space */}           
            </div>
            <div>
                <label>Password</label><br/>
                <input
                    htmlFor="password"
                    placeholder='Password'
                    type="password"
                    id="password"
                    value={password}
                    onChange={handlePasswordChange}
                />
                <div className="error-message">{passwordError || '\u00A0'}</div> {/* Non-breaking space */}
            </div>
            <div>
                <label>Confirm Password</label><br/>
                <input
                    htmlFor="confirm-password"
                    placeholder='Confirm Password'
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                />
                <div className="error-message">{confirmPasswordError || '\u00A0'}</div> {/* Non-breaking space */}
            </div>
            <div>
                <HCaptcha
                    ref={captchaRef}
                    sitekey={import.meta.env.MODE === 'development'
                        ? '10000000-ffff-ffff-ffff-000000000001'
                        : '798876a4-47b6-480a-b92c-45bedfc45272'}
                    onVerify={handleCaptchaChange}
                />
            </div>
            <button type="submit" disabled={registerLoading}>
                {registerLoading ? 'Signing up...' : 'Signup'}
            </button>
        </form>
    );
};

export default RegisterForm;