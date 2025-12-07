import {
    ExecuTorchEmbeddings,
    ExecuTorchLLM,
} from '@react-native-rag/executorch';
import { OPSQLiteVectorStore } from '@react-native-rag/op-sqlite';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
    ALL_MINILM_L6_V2,
    LLAMA3_2_1B_SPINQUANT,
    useLLM,
} from 'react-native-executorch';
import { MANUALS_DATA } from '../data/manuals';

interface RAGContextType {
  vectorStore: OPSQLiteVectorStore | null;
  llm: ExecuTorchLLM | null;
  isReady: boolean;
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
  progress: { embeddings: 0, llm: 0, llmDownload: 0 },
});

export function RAGProvider({ children }: { children: React.ReactNode }) {
  const [embeddingsProgress, setEmbeddingsProgress] = useState(0);
  const [llmProgress, setLlmProgress] = useState(0);
  const [isStoreReady, setIsStoreReady] = useState(false);

  const llmHook = useLLM({
    model: LLAMA3_2_1B_SPINQUANT,
  });

  const embeddings = useMemo(() => {
    return new ExecuTorchEmbeddings({
      ...ALL_MINILM_L6_V2,
      onDownloadProgress: setEmbeddingsProgress,
    });
  }, []);

  const vectorStore = useMemo(() => {
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
    return new ExecuTorchLLM({
      ...LLAMA3_2_1B_SPINQUANT,
      onDownloadProgress: setLlmProgress,
    });
  }, []);

  useEffect(() => {
    const initStore = async () => {
      if (vectorStore) {
        try {
          await vectorStore.load();
              for (const manual of MANUALS_DATA) {
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

  const isReady = isStoreReady && llmHook.downloadProgress === 1;

  return (
    <RAGContext.Provider
      value={{
        vectorStore,
        llm,
        isReady,
        progress: {
          embeddings: embeddingsProgress,
          llm: llmProgress,
          llmDownload: llmHook.downloadProgress,
        },
      }}
    >
      {children}
    </RAGContext.Provider>
  );
}

export const useRAGContext = () => useContext(RAGContext);
