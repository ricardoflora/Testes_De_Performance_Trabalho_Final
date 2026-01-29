const { members } = require('../model/memberModel')
const bcrypt = require('bcryptjs')

function findMemberByUsername(username) {
  return members.find(m => m.username === username)
}

function registerMember({ username, password, membershipType = 'standard' }) {
  if (findMemberByUsername(username)) {
    throw new Error('Nome de usuário já está em uso')
  }
  const hashedPassword = bcrypt.hashSync(password, 8)
  const maxBooks = membershipType === 'premium' ? 5 : 3
  const member = { 
    username, 
    password: hashedPassword, 
    membershipType, 
    maxBooks,
    borrowedBooks: []
  }
  members.push(member)
  return { 
    username, 
    membershipType: member.membershipType, 
    maxBooks: member.maxBooks,
    borrowedBooks: member.borrowedBooks
  }
}

function loginMember({ username, password }) {
  const member = findMemberByUsername(username)
  if (!member) throw new Error('Membro não encontrado')
  if (!bcrypt.compareSync(password, member.password)) throw new Error('Credenciais incorretas')
  return { 
    username: member.username, 
    membershipType: member.membershipType, 
    maxBooks: member.maxBooks,
    borrowedBooks: member.borrowedBooks
  }
}

function listMembers() {
  return members.map(m => ({ 
    username: m.username, 
    membershipType: m.membershipType, 
    maxBooks: m.maxBooks,
    borrowedBooks: m.borrowedBooks
  }))
}

module.exports = { registerMember, loginMember, listMembers, findMemberByUsername }
