import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import TableCard from '../components/TableCard';
import Footer from '../components/Footer';
import '../styles/produtos.css';
import luvasImg from '../assets/luvas.jpg';
import seringaImg from '../assets/seringa.jpg';
import mascaraImg from '../assets/mascara.jpg';
import imagemPerfil from '../assets/imagem_perfil.png';

// URL base da API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const PRODUTOS_API_URL = `${API_URL}/produtos`;

export default function PaginaInicial() {
    const navigate = useNavigate();

    // Recupera os dados da sessão
    const gestor = JSON.parse(
        sessionStorage.getItem('gestorLogado') || 'null'
    );

    const funcionarioLogado = JSON.parse(
        sessionStorage.getItem('funcionarioLogado') || 'null'
    );

    // Identifica o gestor responsável
    const gestorId = gestor?.id ?? funcionarioLogado?.gestorId ?? null;

    // Estados dos funcionários
    const [listaFuncionarios, setListaFuncionarios] = useState([]);
    const [carregandoFuncionarios, setCarregandoFuncionarios] = useState(true);
    const [erroFuncionarios, setErroFuncionarios] = useState('');

    // Estados dos produtos
    const [produtos, setProdutos] = useState([]);
    const [carregandoProdutos, setCarregandoProdutos] = useState(true);
    const [avisoApi, setAvisoApi] = useState('');

    // Estado da busca da página inicial
    const [termoBusca, setTermoBusca] = useState('');

    // Busca os funcionários vinculados ao gestor
    useEffect(() => {
        async function buscarFuncionarios() {
            if (!gestorId) {
                setErroFuncionarios(
                    'Não foi possível identificar o gestor responsável.'
                );
                setCarregandoFuncionarios(false);
                return;
            }

            setCarregandoFuncionarios(true);
            setErroFuncionarios('');

            try {
                const resposta = await fetch(
                    `${API_URL}/funcionarios?gestorId=${encodeURIComponent(gestorId)}`
                );

                if (!resposta.ok) {
                    throw new Error(
                        'Não foi possível carregar os funcionários.'
                    );
                }

                const dados = await resposta.json();

                if (!Array.isArray(dados)) {
                    throw new Error(
                        'A resposta da API não possui uma lista válida de funcionários.'
                    );
                }

                setListaFuncionarios(dados);
            } catch (error) {
                console.error('Erro ao buscar funcionários:', error);
                setErroFuncionarios(error.message);
                setListaFuncionarios([]);
            } finally {
                setCarregandoFuncionarios(false);
            }
        }

        buscarFuncionarios();
    }, [gestorId]);

    // Busca os produtos diretamente da API
    const carregarProdutos = useCallback(async () => {
        if (!gestorId) {
            setProdutos([]);
            setAvisoApi('Não foi possível identificar o gestor responsável.');
            setCarregandoProdutos(false);
            return;
        }

        setCarregandoProdutos(true);
        setAvisoApi('');

        try {
            const resposta = await fetch(
                `${PRODUTOS_API_URL}?gestorId=${encodeURIComponent(gestorId)}`
            );

            if (!resposta.ok) {
                throw new Error(
                    `Erro ao carregar produtos: HTTP ${resposta.status}`
                );
            }

            const dados = await resposta.json();

            if (!Array.isArray(dados)) {
                throw new Error(
                    'A resposta da API não possui uma lista válida de produtos.'
                );
            }

            setProdutos(dados);
        } catch (erro) {
            console.error('Erro ao buscar produtos da API:', erro);
            setProdutos([]);
            setAvisoApi(
                'Não foi possível conectar ao servidor. Tente novamente mais tarde.'
            );
        } finally {
            setCarregandoProdutos(false);
        }
    }, [gestorId]);

    // Carrega os produtos e atualiza ao retornar à página
    useEffect(() => {
        carregarProdutos();

        window.addEventListener('focus', carregarProdutos);

        return () => {
            window.removeEventListener('focus', carregarProdutos);
        };
    }, [carregarProdutos]);

    // Navega para a página de edição de produtos
    const irParaEditarProdutos = (e, produto = null) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        navigate('/editar-produtos', {
            state: produto
                ? { produtoSelecionado: produto }
                : undefined
        });
    };

    // Identifica a imagem de cada produto
    const obterImagemProduto = (prod) => {
        if (prod.imagem) return prod.imagem;

        const nome = prod.nome ? prod.nome.toLowerCase() : '';

        if (nome.includes('luva')) return luvasImg;
        if (nome.includes('seringa')) return seringaImg;
        if (
            nome.includes('máscara') ||
            nome.includes('mascara')
        ) {
            return mascaraImg;
        }

        return null;
    };

    // Filtra os produtos pelo nome
    const produtosFiltrados = produtos.filter((prod) =>
        (prod.nome || '').toLowerCase().includes(termoBusca.toLowerCase())
    );

    // Filtra os funcionários pelo nome ou cargo
    const funcionariosFiltrados = listaFuncionarios.filter((func) =>
        (func.nome || '').toLowerCase().includes(termoBusca.toLowerCase()) ||
        (func.cargo || '').toLowerCase().includes(termoBusca.toLowerCase())
    );

    // Colunas da tabela de produtos
    const colunasProdutos = (
        <>
            <div className="col-md-6">Produto</div>
            <div className="col-md-3">Preço</div>
            <div className="col-md-3">Estoque</div>
        </>
    );

    return (
        <div className="d-flex flex-column min-vh-100">
            <div className="d-flex flex-column flex-md-row p-3 gap-3 flex-grow-1">
                <Sidebar active="inicio" />
                <div className="flex-grow-1 w-100">
                    <Header
                        valorBusca={termoBusca}
                        onBuscar={setTermoBusca}
                    />
                    <div className="container-fluid flex-grow-1 p-0">
                        {/* Apresentação da página */}
                        <div className="inicio-banner mb-4">
                            <h1 className="fw-bold">
                                Bem-Vindo ao Sistema de Estoque
                            </h1>
                            <p className="mb-0">
                                Gerencie seus produtos e acompanhe o consumo em tempo real.
                            </p>
                        </div>

                        {/* Aviso de conexão com a API */}
                        {avisoApi && (
                            <div className="alert alert-warning rounded-3 py-2 small">
                                {avisoApi}
                            </div>
                        )}

                        <div className="row g-4">
                            {/* Resumo do estoque */}
                            <div className="col-12 col-lg-8">
                                <h5 className="fw-bold mb-3">
                                    Resumo do Estoque
                                </h5>
                                <TableCard colunas={colunasProdutos}>
                                    {carregandoProdutos ? (
                                        <div className="p-4 text-center text-muted">
                                            Carregando produtos...
                                        </div>
                                    ) : avisoApi ? (
                                        <div className="p-4 text-center text-danger">
                                            Não foi possível carregar os produtos.
                                        </div>
                                    ) : produtos.length === 0 ? (
                                        <div className="p-4 text-center text-muted">
                                            Nenhum produto cadastrado no momento.
                                        </div>
                                    ) : produtosFiltrados.length === 0 ? (
                                        <div className="p-4 text-center text-muted">
                                            Nenhum produto encontrado.
                                        </div>
                                    ) : (
                                        produtosFiltrados.map((prod, index) => {
                                            const imgSrc = obterImagemProduto(prod);
                                            const estoqueCaixas = Number(
                                                prod.estoqueCaixas ?? 0
                                            );
                                            const qtdPorCaixa = Number(
                                                prod.qtdPorCaixa ?? 0
                                            );
                                            const emEstoque = estoqueCaixas > 0;

                                            return (
                                                <div
                                                    key={prod.id ?? index}
                                                    className={`row align-items-center p-3 m-0 ${
                                                        index < produtosFiltrados.length - 1
                                                            ? 'border-bottom'
                                                            : ''
                                                    }`}
                                                >
                                                    {/* Produto */}
                                                    <div className="col-12 col-md-6 d-flex align-items-center gap-3 mb-2 mb-md-0">
                                                        {imgSrc ? (
                                                            <img
                                                                src={imgSrc}
                                                                className="rounded shadow-sm"
                                                                width="45"
                                                                height="45"
                                                                style={{
                                                                    objectFit: 'cover'
                                                                }}
                                                                alt={prod.nome}
                                                            />
                                                        ) : (
                                                            <div
                                                                className="rounded shadow-sm d-flex align-items-center justify-content-center"
                                                                style={{
                                                                    width: '45px',
                                                                    height: '45px',
                                                                    backgroundColor: '#EBF5F0',
                                                                    color: '#1B7A56',
                                                                    flexShrink: 0
                                                                }}
                                                            >
                                                                <i className="bi bi-box-seam fs-5"></i>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <h6 className="mb-0 fw-bold text-dark">
                                                                {prod.nome}
                                                            </h6>
                                                        </div>
                                                    </div>

                                                    {/* Preço */}
                                                    <div className="col-6 col-md-3">
                                                        <h6 className="mb-0 fw-bold">
                                                            R$ {Number(
                                                                prod.preco || 0
                                                            ).toFixed(2).replace('.', ',')}
                                                        </h6>
                                                        <small className="text-secondary">
                                                            Caixa com {qtdPorCaixa}
                                                        </small>
                                                    </div>

                                                    {/* Estoque */}
                                                    <div
                                                        className={`col-6 col-md-3 fw-medium d-flex align-items-center justify-content-between ${
                                                            emEstoque
                                                                ? 'text-success'
                                                                : 'text-danger'
                                                        }`}
                                                    >
                                                        <span>
                                                            <i className="bi bi-circle-fill small me-1"></i>
                                                            <span className="d-none d-sm-inline">
                                                                {emEstoque
                                                                    ? `${estoqueCaixas} ${
                                                                        estoqueCaixas === 1
                                                                            ? 'Caixa'
                                                                            : 'Caixas'
                                                                    }`
                                                                    : 'Sem estoque'}
                                                            </span>
                                                            <span className="d-inline d-sm-none">
                                                                {emEstoque
                                                                    ? 'Em estoque'
                                                                    : 'Sem estoque'}
                                                            </span>
                                                        </span>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-secondary"
                                                            title="Editar este produto"
                                                            onClick={(e) =>
                                                                irParaEditarProdutos(e, prod)
                                                            }
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </TableCard>
                            </div>

                            {/* Lista de funcionários */}
                            <div className="col-12 col-lg-4">
                                <div className="colaborators-card mb-3">
                                    <h5 className="d-flex justify-content-between align-items-center fw-bold mb-0 p-2">
                                        Funcionários
                                        <button
                                            type="button"
                                            className="btn p-0 border-0 bg-transparent"
                                            title="Ver todos os funcionários"
                                            onClick={() => navigate('/funcionarios')}
                                        >
                                            <i className="bi bi-arrow-right-circle"></i>
                                        </button>
                                    </h5>
                                </div>
                                <div className="bg-white p-4 rounded-4 shadow-sm">
                                    <div className="colaborator-list">
                                        {carregandoFuncionarios && (
                                            <p className="text-center text-muted">
                                                Carregando funcionários...
                                            </p>
                                        )}
                                        {!carregandoFuncionarios && erroFuncionarios && (
                                            <p className="text-center text-danger">
                                                {erroFuncionarios}
                                            </p>
                                        )}
                                        {!carregandoFuncionarios &&
                                            !erroFuncionarios &&
                                            listaFuncionarios.length === 0 && (
                                                <p className="text-center text-muted">
                                                    Nenhum funcionário cadastrado.
                                                </p>
                                            )}
                                        {!carregandoFuncionarios &&
                                            !erroFuncionarios &&
                                            listaFuncionarios.length > 0 &&
                                            funcionariosFiltrados.length === 0 && (
                                                <p className="text-center text-muted">
                                                    Nenhum funcionário encontrado.
                                                </p>
                                            )}

                                        {!carregandoFuncionarios &&
                                            !erroFuncionarios &&
                                            funcionariosFiltrados.map((func) => (
                                                <div
                                                    key={func.id}
                                                    className="d-flex align-items-center justify-content-between py-3 border-bottom item-colaborador"
                                                >
                                                    <div className="d-flex align-items-center gap-3">
                                                        <img
                                                            src={func.fotoUrl || imagemPerfil}
                                                            alt={`Foto de ${func.nome}`}
                                                            className="rounded-circle object-fit-cover"
                                                            width="50"
                                                            height="50"
                                                        />
                                                        <div>
                                                            <h6 className="m-0 fw-bold">
                                                                {func.nome}
                                                            </h6>
                                                            <small className="text-muted">
                                                                {func.cargo}
                                                            </small>
                                                        </div>
                                                    </div>
                                                    <i className="bi bi-chevron-right text-muted"></i>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}