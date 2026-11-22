import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';

import imagemPerfil from '../assets/imagem_perfil.png';

export default function GerenciarFuncionarios() {
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    const gestor = JSON.parse(
        sessionStorage.getItem('gestorLogado') || 'null'
    );

    const [funcionarios, setFuncionarios] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');

    const [editandoId, setEditandoId] = useState(null);

    const [formulario, setFormulario] = useState({
        nome: '',
        email: '',
        cargo: '',
        foto: '',
        senha: '',
        confirmacaoSenha: ''
    });

    // Busca os funcionários do gestor
    async function buscarFuncionarios() {
        try {
            const resposta = await fetch(
                `${API_URL}/funcionarios?gestorId=${gestor.id}`
            );

            if (!resposta.ok) {
                throw new Error('Não foi possível carregar os funcionários.');
            }

            const dados = await resposta.json();
            setFuncionarios(dados);
        } catch (error) {
            setErro(error.message);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        if (gestor?.id) {
            buscarFuncionarios();
        } else {
            setCarregando(false);
        }
    }, []);

    // Atualiza os campos do formulário
    function handleChange(event) {
        const { name, value } = event.target;

        setFormulario({
            ...formulario,
            [name]: value
        });
    }

    // Adiciona a função para selecionar a foto
    function handleFotoChange(event) {
        const arquivo = event.target.files[0];

        if (!arquivo) return;

        if (!arquivo.type.startsWith('image/')) {
            setErro('Selecione um arquivo de imagem válido.');
            return;
        }

        const leitor = new FileReader();

        leitor.onloadend = () => {
            setFormulario({
                ...formulario,
                foto: leitor.result
            });

            setErro('');
        };

        leitor.readAsDataURL(arquivo);
    }

    // Limpa o formulário
    function limparFormulario() {
        setFormulario({
            nome: '',
            email: '',
            cargo: '',
            foto: '',
            senha: '',
            confirmacaoSenha: ''
        });

        setEditandoId(null);
    }

    // Cadastra ou atualiza um funcionário
    async function handleSubmit(event) {
        event.preventDefault();

        setErro('');
        setMensagem('');

        if (!gestor?.id) {
            setErro('Não foi possível identificar o gestor.');
            return;
        }

        if (!editandoId && formulario.senha !== formulario.confirmacaoSenha) {
            setErro('As senhas não são iguais.');
            return;
        }

        if (!editandoId && formulario.senha.length < 6) {
            setErro('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        const dados = {
            nome: formulario.nome,
            email: formulario.email,
            cargo: formulario.cargo,
            foto: formulario.foto || null
        };

        // Na edição, envia os dados de atualização
        // No cadastro, envia também a senha e o ID do gestor
        const corpo = editandoId
            ? dados
            : {
                ...dados,
                gestorId: gestor.id,
                senha: formulario.senha,
                confirmacaoSenha: formulario.confirmacaoSenha
            };

        try {
            const resposta = await fetch(
                editandoId
                    ? `${API_URL}/funcionarios/${editandoId}`
                    : `${API_URL}/funcionarios`,
                {
                    method: editandoId ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(corpo)
                }
            );

            if (!resposta.ok) {
                // O backend devolve {"erro": "..."} ou, na validação, {"campo": "mensagem"}
                const dadosErro = await resposta.json().catch(() => null);
                const detalhe = dadosErro?.erro
                    || (dadosErro ? Object.values(dadosErro).join(' ') : '');
                throw new Error(
                    detalhe || 'Não foi possível salvar o funcionário.'
                );
            }

            setMensagem(
                editandoId
                    ? 'Funcionário atualizado com sucesso!'
                    : 'Funcionário cadastrado com sucesso!'
            );

            limparFormulario();
            await buscarFuncionarios();

        } catch (error) {
            setErro(error.message);
        }
    }

    // Carrega os dados para edição
    function editarFuncionario(funcionario) {
        setEditandoId(funcionario.id);

        setFormulario({
            nome: funcionario.nome || '',
            email: funcionario.email || '',
            cargo: funcionario.cargo || '',
            foto: funcionario.foto || '',
            senha: '',
            confirmacaoSenha: ''
        });

        setErro('');
        setMensagem('');

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Exclui um funcionário
    async function excluirFuncionario(id) {
        const confirmar = window.confirm(
            'Tem certeza que deseja excluir este funcionário?'
        );

        if (!confirmar) return;

        setErro('');
        setMensagem('');

        try {
            const resposta = await fetch(
                `${API_URL}/funcionarios/${id}`,
                {
                    method: 'DELETE'
                }
            );

            if (!resposta.ok) {
                throw new Error('Não foi possível excluir o funcionário.');
            }

            if (editandoId === id) {
                limparFormulario();
            }

            setMensagem('Funcionário excluído com sucesso!');
            await buscarFuncionarios();

        } catch (error) {
            setErro(error.message);
        }
    }

    if (!gestor) {
        return (
            <div className="container mt-5 text-center">
                <h4>Acesso permitido somente ao gestor.</h4>
                <button
                    className="btn btn-success mt-3"
                    onClick={() => navigate('/login')}
                >
                    Voltar ao login
                </button>
            </div>
        );
    }

    return (
        <div className="min-vh-100 d-flex flex-column">
            <div className="d-flex flex-column flex-md-row p-3 gap-3 flex-grow-1">

                <Sidebar active="funcionarios" />

                <div className="flex-grow-1 w-100">

                    <Header />

                    <div className="d-flex align-items-center gap-3 mb-4 mt-3">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => navigate('/funcionarios')}
                        >
                            <i className="bi bi-arrow-left"></i>
                        </button>

                        <h4 className="fw-bold mb-0">
                            Gerenciar funcionários
                        </h4>
                    </div>

                    {/* Formulário */}
                    <div className="bg-white p-4 rounded-4 shadow-sm mb-4">

                        <h5 className="fw-bold mb-4">
                            {editandoId
                                ? 'Editar funcionário'
                                : 'Cadastrar funcionário'}
                        </h5>

                        {erro && (
                            <div className="alert alert-danger">
                                {erro}
                            </div>
                        )}

                        {mensagem && (
                            <div className="alert alert-success">
                                {mensagem}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>

                            <div className="mb-3">
                                <label className="form-label">Nome</label>
                                <input
                                    type="text"
                                    name="nome"
                                    className="form-control"
                                    value={formulario.nome}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">E-mail</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    value={formulario.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Cargo</label>
                                <input
                                    type="text"
                                    name="cargo"
                                    className="form-control"
                                    value={formulario.cargo}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Foto do funcionário</label>

                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={handleFotoChange}
                                />

                                {formulario.foto && (
                                    <div className="mt-3">
                                        <img
                                            src={formulario.foto}
                                            alt="Prévia da foto"
                                            width="100"
                                            height="100"
                                            className="rounded-circle object-fit-cover"
                                        />
                                    </div>
                                )}
                            </div>

                            {!editandoId && (
                                <>
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Senha
                                        </label>
                                        <input
                                            type="password"
                                            name="senha"
                                            className="form-control"
                                            value={formulario.senha}
                                            onChange={handleChange}
                                            minLength="6"
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">
                                            Confirmar senha
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmacaoSenha"
                                            className="form-control"
                                            value={formulario.confirmacaoSenha}
                                            onChange={handleChange}
                                            minLength="6"
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            <div className="d-flex gap-2 mt-4">

                                <button
                                    type="submit"
                                    className="btn btn-success"
                                >
                                    {editandoId
                                        ? 'Salvar alterações'
                                        : 'Cadastrar funcionário'}
                                </button>

                                {editandoId && (
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={limparFormulario}
                                    >
                                        Cancelar edição
                                    </button>
                                )}

                            </div>
                        </form>
                    </div>

                    {/* Lista de funcionários */}
                    <div className="bg-white p-4 rounded-4 shadow-sm">

                        <h5 className="fw-bold mb-3">
                            Funcionários cadastrados
                        </h5>

                        {carregando && (
                            <p className="text-muted">
                                Carregando funcionários...
                            </p>
                        )}

                        {!carregando && funcionarios.length === 0 && (
                            <p className="text-muted">
                                Nenhum funcionário cadastrado.
                            </p>
                        )}

                        {!carregando && funcionarios.map((func) => (
                            <div
                                key={func.id}
                                className="d-flex align-items-center justify-content-between py-3 border-bottom"
                            >
                                <div className="d-flex align-items-center gap-3">

                                    <img
                                        src={func.foto || imagemPerfil}
                                        alt={`Foto de ${func.nome}`}
                                        width="45"
                                        height="45"
                                        className="rounded-circle object-fit-cover"
                                    />

                                    <div>
                                        <h6 className="fw-bold mb-0">
                                            {func.nome}
                                        </h6>

                                        <small className="text-muted">
                                            {func.cargo}
                                        </small>
                                    </div>
                                </div>

                                <div className="d-flex gap-3">

                                    <button
                                        type="button"
                                        className="btn btn-link text-primary p-0"
                                        title="Editar funcionário"
                                        onClick={() => editarFuncionario(func)}
                                    >
                                        <i className="bi bi-pencil-square fs-5"></i>
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-link text-danger p-0"
                                        title="Excluir funcionário"
                                        onClick={() => excluirFuncionario(func.id)}
                                    >
                                        <i className="bi bi-trash fs-5"></i>
                                    </button>

                                </div>
                            </div>
                        ))}

                    </div>

                </div>
            </div>

            <Footer />
        </div>
    );
}