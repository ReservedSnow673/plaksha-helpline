import type { Language } from '@plaksha/shared-types';

import type { IvrInstruction } from './ivr.provider';

interface Prompts {
  welcome: Record<Language, string>;
  selectLanguage: Record<Language, string>;
  selectDepartment: Record<Language, string>;
  invalid: Record<Language, string>;
  noResponse: Record<Language, string>;
  bridging: Record<Language, string>;
  consent: Record<Language, string>;
  goodbye: Record<Language, string>;
}

export const PROMPTS: Prompts = {
  welcome: {
    en: 'You have reached the Plaksha Helpline. For English press 1, Hindi press 2, Punjabi press 3.',
    hi: 'आपने प्लक्षा हेल्पलाइन से संपर्क किया है। हिंदी के लिए दो दबाएँ।',
    pa: 'ਤੁਸੀਂ ਪਲਕਸ਼ਾ ਹੈਲਪਲਾਈਨ ਨਾਲ ਜੁੜੇ ਹੋ। ਪੰਜਾਬੀ ਲਈ ਤਿੰਨ ਦਬਾਓ।',
  },
  selectLanguage: {
    en: 'Press 1 for English, 2 for Hindi, 3 for Punjabi.',
    hi: 'अंग्रेजी के लिए एक, हिंदी के लिए दो, पंजाबी के लिए तीन दबाएँ।',
    pa: 'ਅੰਗਰੇਜ਼ੀ ਲਈ ਇੱਕ, ਹਿੰਦੀ ਲਈ ਦੋ, ਪੰਜਾਬੀ ਲਈ ਤਿੰਨ ਦਬਾਓ।',
  },
  selectDepartment: {
    en: 'Press 1 Medical, 2 Security, 3 Fire, 4 Women Safety, 5 Mental Health, 0 Operator.',
    hi: 'एक मेडिकल, दो सुरक्षा, तीन अग्नि, चार महिला सुरक्षा, पाँच मानसिक स्वास्थ्य, शून्य ऑपरेटर।',
    pa: 'ਇੱਕ ਮੈਡੀਕਲ, ਦੋ ਸੁਰੱਖਿਆ, ਤਿੰਨ ਅੱਗ, ਚਾਰ ਮਹਿਲਾ ਸੁਰੱਖਿਆ, ਪੰਜ ਮਾਨਸਿਕ ਸਿਹਤ, ਜ਼ੀਰੋ ਆਪਰੇਟਰ।',
  },
  invalid: {
    en: 'Invalid selection. Please try again.',
    hi: 'अमान्य चयन। कृपया पुनः प्रयास करें।',
    pa: 'ਅਵੈਧ ਚੋਣ। ਕਿਰਪਾ ਕਰਕੇ ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
  },
  noResponse: {
    en: 'No response received. Disconnecting.',
    hi: 'कोई प्रतिक्रिया नहीं मिली। काट रहे हैं।',
    pa: 'ਕੋਈ ਜਵਾਬ ਨਹੀਂ ਮਿਲਿਆ। ਡਿਸਕਨੈਕਟ ਕਰ ਰਹੇ ਹਾਂ।',
  },
  bridging: {
    en: 'Connecting you to the on-duty responder. Please stay on the line.',
    hi: 'ड्यूटी पर मौजूद रिस्पॉन्डर से जोड़ रहे हैं। कृपया लाइन पर बने रहें।',
    pa: 'ਡਿਊਟੀ ਉੱਤੇ ਮੌਜੂਦ ਰਿਸਪਾਂਡਰ ਨਾਲ ਜੋੜ ਰਹੇ ਹਾਂ। ਕਿਰਪਾ ਕਰਕੇ ਲਾਈਨ ਉੱਤੇ ਰਹੋ।',
  },
  consent: {
    en: 'This call may be recorded for safety and quality. Press 1 to consent, 2 to decline.',
    hi: 'सुरक्षा और गुणवत्ता के लिए यह कॉल रिकॉर्ड की जा सकती है। सहमति के लिए एक, अस्वीकार करने के लिए दो दबाएँ।',
    pa: 'ਸੁਰੱਖਿਆ ਅਤੇ ਗੁਣਵੱਤਾ ਲਈ ਇਹ ਕਾਲ ਰਿਕਾਰਡ ਕੀਤੀ ਜਾ ਸਕਦੀ ਹੈ। ਸਹਿਮਤੀ ਲਈ ਇੱਕ, ਇਨਕਾਰ ਲਈ ਦੋ ਦਬਾਓ।',
  },
  goodbye: {
    en: 'Thank you. An incident has been created. A responder will reach you shortly.',
    hi: 'धन्यवाद। एक घटना दर्ज की गई है। एक रिस्पॉन्डर शीघ्र ही पहुँचेगा।',
    pa: 'ਧੰਨਵਾਦ। ਇੱਕ ਘਟਨਾ ਦਰਜ ਕੀਤੀ ਗਈ ਹੈ। ਇੱਕ ਰਿਸਪਾਂਡਰ ਜਲਦੀ ਪਹੁੰਚੇਗਾ।',
  },
};

export const DTMF_LANGUAGE: Record<string, Language> = { '1': 'en', '2': 'hi', '3': 'pa' };

export const DTMF_DEPARTMENT: Record<string, string> = {
  '1': 'MEDICAL',
  '2': 'SECURITY',
  '3': 'FIRE',
  '4': 'WOMEN_SAFETY',
  '5': 'MENTAL_HEALTH',
  '0': 'ADMIN_ESCALATION',
};

export function buildWelcomeInstructions(): IvrInstruction[] {
  return [
    {
      speak: { text: PROMPTS.welcome.en, language: 'en' },
      gatherDigits: { numDigits: 1, timeoutSeconds: 5, nextPath: '/v1/webhooks/ivr/voice/language' },
    },
    { speak: { text: PROMPTS.noResponse.en, language: 'en' } },
    { hangup: true },
  ];
}

export function buildDepartmentInstructions(language: Language): IvrInstruction[] {
  return [
    {
      speak: { text: PROMPTS.selectDepartment[language], language },
      gatherDigits: { numDigits: 1, timeoutSeconds: 8, nextPath: '/v1/webhooks/ivr/voice/department' },
    },
    { speak: { text: PROMPTS.noResponse[language], language } },
    { hangup: true },
  ];
}

export function buildBridgeInstructions(
  language: Language,
  responderNumbers: string[],
): IvrInstruction[] {
  return [
    { speak: { text: PROMPTS.bridging[language], language } },
    { dial: { numbers: responderNumbers, timeoutSeconds: 20 } },
  ];
}

export function buildGoodbyeInstructions(language: Language): IvrInstruction[] {
  return [
    { speak: { text: PROMPTS.goodbye[language], language } },
    { hangup: true },
  ];
}
