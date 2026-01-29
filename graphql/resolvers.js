const memberService = require('../service/memberService')
const bookService = require('../service/bookService')
const loanService = require('../service/loanService')
const jwt = require('jsonwebtoken')
const SECRET = process.env.JWT_SECRET || 'secretdemo'

module.exports = {
  Query: {
    members: () => memberService.listMembers(),
    books: () => bookService.listBooks(),
    searchBooks: (parent, { query }) => {
      return bookService.searchBooks(query)
    },
    loans: (parent, args, context) => {
      if (!context.user) throw new Error('Autenticação obrigatória')
      return loanService.listLoans()
    },
    myLoans: (parent, args, context) => {
      if (!context.user) throw new Error('Autenticação obrigatória')
      return loanService.getMemberLoans(context.user.username)
    },
    overdueLoans: (parent, args, context) => {
      if (!context.user) throw new Error('Autenticação obrigatória')
      return loanService.getOverdueLoans()
    },
  },
  Mutation: {
    registerMember: (parent, { username, password, membershipType }) => {
      return memberService.registerMember({ username, password, membershipType })
    },
    loginMember: (parent, { username, password }) => {
      const member = memberService.loginMember({ username, password })
      const token = jwt.sign({ username: member.username }, SECRET, { expiresIn: '2h' })
      return { token, member }
    },
    borrowBook: (parent, { bookId, days }, context) => {
      if (!context.user) throw new Error('Autenticação obrigatória')
      return loanService.borrowBook({ memberUsername: context.user.username, bookId, days })
    },
    returnBook: (parent, { bookId }, context) => {
      if (!context.user) throw new Error('Autenticação obrigatória')
      return loanService.returnBook({ memberUsername: context.user.username, bookId })
    },
  },
}
