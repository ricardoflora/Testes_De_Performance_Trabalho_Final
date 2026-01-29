// Bibliotecas
const request = require('supertest')
const sinon = require('sinon')
const { expect } = require('chai')

// Aplicação
const app = require('../../../app')

// Mock
const memberService = require('../../../service/memberService')

// Testes
describe('Member Controller', () => {
    describe('POST /members/register', () => {
        it('Quando informo dados válidos recebo 201 CREATED', async () => {
            const resposta = await request(app)
                .post('/members/register')
                .send({
                    username: 'novo_membro',
                    password: 'senha123',
                    membershipType: 'standard'
                })
            
            expect(resposta.status).to.equal(201)
            expect(resposta.body).to.have.property('username', 'novo_membro')
            expect(resposta.body).to.have.property('membershipType', 'standard')
            expect(resposta.body).to.have.property('maxBooks', 3)
        })

        it('Quando informo dados obrigatórios faltando recebo 400', async () => {
            const resposta = await request(app)
                .post('/members/register')
                .send({
                    username: 'teste'
                    // password faltando
                })
            
            expect(resposta.status).to.equal(400)
            expect(resposta.body).to.have.property('error', 'Nome de usuário e senha são obrigatórios')
        })

        it('Usando Mocks: Quando usuário já existe recebo 400', async () => {
            const memberServiceMock = sinon.stub(memberService, 'registerMember')
            memberServiceMock.throws(new Error('Nome de usuário já está em uso'))

            const resposta = await request(app)
                .post('/members/register')
                .send({
                    username: 'alexandre',
                    password: 'senha123'
                })
            
            expect(resposta.status).to.equal(400)
            expect(resposta.body).to.have.property('error', 'Nome de usuário já está em uso')

            sinon.restore()
        })
    })

    describe('POST /members/login', () => {
        it('Quando informo credenciais válidas recebo 200', async () => {
            const resposta = await request(app)
                .post('/members/login')
                .send({
                    username: 'alexandre',
                    password: 'senha123'
                })
            
            expect(resposta.status).to.equal(200)
            expect(resposta.body).to.have.property('token')
            expect(resposta.body).to.have.property('member')
        })

        it('Quando informo credenciais inválidas recebo 400', async () => {
            const resposta = await request(app)
                .post('/members/login')
                .send({
                    username: 'usuario_inexistente',
                    password: 'senha123'
                })
            
            expect(resposta.status).to.equal(400)
            expect(resposta.body).to.have.property('error', 'Membro não encontrado')
        })
    })

    describe('GET /members', () => {
        it('Quando listo membros recebo 200', async () => {
            const resposta = await request(app)
                .get('/members')
            
            expect(resposta.status).to.equal(200)
            expect(resposta.body).to.be.an('array')
        })
    })
})
