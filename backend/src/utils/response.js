function sendSuccess(response, statusCode, message, data = null) {
  const payload = {
    success: true,
    message,
  };

  if (data !== null) {
    payload.data = data;
  }

  return response.status(statusCode).json(payload);
}

module.exports = {
  sendSuccess,
};
