import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  from,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      console.error(
        `[GraphQL error] Operation: ${operation.operationName} | Message: ${err.message} | Path: ${err.path?.join('.')}`,
      );
    }
  }
  if (networkError) {
    console.error(
      `[Network error] Operation: ${operation.operationName} | ${networkError.message}`,
    );
  }
});

const httpLink = new HttpLink({
  uri: '/graphql',
  headers: {
    // For demo purposes, we'll add a fixed user ID
    // In production, this would come from authentication
    authorization: 'Bearer 00000000-0000-0000-0000-000000000001',
  },
});

const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </ErrorBoundary>
  </StrictMode>,
);
