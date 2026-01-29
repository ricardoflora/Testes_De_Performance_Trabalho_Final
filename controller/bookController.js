const express = require('express')
const router = express.Router()
const bookService = require('../service/bookService')

router.get('/', (req, res) => {
  res.json(bookService.listBooks())
})

router.get('/search', (req, res) => {
  const { q } = req.query
  if (!q) return res.status(400).json({ error: 'Parâmetro de busca (q) é obrigatório' })
  try {
    const results = bookService.searchBooks(q)
    res.json(results)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.get('/:id', (req, res) => {
  const { id } = req.params
  try {
    const book = bookService.findBookById(id)
    if (!book) return res.status(404).json({ error: 'Livro não encontrado' })
    res.json(book)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

module.exports = router
