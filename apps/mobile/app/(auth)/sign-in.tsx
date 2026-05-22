import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/state/auth-provider';
import { config } from '@/lib/config';

export default function SignIn() {
  const { requestMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (!email.toLowerCase().endsWith(`@${config.institutionalDomain}`)) {
      Alert.alert('Invalid email', `Please use your @${config.institutionalDomain} address.`);
      return;
    }
    setSubmitting(true);
    try {
      await requestMagicLink(email);
      setSent(true);
    } catch (err) {
      Alert.alert('Could not send link', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-1 justify-center px-6">
        <Text className="text-3xl font-semibold text-white">Plaksha Helpline</Text>
        <Text className="mt-2 text-base text-white/80">
          Sign in with your @{config.institutionalDomain} email.
        </Text>

        {sent ? (
          <View className="mt-8 rounded-xl bg-white/10 p-4">
            <Text className="text-white">Check your inbox for a sign-in link.</Text>
          </View>
        ) : (
          <View className="mt-8 gap-3">
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholder={`yourname@${config.institutionalDomain}`}
              placeholderTextColor="rgba(255,255,255,0.5)"
              className="h-12 rounded-md bg-white/10 px-4 text-white"
            />
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              className="h-12 items-center justify-center rounded-md bg-white"
            >
              <Text className="font-semibold text-primary">
                {submitting ? 'Sending…' : 'Send sign-in link'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
