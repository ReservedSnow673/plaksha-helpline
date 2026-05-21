/** @type {import('expo/config').ExpoConfig} */
const base = require('./app.json').expo;

const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? base.extra?.apiBaseUrl ?? 'http://localhost:4000';
const wsBaseUrl =
  process.env.EXPO_PUBLIC_WS_BASE_URL ?? base.extra?.wsBaseUrl ?? 'ws://localhost:4000';

module.exports = {
  expo: {
    ...base,
    plugins: [
      ...(base.plugins ?? []),
      'expo-asset',
      'expo-font',
      [
        'expo-build-properties',
        {
          android: {
            kotlinVersion: '1.9.25',
          },
        },
      ],
    ],
    extra: {
      ...base.extra,
      apiBaseUrl,
      wsBaseUrl,
      eas: {
        projectId: process.env.EAS_PROJECT_ID ?? base.extra?.eas?.projectId,
      },
    },
  },
};
