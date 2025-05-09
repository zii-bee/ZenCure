module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|react-clone-referenced-element|@react-navigation|expo(nent)?|@expo|@unimodules|react-navigation|@react-native-community|expo-router|react-native-reanimated)'
  ],
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/navigation/**',
    '!src/types/**'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};