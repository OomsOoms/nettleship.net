import validator from 'validator';

const usernameValidations = (username) => {
    if (!username) {
        return 'Username is required'
    } else if (!validator.isLength(username, { min: 3 })) {
        return 'Username is too short'
    } else if (!validator.isLength(username, { max: 20 })) {
        return 'Username is too long'
    } else if (!/^[a-zA-Z0-9_]*$/.test(username)) {
        return 'Please only use letters, numbers, underscores, hyphens or fullstops'; // dont have to specify the case of the letters because the input doesnt allow uppercase
    }else {
        return null;
    }
}

const emailValidations = (email) => {
    if (!email) {
        return 'Email is required';
    } else if (!validator.isEmail(email)) {
        return 'Invalid email';
    }
}

const passwordValidations = (password) => {
    if (!password) {
        return 'Password is required';
    } else if (!validator.isLength(password, { min: 8 })) {
        return 'Password is too short';
    } else if (!/[a-z]/.test(password)) {
        return 'Password must contain a lowercase letter';
    } else if (!/[A-Z]/.test(password)) {
        return 'Password must contain a capital letter';
    } else if (!/\d/.test(password)) {
        return 'Password must contain a number';
    }
}

export {
    usernameValidations,
    emailValidations,
    passwordValidations
};