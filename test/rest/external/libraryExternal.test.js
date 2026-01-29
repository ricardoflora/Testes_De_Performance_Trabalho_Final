// Bibliotecas
const request = require('supertest')
const { expect } = require('chai')
const { resetState } = require('../../testHelper')

// Testes
describe('Library System External Tests', () => {
    before(async () => {
        resetState()
        const respostaLogin = await request('http://localhost:3000')
            .post('/members/login')
            .send({
                username: 'alexandre',
                password: 'senha123'
            })

        token = respostaLogin.body.token
    })

    describe('POST /loans/borrow', () => {
        it('Quando informo livro inexistente recebo 400', async () => {
            const resposta = await request('http://localhost:3000')
                .post('/loans/borrow')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    bookId: 999
                })
            
            expect(resposta.status).to.equal(400)
            expect(resposta.body).to.have.property('error', 'Livro não encontrado')
        })

        it('Quando informo dados válidos eu tenho sucesso com 201 CREATED', async () => {
            // Usar um livro diferente para evitar conflitos
            const resposta = await request('http://localhost:3000')
                .post('/loans/borrow')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    bookId: 2,
                    days: 14
                })

            expect(resposta.status).to.equal(201)
            expect(resposta.body).to.have.property('id')
            expect(resposta.body).to.have.property('memberUsername', 'alexandre')
            expect(resposta.body).to.have.property('bookId', 2)
            expect(resposta.body).to.have.property('status', 'active')
        })
    })

    describe('GET /books', () => {
        it('Quando listo livros recebo 200', async () => {
            const resposta = await request('http://localhost:3000')
                .get('/books')
            
            expect(resposta.status).to.equal(200)
            expect(resposta.body).to.be.an('array')
            expect(resposta.body.length).to.be.greaterThan(0)
        })
    })

    describe('GET /books/search', () => {
        it('Quando busco livros por termo recebo 200', async () => {
            const resposta = await request('http://localhost:3000')
                .get('/books/search?q=tolkien')
            
            expect(resposta.status).to.equal(200)
            expect(resposta.body).to.be.an('array')
        })
    })
})
