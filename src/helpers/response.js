function success(message, data) {
    return {
        _payload: data,
        type: "success",
        message
    };
}

function error(message, errors = []) {
    return {
        _payload_error: errors,
        message,
        type: "error"
    };
}
function info(message, data = null) {
    return {
        _payload_error: data,
        message,
        type: "info"
    };
}

const wrapRequestHandler = (fn) => (req, res, next) => fn(req, res, next).then(() => { }).catch(err => next(err))

module.exports = {
    success,
    error,
    wrapRequestHandler,
    info
};
