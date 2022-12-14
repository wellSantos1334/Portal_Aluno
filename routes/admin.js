const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const yup = require('yup')
const bcrypt = require('bcryptjs')
const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/

// models
require('../models/Aluno')
const Aluno = mongoose.model('alunos')
require('../models/Professor')
const Professor = mongoose.model('professores')
require('../models/Admin')
const Admin = mongoose.model('admins')
require('../models/Turma')
const Turma = mongoose.model('turmas')
require('../models/Aluno_Turma')
const Aluno_Turma = mongoose.model('alunos_turmas')
require('../models/Boletim')
const Boletim = mongoose.model('boletins')

// Páginas de Aluno
router.get('/criarAluno', async (req, res) => {
    res.json('Página para criar aluno')
})

router.post('/criarAluno', async (req, res) => {

    const schema = yup.object().shape({
        nome: yup.string().required('O nome é obrigatório').trim(),
        sobrenome: yup.string().required('O sobrenome é obrigatório').trim(),
        telefone: yup.string().required("O telefone é obrigatório").matches(phoneRegExp, 'O número informado não é válido').min(11, "Número informado é muito curto").max(12, "O número informado é muito longo"),
        endereco: yup.string().required('O endereço é obrigatório'),
        numEndereco: yup.number(),
        dataNasc: yup.date('É necessário que seja uma data').required('A data de nascimento é obrigatória'),
        email: yup.string().email().required('O e-mail é obrigatório').trim(),
        senha1: yup.string().min(8, 'A senha deve conter no mínimo 8 caracteres').required('A senha é obrigatória').trim(),
        senha2: yup.string().oneOf([yup.ref('senha1')], 'As senham devem ser iguais').required('A senha é obrigatória').trim()
    })
    try {
        await schema.validate(req.body)

        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(req.body.senha1, salt)

        await new Aluno({
            nome: req.body.nome,
            sobrenome: req.body.sobrenome,
            telefone: req.body.telefone,
            endereco: req.body.endereco,
            numEndereco: req.body.numEndereco,
            dataNasc: req.body.dataNasc,
            email: req.body.email,
            senha: hash
        }).save()


        res.json({
            msg: 'Aluno criado com sucesso.',
            dados:
            {
                nome: req.body.nome,
                sobrenome: req.body.sobrenome,
                telefone: req.body.telefone,
                endereco: req.body.endereco,
                numEndereco: req.body.numEndereco,
                dataNasc: req.body.dataNasc,
                email: req.body.email,
                senha: req.body.senha1
            }
        })
    } catch (err) {
        return res.status(400).json({
            error: true,
            msg: err.errors
        })
    }
})

router.get('/buscarAlunos', async (req, res) => {
    const dadosAluno = await Aluno.find()
    const todosAlunos = []

    for (let i = dadosAluno.length -1; i >= 0; i--) {
        const dadosAlunoTurma = await Aluno_Turma.findOne({alunoId: dadosAluno[i]._id})
        const dadosTurma = await Turma.findOne({_id: dadosAlunoTurma.turmaId})

        todosAlunos.push({
            infoPessoal: dadosAluno[i],
            dadosAlunoTurma: dadosAlunoTurma,
            nomeTurma: dadosTurma
        })
    }

    res.status(200).json({
        msg: 'Lista de alunos:',
        dados:
        {
            todosAlunos
        }
    })
})

router.get('/editarDadosAluno/:id', async (req, res) => {
    const alunoId = await req.params.id
    res.status(200).json({ msg: 'Pegar ID do Aluno pela URL', ID: alunoId })
})

router.put('/editarDadosAluno', async (req, res) => {
    const schema = yup.object().shape({
        nome: yup.string().required('O nome é obrigatório').trim(),
        sobrenome: yup.string().required('O sobrenome é obrigatório').trim(),
        telefone: yup.string().required("O telefone é obrigatório").matches(phoneRegExp, 'O número informado não é válido').min(11, "Número informado é muito curto").max(12, "O número informado é muito longo"),
        endereco: yup.string().required('O endereço é obrigatório'),
        numEndereco: yup.number(),
        dataNasc: yup.date('É necessário que seja uma data').required('A data de nascimento é obrigatória'),
        email: yup.string().email().required('O e-mail é obrigatório').trim()
    })
    try {
        await schema.validate(req.body)

        await Aluno.findOne({ _id: req.body.alunoId }).then((dados) => {

            dados.nome = req.body.nome,
                dados.sobrenome = req.body.sobrenome,
                dados.telefone = req.body.telefone,
                dados.endereco = req.body.endereco,
                dados.numEndereco = req.body.numEndereco,
                dados.dataNasc = req.body.dataNasc,
                dados.email = req.body.email
            dados.save().then(() => {
                res.json({
                    msg: 'Dados alterados com sucesso',
                    dados:
                    {
                        nome: req.body.nome,
                        sobrenome: req.body.sobrenome,
                        telefone: req.body.telefone,
                        endereco: req.body.endereco,
                        numEndereco: req.body.numEndereco,
                        dataNasc: req.body.dataNasc,
                        email: req.body.email,
                    }
                })
            })
        }).catch((err) => {
            console.log(err)
        })
    } catch (err) {
        return res.status(400).json({
            error: true,
            msg: err.errors
        })
    }
})

router.delete('/deletarAluno', async (req, res) => {
    await Aluno.deleteOne({ _id: req.body.alunoId }).then(() => {
        res.status(200).json({ msg: 'Aluno deletado com sucesso' })
    }).catch((err) => {
        res.json({ msg: 'Falha ao deletar aluno, tente novamentem mais tarde!' })
    })

})

// Páginas de Professor
router.get('/criarProfessor', async (req, res) => {
    res.json({ msg: 'Página Criar Professor' })
})

router.post('/criarProfessor', async (req, res) => {
    const schema = yup.object().shape({
        nome: yup.string().required('O nome é obrigatório').trim(),
        sobrenome: yup.string().required('O sobrenome é obrigatório').trim(),
        telefone: yup.string().required("required").matches(phoneRegExp, 'O número informado não é válido').min(11, "Número informado é muito curto").max(12, "O número informado é muito longo"),
        endereco: yup.string().required('O endereço é obrigatório'),
        numEndereco: yup.number(),
        dataNasc: yup.date('É necessário que seja uma data').required('A data de nascimento é obrigatória'),
        email: yup.string().email().required('O e-mail é obrigatório').trim(),
        senha1: yup.string().min(8, 'A senha deve conter no mínimo 8 caracteres').required('A senha é obrigatória').trim(),
        senha2: yup.string().oneOf([yup.ref('senha1')], 'As senham devem ser iguais').required('A senha é obrigatória').trim()
    })

    try {
        await schema.validate(req.body)
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(req.body.senha1, salt)

        await new Professor({
            nome: req.body.nome,
            sobrenome: req.body.sobrenome,
            telefone: req.body.telefone,
            endereco: req.body.endereco,
            numEndereco: req.body.numEndereco,
            dataNasc: req.body.dataNasc,
            email: req.body.email,
            senha: hash
        }).save()
        res.json({
            msg: 'Professor criado com sucesso.',
            dados:
            {
                nome: req.body.nome,
                sobrenome: req.body.sobrenome,
                telefone: req.body.telefone,
                endereco: req.body.endereco,
                numEndereco: req.body.numEndereco,
                dataNasc: req.body.dataNasc,
                email: req.body.email,
                senha: req.body.senha1
            }
        })
    } catch (err) {
        return res.status(400).json({
            error: true,
            msg: err.errors
        })
    }
})

router.get('/buscarProfessor', async (req, res) => {
    const dadosProfessor = await Professor.find()
    res.status(200).json({
        msg: 'Lista de professores:',
        dados:
        {
            dadosProfessor
        }
    })
})

router.get('/editarDadosProfessor/:id', async (req, res) => {
    const professorId = await req.params.id
    res.status(200).json({ msg: 'Pegar ID do Aluno pela URL', ID: professorId })
})

router.put('/editarDadosProfessor', async (req, res) => {
    const schema = yup.object().shape({
        nome: yup.string().required('O nome é obrigatório').trim(),
        sobrenome: yup.string().required('O sobrenome é obrigatório').trim(),
        telefone: yup.string().required("O telefone é obrigatório").matches(phoneRegExp, 'O número informado não é válido').min(11, "Número informado é muito curto").max(12, "O número informado é muito longo"),
        endereco: yup.string().required('O endereço é obrigatório'),
        numEndereco: yup.number(),
        dataNasc: yup.date('É necessário que seja uma data').required('A data de nascimento é obrigatória'),
        email: yup.string().email().required('O e-mail é obrigatório').trim()
    })
    try {
        await schema.validate(req.body)

        await Professor.findOne({ _id: req.body.professorId }).then((dados) => {

            dados.nome = req.body.nome,
                dados.sobrenome = req.body.sobrenome,
                dados.telefone = req.body.telefone,
                dados.endereco = req.body.endereco,
                dados.numEndereco = req.body.numEndereco,
                dados.dataNasc = req.body.dataNasc,
                dados.email = req.body.email
            dados.save().then(() => {
                res.json({
                    msg: 'Dados alterados com sucesso',
                    dados:
                    {
                        nome: req.body.nome,
                        sobrenome: req.body.sobrenome,
                        telefone: req.body.telefone,
                        endereco: req.body.endereco,
                        numEndereco: req.body.numEndereco,
                        dataNasc: req.body.dataNasc,
                        email: req.body.email,
                    }
                })
            })
        }).catch((err) => {
            console.log(err)
        })
    } catch (err) {
        return res.status(400).json({
            error: true,
            msg: err.errors
        })
    }
})

router.delete('/deletarProfessor', async (req, res) => {
    await Professor.deleteOne({ _id: req.body.professorId }).then(() => {
        res.status(200).json({ msg: 'Professor deletado com sucesso' })
    }).catch((err) => {
        res.json({ msg: 'Falha ao deletar professor, tente novamentem mais tarde!' })
    })

})

// Páginas de Admin

router.get('/criarAdmin', async (req, res) => {
    res.json({ msg: 'Página Criar Admin' })
})

router.post('/criarAdmin', async (req, res) => {
    const schema = yup.object().shape({
        email: yup.string().email().required('O e-mail é obrigatório').trim(),
        senha1: yup.string().min(8, 'A senha deve conter no mínimo 8 caracteres').required('A senha é obrigatória').trim(),
        senha2: yup.string().oneOf([yup.ref('senha1')], 'As senham devem ser iguais').required('A senha é obrigatória').trim()
    })

    try {
        await schema.validate(req.body)
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(req.body.senha1, salt)

        await new Admin({
            email: req.body.email,
            senha: hash
        }).save()
        res.json({
            msg: 'Admin criado com sucesso.',
            dados:
            {
                email: req.body.email,
                senha: req.body.senha1
            }
        })
    } catch (err) {
        return res.status(400).json({
            error: true,
            msg: err.errors
        })
    }
})

router.get('/buscarAdmin', async (req, res) => {
    const dadosAdmin = await Admin.find()
    res.status(200).json({
        msg: 'Lista de Admins:',
        dados:
        {
            dadosAdmin
        }
    })
})

router.get('/editarDadosAdmin/:id', async (req, res) => {
    const adminId = await req.params.id
    res.status(200).json({ msg: 'Pegar ID do Aluno pela URL', ID: adminId })
})

router.put('/editarDadosAdmin', async (req, res) => {
    const schema = yup.object().shape({
        email: yup.string().email().required('O e-mail é obrigatório').trim(),
        senha1: yup.string().min(8, 'A senha deve conter no mínimo 8 caracteres').required('A senha é obrigatória').trim(),
        senha2: yup.string().oneOf([yup.ref('senha1')], 'As senham devem ser iguais').required('A senha é obrigatória').trim()
    })
    try {
        await schema.validate(req.body)
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(req.body.senha1, salt)

        await Admin.findOne({ _id: req.body.adminId }).then((dados) => {
            dados.email = req.body.email
            dados.senha = hash,
                dados.save().then(() => {
                    res.json({
                        msg: 'Dados alterados com sucesso',
                        dados:
                        {
                            email: req.body.email,
                            senha: req.body.senha1
                        }
                    })
                })
        }).catch((err) => {
            console.log(err)
        })
    } catch (err) {
        return res.status(400).json({
            error: true,
            msg: err.errors
        })
    }
})

router.delete('/deletarAdmin', async (req, res) => {
    await Admin.deleteOne({ _id: req.body.adminId }).then(() => {
        res.status(200).json({ msg: 'Admin deletado com sucesso' })
    }).catch((err) => {
        res.json({ msg: 'Falha ao deletar admin, tente novamentem mais tarde!' })
    })

})

// Criar Turma

router.get('/criarTurma', async (req, res) => {
    res.status(200).json({ msg: 'Página para Criar Turma' })
})

router.post('/criarTurma', async (req, res) => {
    const schema = yup.object().shape({
        nome: yup.string().required('O nome da turma é obrigatório').trim(),
        professor: yup.string().required('O nome do professor é obrigatório')
    })

    try {
        await schema.validate(req.body)

        const dadosProfessor = await Professor.findOne({ nome: req.body.professor })

        if (dadosProfessor == null) {
            res.status(400).json({ msg: 'O professor selecionado não está cadastrado' })
        } else {

            const dadosTurma = await Turma.findOne({ nome: req.body.nome })

            if (!dadosTurma) {
                await new Turma({
                    nome: req.body.nome,
                    professor: dadosProfessor._id
                }).save()
                res.status(200).json({
                    msg: 'Turma criada com sucesso',
                    dados:
                    {
                        id: dadosProfessor._id,
                        nome: req.body.nome,
                        professor: req.body.professor
                    }
                })
            } else {
                res.status(400).json({
                    msg: `A turma ${dadosTurma.nome} já existe`
                })
            }

        }
    } catch (err) {
        return res.json({
            msg: err.errors
        })
    }
})

router.get('/buscarTurma', async (req, res) => {
    const dadosTurma = await Turma.find()
    res.status(200).json({
        msg: 'Lista de Turmas:',
        dados:
        {
            dadosTurma
        }
    })
})

router.get('/editarDadosTurma/:id', async (req, res) => {
    const turmaId = await req.params.id
    res.status(200).json({ msg: 'Pegar ID do Aluno pela URL', ID: turmaId })
})

router.put('/editarDadosTurma', async (req, res) => {
    const schema = yup.object().shape({
        nome: yup.string().required('O nome da turma é obrigatório').trim(),
        professor: yup.string().required('O nome do professor é obrigatório')
    })

    try {
        await schema.validate(req.body)

        const dadosProfessor = await Professor.findOne({ nome: req.body.professor })
        const dadosTurma = await Turma.findOne({ nome: req.body.nome })

        if (dadosProfessor == null) {
            res.status(400).json({ msg: 'O professor selecionado não está cadastrado' })
        } else {
            await Turma.findOne({ _id: req.body.turmaId }).then((dados) => {
                dados.nome = req.body.nome
                dados.professor = dadosProfessor._id,
                    dados.save().then(() => {
                        res.json({
                            msg: 'Dados alterados com sucesso',
                            dados:
                            {
                                nomeTurma: req.body.nome,
                                nomeProfessor: req.body.professor,
                                professorID: dadosProfessor._id
                            }
                        })
                    })
            }).catch((err) => {
                console.log(err)
            })
        }
    } catch (err) {
        return res.status(400).json({
            error: true,
            msg: err.errors
        })
    }
})

router.delete('/deletarTurma', async (req, res) => {
    await Turma.deleteOne({ _id: req.body.turmaId }).then(() => {
        res.status(200).json({ msg: 'Turma deletada com sucesso' })
    }).catch((err) => {
        res.json({ msg: 'Falha ao deletar turma, tente novamentem mais tarde!' })
    })

})

// Inserir Alunos em uma Turma

router.get('/inserirAluno', async (req, res) => {
    res.json({ msg: 'Página para inserir alunos em uma turma' })
})

router.post('/inserirAluno', async (req, res) => {
    const schema = yup.object().shape({
        nomeAluno: yup.string().required('Informar o aluno é obrigatório'),
        nomeTurma: yup.string().required('Informar a turma é obrigatório')
    })

    try {
        await schema.validate(req.body)

        const dadosAluno = await Aluno.findOne({ nome: req.body.nomeAluno })
        const dadosTurma = await Turma.findOne({ nome: req.body.nomeTurma })

        if (dadosAluno == null) {
            res.status(400).json({ msg: 'O aluno informado não está cadastrado' })
        } else if (dadosTurma == null) {
            res.status(400).json({ msg: 'A turma informada não está cadastrada' })
        } else {

            const dadosAluno_Turma = await Aluno_Turma.findOne({ alunoId: dadosAluno._id })

            if (!dadosAluno_Turma) {
                await new Aluno_Turma({
                    alunoId: dadosAluno._id,
                    turmaId: dadosTurma._id
                }).save()
                await new Boletim({
                    alunoId: dadosAluno._id
                }).save()
                res.status(200).json({
                    msg: 'Aluno inserido com sucesso',
                    nomeAluno: req.body.nomeAluno,
                    alunoId: dadosAluno._id,
                    nomeTurma: req.body.nomeTurma,
                    TurmaId: dadosTurma._id,
                })
            } else {
                const nomeTurma = await Turma.findOne({ _id: dadosAluno_Turma.turmaId })
                res.status(400).json({
                    msg: `O aluno já está cadastrado na turma: ${nomeTurma.nome}`
                })
            }
        }
    } catch (err) {
        return res.status(400).json({
            msg: err.errors
        })
    }
})








module.exports = router