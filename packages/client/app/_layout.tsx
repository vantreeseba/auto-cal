import { apolloClient } from '@/apollo-client';
import { ApolloProvider } from '@apollo/client/react';
import { Stack } from 'expo-router';
import '../global.css';
import '../src/index.css';

export default function RootLayout() {
  return (
    <ApolloProvider client={apolloClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </ApolloProvider>
  );
}
