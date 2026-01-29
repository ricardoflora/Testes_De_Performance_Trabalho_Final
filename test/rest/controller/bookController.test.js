// Bibliotecas
const request = require('supertest')
const sinon = require('sinon')
const { expect } = require('chai')

// Aplicação
const app = require('../../../app')

// Mock
const bookService = require('../../../service/bookService')

// Testes
describe('Book Controller', () => {
    describe('GET /books', () => {
        it('Quando listo livros recebo 200', async () => {
            const resposta = await request(app)
                .get('/books')
            
            expect(resposta.status).to.equal(200)
            expect(resposta.body).to.be.an('array')
            expect(resposta.body[0]).to.have.property('id')
            expect(resposta.body[0]).to.have.property('title')
            expect(resposta.body[0]).to.have.property('author')
        })
    })

    describe('GET /books/search', () => {
        it('Quando busco por termo válido recebo 200', async () => {
            const resposta = await request(app)
                .get('/books/search?q=tolkien')
            
            expect(resposta.status).to.equal(200)
            expect(resposta.body).to.be.an('array')
        })

        it('Quando não informo parâmetro de busca recebo 400', async () => {
            const resposta = await request(app)
                .get('/books/search')
            
            expect(resposta.status).to.equal(400)
            expect(resposta.body).to.have.property('error', 'Parâmetro de busca (q) é obrigatório')
        })

        it('Usando Mocks: Quando busco livros recebo resultado filtrado', async () => {
            const bookServiceMock = sinon.stub(bookService, 'searchBooks')
            bookServiceMock.returns([
                {
                    id: 1,
                    title: "O Senhor dos Anéis",
                    author: "J.R.R. Tolkien",
                    isbn: "978-8533613409",
                    available: true,
                    category: "Fantasia"
                }
            ])

            const resposta = await request(app)
                .get('/books/search?q=tolkien')
            
            expect(resposta.status).to.equal(200)
            expect(resposta.body).to.have.length(1)
            expect(resposta.body[0].title).to.equal("O Senhor dos Anéis")

            sinon.restore()
        })
    })

    describe('GET /books/:id', () => {
        it('Quando busco livro existente recebo 200', async () => {
            const resposta = await request(app)
                .get('/books/1')
            
            expect(resposta.status).to.equal(200)
            expect(resposta.body).to.have.property('id', 1)
            expect(resposta.body).to.have.property('title')
        })

        it('Quando busco livro inexistente recebo 404', async () => {
            const resposta = await request(app)
                .get('/books/999')
            
            expect(resposta.status).to.equal(404)
            expect(resposta.body).to.have.property('error', 'Livro não encontrado')
        })
    })
})
