import { Injectable } from '@angular/core';
import {Apollo, gql} from 'apollo-angular';
import {map, Observable} from 'rxjs';
import {DeepPartial} from '@apollo/client/utilities';


export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  imageSlug: string;
  filePath: string;
}


@Injectable({
  providedIn: 'root',
})
export class BookService {

  constructor(private apollo: Apollo) {}

  getBooks(): Observable<Book[]> {
    return this.apollo
      .watchQuery<{ books: DeepPartial<Book>[] }>({
        query: gql`
        query {
          books {
            id
            title
            author
            category
            imageSlug
            filePath
          }
        }
      `,
      })
      .valueChanges.pipe(
        map(result => {
          const books = result.data?.books ?? [];
          return books.map(b => ({
            id: b.id ?? 0,                  // provide default 0 if undefined
            title: b.title ?? 'Unknown',
            author: b.author ?? 'Unknown',
            category: b.category ?? 'Unknown',
            imageSlug: b.imageSlug ?? '',
            filePath: b.filePath ?? '',
          }));
        })
      );
  }


  uploadBook(
    title: string,
    author: string,
    category: string,
    image: File,
    file: File
  ) {
    return this.apollo.mutate({
      mutation: gql`
      mutation uploadBook(
        $title: String!
        $author: String!
        $category: String!
        $image: Upload!
        $file: Upload!
      ) {
        uploadBook(
          title: $title
          author: $author
          category: $category
          image: $image
          file: $file
        ) {
          id
          title
          author
        }
      }
    `,
      variables: {
        title,
        author,
        category,
        image,
        file
      }
    });
  }


  deleteBook(id: number): Observable<boolean> {
    return this.apollo.mutate<{ deleteBook: boolean }>({
      mutation: gql`
        mutation DeleteBook($id: ID!) {
          deleteBook(id: $id)
        }
      `,
      variables: { id }
    }).pipe(
      map(result => result.data?.deleteBook ?? false)
    );
  }
}
