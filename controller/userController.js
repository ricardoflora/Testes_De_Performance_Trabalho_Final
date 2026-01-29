const express = require('express')
const router = express.Router()
const memberService = require('../service/memberService')

router.post('/register', (req, res) => {
  const { username, password, membershipType } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Nome de usuário e senha são obrigatórios' })
  try {
    const member = memberService.registerMember({ username, password, membershipType })
    res.status(201).json(member)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.post('/login', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Credenciais de acesso são obrigatórias' })
  try {
    const member = memberService.loginMember({ username, password })
    // Gerar token JWT
    const jwt = require('jsonwebtoken')
    const SECRET = process.env.JWT_SECRET || 'secretdemo'
    const token = jwt.sign({ username: member.username }, SECRET, { expiresIn: '2h' })
    res.json({ member, token })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.get('/', (req, res) => {
  res.json(memberService.listMembers())
})

module.exports = router
