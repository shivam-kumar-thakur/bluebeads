class ApiError extends Error {
    constructor(
        statuscode,
        message = "API Error occurred",
        errors = [],
        stack = ""
    ) {
        super(message);

        this.message = message;
        this.statuscode = statuscode;
        this.success = false;
        this.data = null;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };
