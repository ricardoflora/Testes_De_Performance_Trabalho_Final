const request = require('supertest')
const { expect, use } = require('chai')
const { resetState } = require('../../testHelper')

const chaiExclude = require('chai-exclude')
use(chaiExclude)

describe('Testes de Biblioteca Digital GraphQL', () => {
    
    before(async () => {
        resetState()
        const loginMember = require('../fixture/requisicoes/login/loginUser.json')
        const resposta = await request('http://localhost:4000/graphql')
            .post('')
            .send(loginMember)

        token = resposta.body.data.loginMember.token
    })

    beforeEach(() => {
        borrowBook = require('../fixture/requisicoes/emprestimo/borrowBook.json')
    })
    
    it('Validar que é possível emprestar um livro', async () => {
        // Usar um livro diferente para evitar conflitos
        const borrowBookTest = {
            query: "mutation BorrowBook($bookId: Int!, $days: Int) { borrowBook(bookId: $bookId, days: $days) { id memberUsername bookId bookTitle borrowDate dueDate status } }",
            variables: {
                bookId: 1,
                days: 14
            }
        }

        const respostaEmprestimo = await request('http://localhost:4000/graphql')
            .post('')
            .set('Authorization', `Bearer ${token}`)
            .send(borrowBookTest)

        expect(respostaEmprestimo.status).to.equal(200)
        
        if (respostaEmprestimo.body.errors) {
            console.log('Erro GraphQL:', respostaEmprestimo.body.errors)
        }
        
        expect(respostaEmprestimo.body.data).to.not.be.null
        expect(respostaEmprestimo.body.data.borrowBook).to.have.property('id')
        expect(respostaEmprestimo.body.data.borrowBook).to.have.property('memberUsername', 'alexandre')
        expect(respostaEmprestimo.body.data.borrowBook).to.have.property('bookId', 1)
        expect(respostaEmprestimo.body.data.borrowBook).to.have.property('status', 'active')

    })

    it('Validar que não é possível emprestar um livro inexistente', async () => {
        borrowBook.variables.bookId = 999

        const respostaEmprestimo = await request('http://localhost:4000/graphql')
            .post('')
            .set('Authorization', `Bearer ${token}`)
            .send(borrowBook)

        expect(respostaEmprestimo.status).to.equal(200)
        expect(respostaEmprestimo.body.errors[0].message).to.equal('Livro não encontrado')
    })

    it('Validar que é possível listar livros', async () => {
        const query = {
            query: "query { books { id title author available } }"
        }

        const resposta = await request('http://localhost:4000/graphql')
            .post('')
            .send(query)

        expect(resposta.status).to.equal(200)
        expect(resposta.body.data.books).to.be.an('array')
        expect(resposta.body.data.books.length).to.be.greaterThan(0)
    })
})
