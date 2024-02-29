const { format } = require("date-fns");
const path = require("path");

const fs = require("fs");
const fsPromises = require("fs").promises;

async function logEvent(message, logFile = "requestLog.txt") {
  try {
    if (!fs.existsSync("logs")) {
      await fsPromises.mkdir("logs");
    }

    await fsPromises.appendFile(path.join("logs", logFile), `${message}\n`);
  } catch (err) {
    console.error(err);
  }
}

const logger = (req, res, next) => {
  const startTime = Date.now();

  next();

  res.on("finish", async () => {
    const endTime = Date.now();
    const date = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    const method = req.method;
    const url = req.url;
    const statusCode = res.statusCode;
    const responseTime = endTime - startTime;
    const contentLength = res.get("Content-Length") || "-";
    const origin = req.headers.origin || "-";

    const logItem = `${date}\t${method}\t${url}\t${statusCode}\t${responseTime}ms - ${contentLength}\t${origin}`;
    logEvent(logItem);
  });
};

module.exports = {
  logEvent,
  logger,
};
