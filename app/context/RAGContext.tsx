import {
    ExecuTorchEmbeddings,
    ExecuTorchLLM,
} from '@react-native-rag/executorch';
import { OPSQLiteVectorStore } from '@react-native-rag/op-sqlite';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { MANUALS_DATA } from '../data/manuals';
import { checkModelsExist, downloadFile, MODEL_PATHS, MODEL_URLS } from '../utils/modelDownloader';

interface RAGContextType {
  vectorStore: OPSQLiteVectorStore | null;
  llm: ExecuTorchLLM | null;
  isReady: boolean;
  isDownloading: boolean;
  progress: {
    embeddings: number;
    llm: number;
    llmDownload: number;
  };
}

const RAGContext = createContext<RAGContextType>({
  vectorStore: null,
  llm: null,
  isReady: false,
  isDownloading: false,
  progress: { embeddings: 0, llm: 0, llmDownload: 0 },
});

export function RAGProvider({ children }: { children: React.ReactNode }) {
  const [embeddingsProgress, setEmbeddingsProgress] = useState(0);
  const [llmProgress, setLlmProgress] = useState(0);
  const [isStoreReady, setIsStoreReady] = useState(false);
  const [areModelsDownloaded, setAreModelsDownloaded] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const initModels = async () => {
      const exists = await checkModelsExist();
      if (exists) {
        setAreModelsDownloaded(true);
        setEmbeddingsProgress(1);
        setLlmProgress(1);
      } else {
        setDownloading(true);
        try {
          // Download Embeddings
          await downloadFile(MODEL_URLS.EMBEDDING_MODEL, MODEL_PATHS.EMBEDDING_MODEL, setEmbeddingsProgress);
          await downloadFile(MODEL_URLS.EMBEDDING_TOKENIZER, MODEL_PATHS.EMBEDDING_TOKENIZER);
          
          // Download LLM
          await downloadFile(MODEL_URLS.LLAMA_MODEL, MODEL_PATHS.LLAMA_MODEL, setLlmProgress);
          await downloadFile(MODEL_URLS.LLAMA_TOKENIZER, MODEL_PATHS.LLAMA_TOKENIZER);
          await downloadFile(MODEL_URLS.LLAMA_CONFIG, MODEL_PATHS.LLAMA_CONFIG);
          
          setAreModelsDownloaded(true);
        } catch (e) {
          console.error("Failed to download models", e);
        } finally {
          setDownloading(false);
        }
      }
    };
    initModels();
  }, []);

  const embeddings = useMemo(() => {
    if (!areModelsDownloaded) return null;
    return new ExecuTorchEmbeddings({
      modelSource: MODEL_PATHS.EMBEDDING_MODEL,
      tokenizerSource: MODEL_PATHS.EMBEDDING_TOKENIZER,
    });
  }, [areModelsDownloaded]);

  const vectorStore = useMemo(() => {
    if (!embeddings) return null;
    try {
      return new OPSQLiteVectorStore({
        name: 'rag_central_db',
        embeddings,
      });
    } catch (error) {
      console.error('Error creating vector store:', error);
      return null;
    }
  }, [embeddings]);

  const llm = useMemo(() => {
    if (!areModelsDownloaded) return null;
    return new ExecuTorchLLM({
      modelSource: MODEL_PATHS.LLAMA_MODEL,
      tokenizerSource: MODEL_PATHS.LLAMA_TOKENIZER,
      tokenizerConfigSource: MODEL_PATHS.LLAMA_CONFIG,
    });
  }, [areModelsDownloaded]);

  useEffect(() => {
    const initStore = async () => {
      if (vectorStore) {
        try {
          await vectorStore.load();
          
          // Flatten the dataset to get all manuals
          const allManuals = Object.values(MANUALS_DATA.dataset).flat();

          for (const manual of allManuals) {
            try {
              await vectorStore.add({
                id: manual.id.toString(),
                document: JSON.stringify(manual),
                metadata: { type: 'manual', title: manual.disaster_type }
              });
            } catch (e) {
              // Ignore if already exists
            }
          }
          
          setIsStoreReady(true);
        } catch (e) {
          console.error("Failed to load vector store", e);
        }
      }
    };
    initStore();
  }, [vectorStore]);

  const isReady = isStoreReady && areModelsDownloaded;

  return (
    <RAGContext.Provider
      value={{
        vectorStore,
        llm,
        isReady,
        isDownloading: downloading,
        progress: {
          embeddings: embeddingsProgress,
          llm: llmProgress,
          llmDownload: llmProgress, // Mapping manual download progress
        },
      }}
    >
      {children}
    </RAGContext.Provider>
  );
}

export const useRAGContext = () => useContext(RAGContext);
