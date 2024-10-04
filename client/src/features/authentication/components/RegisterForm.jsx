import { useState, useRef, useEffect, useCallback } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

import axiosInstance from "../../../utils/axios-instance";


import { useRegister } from '../hooks/useRegister.js';
import { usernameValidations, emailValidations, passwordValidations, confirmPasswordValidations } from '../validations/registerValidations.js';


const RegisterForm = () => {
    // Register service
    const { handleRegister, loading: registerLoading } = useRegister();
    
    // Form state
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [captchaToken, setCaptchaToken] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const captchaRef = useRef(null);
    const [isFormValid, setIsFormValid] = useState(false);
    
    // Form labels
    const [usernameLabel, setUsernameLabel] = useState('Username');
    const [emailLabel, setEmailLabel] = useState('Email');
    const [passwordLabel, setPasswordLabel] = useState('Password');
    const [confirmPasswordLabel, setConfirmPasswordLabel] = useState('Confirm Password');
    

    

    const handleInputChange = (e, setInputValue, setLabel, inputValidations, defaultLabel = 'Input') => {
        // Set the input value to the value of the input field
        let inputValue = e.target.value;
        if (setInputValue === setUsername) {
            inputValue = inputValue.toLowerCase();
        }
        setInputValue(inputValue);

        if (!inputValue) {
            setLabel(defaultLabel);
            return;
        }

        const validationMessage = inputValidations(inputValue, password); // password is passed in for confirmPasswordValidations and ignored in the rest
        if (validationMessage) {
            setLabel(<span style={{ color: 'red', fontStyle: 'italic' }}>{validationMessage}</span>);
            return;
        }

        setLabel(defaultLabel);
    };

    const [lastUsernameChange, setLastUsernameChange] = useState(0);
    const [usernameAvailable, setUsernameAvailable] = useState(false);

    useEffect(() => {
        const checkUsernameAvailability = async () => {
            if (usernameValidations(username)) return;
            if (username.trim() !== '' && Date.now() - lastUsernameChange >= 1000) {
                try {
                    const response = await axiosInstance.get(`/api/users/${username}?check=true`);
                    if (response.status === 200) {
                        setUsernameLabel(<span style={{ color: 'red', fontStyle: 'italic' }}>Username not available</span>);
                    }
                } catch (error) {
                    if (error.status === 404) {
                        setUsernameAvailable(true);
                        setUsernameLabel('Username');
                    }
                }
            }
        };
        
        const timerId = setTimeout(checkUsernameAvailability, 1000);
        
        return () => clearTimeout(timerId);
    }, [username, lastUsernameChange]);
    
    const handleUsernameChange = useCallback((e) => {
        handleInputChange(e, setUsername, setUsernameLabel, usernameValidations, 'Username');
        setUsernameAvailable(false);
        setLastUsernameChange(Date.now());
        setUsername(e.target.value.toLowerCase());
    }, []);

    const handleEmailChange = (e) => {
        handleInputChange(e, setEmail, setEmailLabel, emailValidations, 'Email');
    };

    const handlePasswordChange = (e) => {
        handleInputChange(e, setPassword, setPasswordLabel, passwordValidations, 'Password');
    };

    const handleConfirmPasswordChange = (e) => {
        handleInputChange(e, setConfirmPassword, setConfirmPasswordLabel, confirmPasswordValidations, 'Confirm Password');
    };

    const handleCaptchaChange = (token) => {
        setCaptchaToken(token);
    };
    useEffect(() => {
        validateForm();
    }, [username, password, confirmPassword, captchaToken, usernameAvailable]); // when a value changes, validate the form

    const validateForm = () => {
        const isUsernameValid = !usernameValidations(username);
        const isEmailValid = !emailValidations(email);
        const isPasswordValid = !passwordValidations(password);
        const isConfirmPasswordValid = !confirmPasswordValidations(password, confirmPassword);
        const isCaptchaValid = !!captchaToken;

        setIsFormValid(isUsernameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid && isCaptchaValid && usernameAvailable);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        // Perform registration logic here
        if (isFormValid) {
            const registerResult = await handleRegister(username, email, password, captchaToken);
            if (registerResult?.status === 201) {
                window.location.href = '/';
            } else if (registerResult?.status === 409) {
                captchaRef.current.resetCaptcha();
                // assumed to be email conflict as username is already checked
                setEmailLabel(<span style={{ color: 'red', fontStyle: 'italic' }}>Email already exists</span>);
            }
        }
    }

    return (
        <form onSubmit={onSubmit}>
            <div className="input-box">
                <input
                    htmlFor="username"
                    placeholder=" "
                    type="text"
                    id="username"
                    value={username}
                    onChange={handleUsernameChange}
                />
                <label htmlFor="username">{usernameLabel}</label>
            </div>
            <div>
                <div className="input-box">
                    <input
                        htmlFor="email"
                        placeholder=" "
                        type="email"
                        id="email"
                        value={email}
                        onChange={handleEmailChange}
                    />
                    <label htmlFor="email">{emailLabel}</label>
                </div>
                
            </div>
            <div>
                <div className="input-box">
                <input
                    htmlFor="password"
                    placeholder=" "
                        type="password"
                    id="password"
                    value={password}
                    onChange={handlePasswordChange}
                    />
                    <label htmlFor="password">{passwordLabel}</label>
                </div>
            </div>
            <div>
                <div className="input-box">
                    <input
                        htmlFor="confirm-password"
                        placeholder=" "
                        type="password"
                        id="confirm-password"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                    />
                    <label htmlFor="confirm-password">{confirmPasswordLabel}</label>
                </div>
                
            </div>
            <div>
                <HCaptcha
                    ref={captchaRef}
                    sitekey={import.meta.env.MODE === "development"
                        ? "10000000-ffff-ffff-ffff-000000000001"
                        : "798876a4-47b6-480a-b92c-45bedfc45272"}
                    onVerify={handleCaptchaChange}
                />
            </div>
            <button type="submit" disabled={!isFormValid || registerLoading}>
                {registerLoading ? "Creating account..." : "Create account"}
            </button>
        </form>
    );
};

export default RegisterForm;