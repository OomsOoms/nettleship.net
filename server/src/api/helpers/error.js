class Error {
  constructor(status, message) {
    this.status = status;
    this.message = message;
  }

  static invalidRequest(message = 'Invalid request') {
    return new Error(400, message);
  }

  static invalidCredentials(message = 'Invalid credentials') {
    return new Error(401, message);
  }

  static accountNotActive(message = 'Account not active') {
    return new Error(403, message);
  }

  static userNotFound(message = 'User not found') {
    return new Error(404, message);
  }

  static mongoConflictError(message = 'MongoDB conflict error') {
    return new Error(409, message);
  }

  static serverError(message = 'Internal server error') {
    return new Error(500, message);
  }
}

module.exports = Error;
