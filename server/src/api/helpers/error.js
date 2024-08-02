class CustomError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }

  static invalidRequest(message = 'Invalid request') {
    return new CustomError(400, message);
  }

  static invalidCredentials(message = 'Invalid credentials') {
    return new CustomError(401, message);
  }

  static accountNotActive(message = 'Account not active') {
    return new CustomError(403, message);
  }

  static userNotFound(message = 'User not found') {
    return new CustomError(404, message);
  }

  static mongoConflictError(message = 'MongoDB conflict error') {
    return new CustomError(409, message);
  }

  static serverError(message = 'Internal server error') {
    return new CustomError(500, message);
  }
}

module.exports = CustomError;
