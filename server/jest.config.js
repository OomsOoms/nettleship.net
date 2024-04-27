module.exports = {
  setupFiles: ["./jest.setup.js"],
  collectCoverageFrom: ["src/**/*.js", "!src/api/helpers/errors.js"],
};
