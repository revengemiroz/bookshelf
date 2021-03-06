import { gql } from "apollo-server-express";

import { secureId } from "../../../common/secureId";
import { createTestClient } from "../../../testUtils/createTestClient";
import { createAuthor, createBook } from "../../../testUtils/factories";

describe("authors query", () => {
  it("fetches an author", async () => {
    await createAuthor({
      name: "J. R. R. Tolkien",
      bio:
        "John Ronald Reuel Tolkien was an English writer, poet, philologist, and academic. He was the author of the high fantasy works The Hobbit and The Lord of the Rings.",
      createdAt: new Date(Date.UTC(2019, 11, 31, 14, 30)),
      updatedAt: new Date(Date.UTC(2020, 6, 19, 13, 20))
    });

    // When
    const res = await createTestClient().query({
      query: gql`
        query($id: ExternalID!) {
          author(id: $id) {
            id
            name
            bio
            photo {
              url
            }
            createdAt
            updatedAt
          }
        }
      `,
      variables: { id: secureId.toExternal(1, "Author") }
    });

    // Then
    expect(res.errors).toBe(undefined);
    expect(res.data).not.toBeNull();
    expect(res.data).toMatchSnapshot();
  });

  it("fetches authors along with books", async () => {
    // Given
    const firstAuthor = await createAuthor();
    await createBook({ author: firstAuthor });
    await createBook({ author: firstAuthor });
    await createBook({ author: firstAuthor });

    const secondAuthor = await createAuthor();
    await createBook({ author: secondAuthor });
    await createBook({ author: secondAuthor });

    // When
    const res = await createTestClient().query({
      query: gql`
        query {
          authors {
            id
            name
            books {
              id
              title
              description
            }
          }
        }
      `
    });

    // Then
    expect(res.data).not.toBeNull();
    expect(res.data).toMatchSnapshot();
  });
});
