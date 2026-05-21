import Constants from 'expo-constants';

interface ExtraConfig {
  apiBaseUrl: string;
  wsBaseUrl: string;
  institutionalDomain: string;
}

const extra = (Constants.expoConfig?.extra ?? {}) as Partial<ExtraConfig>;

export const config: ExtraConfig = {
  apiBaseUrl: extra.apiBaseUrl ?? 'http://localhost:4000',
  wsBaseUrl: extra.wsBaseUrl ?? 'ws://localhost:4000',
  institutionalDomain: extra.institutionalDomain ?? 'plaksha.edu.in',
};
