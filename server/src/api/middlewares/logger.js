const { Buffer } = require('buffer');
const logEvent = require('../../config/logEvent');

function getColorCode(statusCode) {
  if (statusCode >= 500) {
    return '\x1b[31m';
  } else if (statusCode >= 400) {
    return '\x1b[33m';
  } else if (statusCode >= 300) {
    return '\x1b[36m';
  } else if (statusCode >= 200) {
    return '\x1b[32m';
  } else {
    return '\x1b[0m';
  }
}

const logger = (req, res, next) => {
  const { method, url } = req;
  const start = Date.now();

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    const contentLength = Buffer.byteLength(JSON.stringify(body), 'utf8');
    const colorCode = getColorCode(res.statusCode);
    const duration = Date.now() - start;
    const origin = req.headers.origin || '-';

    logEvent(
      `${new Date().toISOString()} | ${method} ${url} | ${colorCode}${
        res.statusCode
      }\x1b[0m | ${duration} ms | ${contentLength} | ${origin}`
    );

    originalJson(body);
  };
  next();
};

module.exports = logger;
