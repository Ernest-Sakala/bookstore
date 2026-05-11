import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { provideQuillConfig } from 'ngx-quill';
import { ApolloLink, InMemoryCache } from '@apollo/client/core';
import UploadHttpLink from 'apollo-upload-client/UploadHttpLink.mjs';

const STORAGE_KEY = 'bookstore_user';

const authLink = new ApolloLink((operation, forward) => {
  const raw   = localStorage.getItem(STORAGE_KEY);
  const token = raw ? JSON.parse(raw).token : null;

  operation.setContext(({ headers = {} }: { headers: Record<string, string> }) => ({
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }));

  return forward(operation);
});

const uploadLink = new UploadHttpLink({ uri: 'http://localhost:8080/graphql' });

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideQuillConfig({
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link'],
          ['clean'],
        ],
      },
    }),
    provideApollo(() => ({
      link: authLink.concat(uploadLink),
      cache: new InMemoryCache(),
    })),
  ],
};
