import {
  ApolloClient,
  ApolloProvider,
  createQueryPreloader,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { routeTree } from './routeTree.gen';
import './index.css';

const httpLink = new HttpLink({
  uri: '/graphql',
  headers: {
    authorization: 'Bearer 00000000-0000-0000-0000-000000000001',
  },
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
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
