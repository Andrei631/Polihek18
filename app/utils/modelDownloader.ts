import { File, Paths } from 'expo-file-system';

export const MODEL_URLS = {
  LLAMA_MODEL: 'https://huggingface.co/software-mansion/react-native-executorch-llama-3.2/resolve/v0.5.0/llama-3.2-1B/spinquant/llama3_2_spinquant.pte',
  LLAMA_TOKENIZER: 'https://huggingface.co/software-mansion/react-native-executorch-llama-3.2/resolve/v0.5.0/tokenizer.json',
  LLAMA_CONFIG: 'https://huggingface.co/software-mansion/react-native-executorch-llama-3.2/resolve/v0.5.0/tokenizer_config.json',
  EMBEDDING_MODEL: 'https://huggingface.co/software-mansion/react-native-executorch-all-MiniLM-L6-v2/resolve/v0.5.0/all-MiniLM-L6-v2_xnnpack.pte',
  EMBEDDING_TOKENIZER: 'https://huggingface.co/software-mansion/react-native-executorch-all-MiniLM-L6-v2/resolve/v0.5.0/tokenizer.json',
};

const getDocPath = (filename: string) => new File(Paths.document, filename).uri;

export const MODEL_PATHS = {
  LLAMA_MODEL: getDocPath('llama3_2_spinquant.pte'),
  LLAMA_TOKENIZER: getDocPath('llama_tokenizer.json'),
  LLAMA_CONFIG: getDocPath('llama_tokenizer_config.json'),
  EMBEDDING_MODEL: getDocPath('all-MiniLM-L6-v2_xnnpack.pte'),
  EMBEDDING_TOKENIZER: getDocPath('embedding_tokenizer.json'),
};

export const checkModelsExist = async () => {
  const results = Object.values(MODEL_PATHS).map((path) => new File(path).exists);
  return results.every((exists) => exists);
};

export const downloadFile = async (url: string, path: string, onProgress?: (progress: number) => void) => {
  const file = new File(path);
  if (onProgress) onProgress(0);
  
  try {
    await File.downloadFileAsync(url, file);
    if (onProgress) onProgress(1);
  } catch (e) {
    console.error(`Error downloading ${url}:`, e);
    throw e;
  }
};
