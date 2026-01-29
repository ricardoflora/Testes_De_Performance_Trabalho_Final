const { books } = require('../model/bookModel')

function findBookById(id) {
  return books.find(b => b.id === parseInt(id))
}

function findBookByTitle(title) {
  return books.find(b => b.title.toLowerCase().includes(title.toLowerCase()))
}

function listBooks() {
  return books.map(b => ({
    id: b.id,
    title: b.title,
    author: b.author,
    isbn: b.isbn,
    available: b.available,
    category: b.category
  }))
}

function searchBooks(query) {
  const searchTerm = query.toLowerCase()
  return books.filter(b => 
    b.title.toLowerCase().includes(searchTerm) ||
    b.author.toLowerCase().includes(searchTerm) ||
    b.category.toLowerCase().includes(searchTerm)
  ).map(b => ({
    id: b.id,
    title: b.title,
    author: b.author,
    isbn: b.isbn,
    available: b.available,
    category: b.category
  }))
}

function updateBookAvailability(bookId, available) {
  const book = findBookById(bookId)
  if (book) {
    book.available = available
    return book
  }
  throw new Error('Livro não encontrado')
}

module.exports = { 
  findBookById, 
  findBookByTitle, 
  listBooks, 
  searchBooks, 
  updateBookAvailability 
}
