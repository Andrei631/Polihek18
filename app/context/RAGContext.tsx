import {
    ExecuTorchEmbeddings,
    ExecuTorchLLM,
} from '@react-native-rag/executorch';
import { OPSQLiteVectorStore } from '@react-native-rag/op-sqlite';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getFirestore, collection, getDocs } from '@react-native-firebase/firestore';
import { Manual, MANUALS_DATA } from '../data/manuals';
import { checkModelsExist, downloadFile, MODEL_PATHS, MODEL_URLS } from '../utils/modelDownloader';

interface RAGContextType {
  vectorStore: OPSQLiteVectorStore | null;
  llm: ExecuTorchLLM | null;
  manuals: (Manual & { category: string })[];
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
  manuals: [],
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
  const [manuals, setManuals] = useState<(Manual & { category: string })[]>([]);

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
          
          await downloadFile(MODEL_URLS.EMBEDDING_MODEL, MODEL_PATHS.EMBEDDING_MODEL, setEmbeddingsProgress);
          await downloadFile(MODEL_URLS.EMBEDDING_TOKENIZER, MODEL_PATHS.EMBEDDING_TOKENIZER);
          
          
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
          
          
          const db = getFirestore();
          const categories = Object.keys(MANUALS_DATA.dataset);
          
          const manualsPromises = categories.map(async (category) => {
            const manualsSnapshot = await getDocs(collection(db, 'dataset', category, 'manuals'));
            return manualsSnapshot.docs.map(doc => ({
              ...(doc.data() as Manual),
              category: category.replace(/_/g, ' ')
            }));
          });

          const manualsArrays = await Promise.all(manualsPromises);
          const allManuals = manualsArrays.flat();
          setManuals(allManuals);

          for (const manual of allManuals) {
            try {
              await vectorStore.add({
                id: manual.id.toString(),
                document: JSON.stringify(manual),
                metadata: { type: 'manual', title: manual.disaster_type }
              });
            } catch (e) {
              
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
        manuals,
        isReady,
        isDownloading: downloading,
        progress: {
          embeddings: embeddingsProgress,
          llm: llmProgress,
          llmDownload: llmProgress, 
        },
      }}
    >
      {children}
    </RAGContext.Provider>
  );
}

export const useRAGContext = () => useContext(RAGContext);
