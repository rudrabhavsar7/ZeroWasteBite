class ApiResponse {
  constructor(statuscode, data, message = "Success") {
    this.statuscode = statuscode
    this.data = data
    this.message = message
    this.success  = statuscode < 400

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
