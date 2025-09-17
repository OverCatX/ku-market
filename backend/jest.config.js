/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/tests/**/*.test.ts"], // only run files in /tests
    moduleFileExtensions: ["ts", "js", "json", "node"],
  };
  