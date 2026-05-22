import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export const Storage = {
  async getSecure(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  },
  async setSecure(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },
  async deleteSecure(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },
  async get(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  },
  async set(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  },
  async delete(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },
};

export const StorageKeys = {
  accessToken: 'plaksha.accessToken',
  refreshToken: 'plaksha.refreshToken',
  user: 'plaksha.user',
  offlineQueue: 'plaksha.offlineQueue',
} as const;
