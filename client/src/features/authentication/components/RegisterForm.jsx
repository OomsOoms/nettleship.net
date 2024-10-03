import { useContext, useState } from 'react';

import Captcha from '../../../components/ui/Captcha.jsx';

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

    // Form validation
    const [usernameError, setUsernameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    
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

    const onSubmit = (e) => {
        e.preventDefault(); // Prevent the default form submission
        setUsernameError(usernameValidations(username));
        setEmailError(emailValidations(email));
        setPasswordError(passwordValidations(password));

        if (usernameValidations(username) || emailValidations(email) || passwordValidations(password) || !captchaToken) {
            console.log('Form has errors');
            return;
        }
        console.log('Form is valid');
        const result = handleRegister(username, email, password, captchaToken);
        // Reload captcha on egister fail
        if (result !== 201) {
            console.log('reset captcha')
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
            <Captcha show={true} onToken={setCaptchaToken} />
            <button type="submit" disabled={registerLoading}>
                {registerLoading ? 'Signing up...' : 'Signup'}
            </button>
            {error && <div>{error}</div>}
        </form>
    );
};

export default RegisterForm;