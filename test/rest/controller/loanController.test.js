// Bibliotecas
const request = require('supertest')
const sinon = require('sinon')
const { expect } = require('chai')
const { resetState } = require('../../testHelper')

// Aplicação
const app = require('../../../app')

// Mock
const loanService = require('../../../service/loanService')

// Testes
describe('Loan Controller', () => {
    before(() => {
        resetState()
    })

    describe('POST /loans/borrow', () => {

        beforeEach(async () => {
            const respostaLogin = await request(app)
                .post('/members/login')
                .send({
                    username: 'alexandre',
                    password: 'senha123'
                })

            token = respostaLogin.body.token
        })

        it('Quando informo livro inexistente recebo 400', async () => {
            const resposta = await request(app)
                .post('/loans/borrow')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    bookId: 999
                })
            
            expect(resposta.status).to.equal(400)
            expect(resposta.body).to.have.property('error', 'Livro não encontrado')
        })

        it('Usando Mocks: Quando informo livro inexistente recebo 400', async () => {
            // Mocar apenas a função borrowBook do Service
            const loanServiceMock = sinon.stub(loanService, 'borrowBook')
            loanServiceMock.throws(new Error('Livro não encontrado'))

            const resposta = await request(app)
                .post('/loans/borrow')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    bookId: 1
                })
            
            expect(resposta.status).to.equal(400)
            expect(resposta.body).to.have.property('error', 'Livro não encontrado')
        })

        it('Usando Mocks: Quando informo dados válidos eu tenho sucesso com 201 CREATED', async () => {
            // Mocar apenas a função borrowBook do Service
            const loanServiceMock = sinon.stub(loanService, 'borrowBook')
            loanServiceMock.returns({ 
                id: 1,
                memberUsername: "alexandre", 
                bookId: 1, 
                bookTitle: "O Senhor dos Anéis",
                borrowDate: new Date().toISOString(),
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'active'
            })

            const resposta = await request(app)
                .post('/loans/borrow')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    bookId: 1,
                    days: 14
                })
            
            expect(resposta.status).to.equal(201)
            
            // Validação com um Fixture
            const respostaEsperada = require('../fixture/respostas/quandoInformoValoresValidosEuTenhoSucessoCom201Created.json')
            delete resposta.body.borrowDate
            delete resposta.body.dueDate
            delete respostaEsperada.borrowDate
            delete respostaEsperada.dueDate 
            expect(resposta.body).to.deep.equal(respostaEsperada)
        })

        afterEach(() => {
            // Reseto o Mock
            sinon.restore()
        })
    })

    describe('POST /loans/return', () => {
        it('Quando devolvo um livro com sucesso recebo 200', async () => {
            // Primeiro empresta um livro
            await request(app)
                .post('/loans/borrow')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    bookId: 2,
                    days: 14
                })

            // Agora devolve o livro
            const resposta = await request(app)
                .post('/loans/return')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    bookId: 2
                })
            
            expect(resposta.status).to.equal(200)
        })
    })

    describe('GET /loans', () => {
        it('Quando listo empréstimos recebo 200', async () => {
            const resposta = await request(app)
                .get('/loans')
                .set('Authorization', `Bearer ${token}`)
            
            expect(resposta.status).to.equal(200)
        })
    })
})
