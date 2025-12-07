import { Stack } from "expo-router";
import { RAGProvider } from "./context/RAGContext";

export default function RootLayout() {
  return (
    <RAGProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </RAGProvider>
  );
}
