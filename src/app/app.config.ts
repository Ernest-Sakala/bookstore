import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { InMemoryCache } from '@apollo/client';
import UploadHttpLink from 'apollo-upload-client/UploadHttpLink.mjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideApollo(() => {
      return {
        link: new UploadHttpLink({
          uri: 'http://localhost:8080/graphql', // your backend
        }),
        cache: new InMemoryCache(),
      };
    })
  ]
};
