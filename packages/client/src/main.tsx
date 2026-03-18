import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const client = new ApolloClient({
  uri: '/graphql',
  cache: new InMemoryCache(),
  // For demo purposes, we'll add a fixed user ID
  // In production, this would come from authentication
  headers: {
    authorization: 'Bearer 00000000-0000-0000-0000-000000000001',
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>,
);
