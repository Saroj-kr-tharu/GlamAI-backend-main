/** @type {import("jest").Config} **/
export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/__tests__/**",
    "!src/server.js",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["lcov", "text"],
};
