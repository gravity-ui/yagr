// eslint-disable-next-line
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  collectCoverage: true,
  collectCoverageFrom: [
    "./src/**/*.{js,ts,tsx}"
  ],
  coverageReporters: ["json", "html"],
  coverageDirectory: "./coverage",
};
