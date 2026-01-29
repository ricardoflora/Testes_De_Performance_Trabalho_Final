const express = require('express')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json')
const memberController = require('./controller/memberController')
const bookController = require('./controller/bookController')
const loanController = require('./controller/loanController')

const app = express()
app.use(express.json())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use('/members', memberController)
app.use('/books', bookController)
app.use('/loans', loanController)

module.exports = app
