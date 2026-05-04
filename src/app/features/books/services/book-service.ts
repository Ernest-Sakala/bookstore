import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map, Observable } from 'rxjs';
import { BOOKS_QUERY, BOOK_BY_ID_QUERY } from '../../../core/graphql/operations';

export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  imageSlug: string;
  price?: number;
  description?: string;
}

export interface BookPage {
  books: Book[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class BookService {

  constructor(private apollo: Apollo) {}

  getBooks(page = 0, size = 8, category?: string): Observable<BookPage> {
    return this.apollo.query<{ books: BookPage }>({
      query: BOOKS_QUERY,
      variables: { page, size, category: category || null },
      fetchPolicy: 'network-only',
    }).pipe(map(r => r.data!.books as unknown as BookPage));
  }

  searchBooks(search: string, page = 0, size = 8, category?: string): Observable<BookPage> {
    return this.apollo.query<{ books: BookPage }>({
      query: BOOKS_QUERY,
      variables: { search, page, size, category: category || null },
      fetchPolicy: 'network-only',
    }).pipe(map(r => r.data!.books as unknown as BookPage));
  }

  getBookById(id: string | number): Observable<Book | null> {
    return this.apollo.query<{ book: Book | null }>({
      query: BOOK_BY_ID_QUERY,
      variables: { id },
      fetchPolicy: 'network-only',
    }).pipe(map(r => r.data?.book ?? null));
  }

  uploadBook(title: string, author: string, category: string,
             image?: File | null, price?: number, description?: string) {
    return this.apollo.mutate({
      mutation: gql`
        mutation uploadBook($title: String!, $author: String!, $category: String!,
                            $image: Upload!, $price: Float, $description: String) {
          uploadBook(title: $title, author: $author, category: $category,
                     image: $image, price: $price, description: $description) {
            id title author price description
          }
        }
      `,
      variables: { title, author, category, image, price, description },
    });
  }

  deleteBook(id: number): Observable<boolean> {
    return this.apollo.mutate<{ deleteBook: boolean }>({
      mutation: gql`mutation DeleteBook($id: ID!) { deleteBook(id: $id) }`,
      variables: { id },
    }).pipe(map(r => r.data?.deleteBook ?? false));
  }
}
