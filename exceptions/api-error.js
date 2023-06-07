module.exports = class AppError extends Error {
  status;
  errors;

  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors
  }

  static UnauthorizedError() {
    return new AppError(401, 'User not authorized')
  }

  static BadRequest(message, errors = []) {
    return new AppError(400, message, errors)
  }

}