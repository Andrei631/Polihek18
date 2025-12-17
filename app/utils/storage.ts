import { File, Paths } from 'expo-file-system';

const getConsentFile = (uid: string) => new File(Paths.document, `user_consent_${uid}.json`);

export const saveConsentLocally = async (uid: string, hasConsented: boolean) => {
  try {
    const consentFile = getConsentFile(uid);
    consentFile.create({ intermediates: true, overwrite: true });
    consentFile.write(JSON.stringify({ hasConsented }));
  } catch (error) {
    console.error('Error saving consent locally:', error);
  }
};

export const getLocalConsent = async (uid: string): Promise<boolean> => {
  try {
    const consentFile = getConsentFile(uid);
    if (!consentFile.exists) return false;
    const content = await consentFile.text();
    const data = JSON.parse(content);
    return data?.hasConsented === true;
  } catch (error) {
    console.error('Error reading local consent:', error);
    return false;
  }
};

export const clearLocalConsent = async (uid: string) => {
  try {
    const consentFile = getConsentFile(uid);
    if (consentFile.exists) consentFile.delete();
  } catch (error) {
    console.error('Error clearing local consent:', error);
  }
};
