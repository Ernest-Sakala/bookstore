import { InMemoryCache, ApolloLink } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';

export function apolloOptionsFactory() {
  const httpLink = inject(HttpLink);

  // 🔐 Auth link (replaces deprecated setContext)
  const authLink = new ApolloLink((operation, forward) => {
    const raw = localStorage.getItem('bookstore_user');
    const user = raw ? JSON.parse(raw) : null;
    const token = user?.token;

    operation.setContext(({ headers = {} }) => ({
      headers: new HttpHeaders({
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      })
    }));

    return forward(operation);
  });

  const http = httpLink.create({
    uri: environment.graphqlUrl
  });

  return {
    link: authLink.concat(http),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network'
      },
      query: {
        fetchPolicy: 'network-only'
      }
    }
  };
}
