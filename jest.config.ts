/** @jest-config-loader ts-node */
// or
/** @jest-config-loader esbuild-register */

import { defineConfig } from 'jest'

export default defineConfig({
  "transform": {
    "\\.[jt]sx?$": "ts-jest",
  },
  testEnvironment: "node",
  // [... whatever else you want to configure]
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
});