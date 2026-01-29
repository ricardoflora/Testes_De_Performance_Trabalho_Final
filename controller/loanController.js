
const express = require('express')
const router = express.Router()
const loanService = require('../service/loanService')
const authenticateToken = require('../middleware/authenticateToken')

router.post('/borrow', authenticateToken, (req, res) => {
  const { bookId, days } = req.body
  const memberUsername = req.user.username
  if (!bookId) return res.status(400).json({ error: 'ID do livro é obrigatório' })
  try {
    const loan = loanService.borrowBook({ memberUsername, bookId, days })
    res.status(201).json(loan)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.post('/return', authenticateToken, (req, res) => {
  const { bookId } = req.body
  const memberUsername = req.user.username
  if (!bookId) return res.status(400).json({ error: 'ID do livro é obrigatório' })
  try {
    const loan = loanService.returnBook({ memberUsername, bookId })
    res.json(loan)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.get('/', authenticateToken, (req, res) => {
  res.json(loanService.listLoans())
})

router.get('/my-loans', authenticateToken, (req, res) => {
  const memberUsername = req.user.username
  res.json(loanService.getMemberLoans(memberUsername))
})

router.get('/overdue', authenticateToken, (req, res) => {
  res.json(loanService.getOverdueLoans())
})

module.exports = router
