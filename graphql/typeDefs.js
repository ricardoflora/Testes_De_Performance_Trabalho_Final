const { gql } = require('apollo-server-express')

module.exports = gql`
  type Member {
    username: String!
    membershipType: String!
    maxBooks: Int!
    borrowedBooks: [Int!]!
  }

  type Book {
    id: Int!
    title: String!
    author: String!
    isbn: String!
    available: Boolean!
    category: String!
  }

  type Loan {
    id: Int!
    memberUsername: String!
    bookId: Int!
    bookTitle: String!
    borrowDate: String!
    dueDate: String!
    returnDate: String
    status: String!
  }

  type AuthPayload {
    token: String!
    member: Member!
  }

  type Query {
    members: [Member!]!
    books: [Book!]!
    searchBooks(query: String!): [Book!]!
    loans: [Loan!]!
    myLoans: [Loan!]!
    overdueLoans: [Loan!]!
  }

  type Mutation {
    registerMember(username: String!, password: String!, membershipType: String): Member!
    loginMember(username: String!, password: String!): AuthPayload!
    borrowBook(bookId: Int!, days: Int): Loan!
    returnBook(bookId: Int!): Loan!
  }
`
