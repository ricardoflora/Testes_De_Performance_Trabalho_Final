const { books } = require('../model/bookModel')
const { loans } = require('../model/loanModel')
const { members } = require('../model/memberModel')

function resetState() {
    // Reset books
    books.forEach(b => b.available = true)

    // Reset loans
    loans.length = 0

    // Reset member borrowed books
    members.forEach(m => m.borrowedBooks = [])
}

module.exports = { resetState }
