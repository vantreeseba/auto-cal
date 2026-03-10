import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import App from './App';
import './index.css';

const client = new ApolloClient({
  uri: '/graphql',
  cache: new InMemoryCache(),
  // For demo purposes, we'll add a fixed user ID
  // In production, this would come from authentication
  headers: {
    authorization: 'Bearer demo-user-id',
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
