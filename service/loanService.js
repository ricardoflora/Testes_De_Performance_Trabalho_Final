const { members } = require('../model/memberModel')
const { books } = require('../model/bookModel')
const { loans } = require('../model/loanModel')
const bookService = require('./bookService')

function borrowBook({ memberUsername, bookId, days = 14 }) {
  const member = members.find(m => m.username === memberUsername)
  const book = books.find(b => b.id === parseInt(bookId))
  
  if (!member) throw new Error('Membro não encontrado')
  if (!book) throw new Error('Livro não encontrado')
  if (!book.available) throw new Error('Livro não está disponível para empréstimo')
  if (member.borrowedBooks.length >= member.maxBooks) {
    throw new Error(`Limite de empréstimos excedido. Máximo permitido: ${member.maxBooks} livros`)
  }
  if (member.borrowedBooks.includes(bookId)) {
    throw new Error('Você já possui este livro emprestado')
  }
  if (days < 1 || days > 30) {
    throw new Error('Período de empréstimo deve ser entre 1 e 30 dias')
  }

  // Atualizar disponibilidade do livro
  bookService.updateBookAvailability(bookId, false)
  
  // Adicionar livro à lista de empréstimos do membro
  member.borrowedBooks.push(bookId)
  
  // Calcular data de devolução
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + days)
  
  const loan = { 
    id: loans.length + 1,
    memberUsername, 
    bookId, 
    bookTitle: book.title,
    borrowDate: new Date().toISOString(),
    dueDate: dueDate.toISOString(),
    status: 'active'
  }
  
  loans.push(loan)
  return loan
}

function returnBook({ memberUsername, bookId }) {
  const member = members.find(m => m.username === memberUsername)
  const book = books.find(b => b.id === parseInt(bookId))
  const loan = loans.find(l => l.memberUsername === memberUsername && l.bookId === parseInt(bookId) && l.status === 'active')
  
  if (!member) throw new Error('Membro não encontrado')
  if (!book) throw new Error('Livro não encontrado')
  if (!loan) throw new Error('Empréstimo não encontrado ou já devolvido')
  
  // Atualizar disponibilidade do livro
  bookService.updateBookAvailability(bookId, true)
  
  // Remover livro da lista de empréstimos do membro
  member.borrowedBooks = member.borrowedBooks.filter(id => id !== parseInt(bookId))
  
  // Marcar empréstimo como devolvido
  loan.status = 'returned'
  loan.returnDate = new Date().toISOString()
  
  return loan
}

function listLoans() {
  return loans
}

function getMemberLoans(memberUsername) {
  return loans.filter(l => l.memberUsername === memberUsername)
}

function getOverdueLoans() {
  const now = new Date()
  return loans.filter(l => 
    l.status === 'active' && 
    new Date(l.dueDate) < now
  )
}

module.exports = { 
  borrowBook, 
  returnBook, 
  listLoans, 
  getMemberLoans, 
  getOverdueLoans 
}
