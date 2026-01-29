const bcrypt = require('bcryptjs')

// In-memory library members database
const members = [
  {
    username: 'alexandre', 
    password: bcrypt.hashSync('senha123', 8), 
    membershipType: 'premium', 
    maxBooks: 5,
    borrowedBooks: []
  },
  {
    username: 'maria', 
    password: bcrypt.hashSync('senha123', 8), 
    membershipType: 'standard', 
    maxBooks: 3,
    borrowedBooks: []
  },
  {
    username: 'carlos', 
    password: bcrypt.hashSync('senha123', 8), 
    membershipType: 'premium', 
    maxBooks: 5,
    borrowedBooks: []
  }
]

module.exports = {
  members
}
