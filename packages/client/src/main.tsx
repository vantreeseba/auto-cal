import {
  ApolloClient,
  ApolloProvider,
  createQueryPreloader,
  from,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { routeTree } from './routeTree.gen';
import './index.css';

const httpLink = new HttpLink({
  uri: '/graphql',
  headers: {},
  fetch: (uri, options) => {
    const token = localStorage.getItem('auth_token');
    const headers = new Headers(options?.headers as HeadersInit | undefined);
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return fetch(uri as RequestInfo, { ...(options as RequestInit), headers });
  },
});

const errorLink = onError(({ graphQLErrors }) => {
  const isUnauthenticated = graphQLErrors?.some((e) =>
    e.message.includes('Not authenticated'),
  );
  if (isUnauthenticated) {
    localStorage.removeItem('auth_token');
    window.location.replace('/login');
  }
});

const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
  },
});

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  context: {
    apolloClient: client,
    preloadQuery: createQueryPreloader(client),
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export interface MyRouterContext {
  apolloClient: ApolloClient;
  preloadQuery: ReturnType<typeof createQueryPreloader>;
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <RouterProvider router={router} />
    </ApolloProvider>
  </StrictMode>,
);
