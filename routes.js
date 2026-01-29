const express = require('express')
const memberController = require('../controller/memberController')
const bookController = require('../controller/bookController')
const loanController = require('../controller/loanController')

const router = express.Router()

router.use('/members', memberController)
router.use('/books', bookController)
router.use('/loans', loanController)

module.exports = router
