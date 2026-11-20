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

const API_URL = 'http://localhost:8080/produtos';
const STORAGE_KEY = 'agil_produtos';

export default function Produtos() {
    const navigate = useNavigate();

    // Identifica se é o gestor logado
    const tipoUsuario = sessionStorage.getItem('tipoUsuario');
    const gestor = JSON.parse(sessionStorage.getItem('gestorLogado') || 'null');
    const funcionario = JSON.parse(sessionStorage.getItem('funcionarioLogado') || 'null');

    const gestorId = gestor?.id ?? funcionario?.gestorId ?? null;

    // Cada gestor terá seu próprio armazenamento local
    const storageKey = `${STORAGE_KEY}_${gestorId ?? 'sem-gestor'}`;

    // É gestor se o tipo for 'gestor' ou se houver um gestor logado sem funcionário ativo
    const ehGestor = tipoUsuario === 'gestor' || (!!gestor && !funcionario);

    const [produtos, setProdutos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [avisoApi, setAvisoApi] = useState('');
    const [termoBusca, setTermoBusca] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [excluindoId, setExcluindoId] = useState(null);

    const carregarProdutos = useCallback(async () => {
        if (!gestorId) {
            setProdutos([]);
            setAvisoApi('Não foi possível identificar o gestor responsável.');
            setCarregando(false);
            return;
        }

        setCarregando(true);
        setAvisoApi('');

        try {
            const resposta = await fetch(
                `${API_URL}?gestorId=${gestorId}`
            );

            if (!resposta.ok) {
                throw new Error(`HTTP ${resposta.status}`);
            }

            const dados = await resposta.json();
            const lista = Array.isArray(dados) ? dados : [];

            setProdutos(lista);
            setAvisoApi('');

            localStorage.setItem(storageKey, JSON.stringify(lista));

        } catch (erro) {
            console.error('Erro ao buscar produtos da API:', erro);

            // Recupera somente os produtos salvos para este gestor
            let listaLocal = [];

            try {
                const salvos = localStorage.getItem(storageKey);

                if (salvos) {
                    const parsed = JSON.parse(salvos);

                    if (Array.isArray(parsed)) {
                        listaLocal = parsed;
                    }
                }
            } catch {
                listaLocal = [];
            }

            setProdutos(listaLocal);

            setAvisoApi(
                'Não foi possível conectar à API. Exibindo os dados salvos localmente.'
            );

        } finally {
            setCarregando(false);
        }
    }, [gestorId, storageKey]);

    useEffect(() => {
        carregarProdutos();
        window.addEventListener('focus', carregarProdutos);
        return () => window.removeEventListener('focus', carregarProdutos);
    }, [carregarProdutos]);

    const produtosFiltrados = produtos.filter((prod) =>
        (prod.nome || '').toLowerCase().includes(termoBusca.trim().toLowerCase())
    );

    const obterImagemProduto = (prod) => {
        if (prod.imagem) return prod.imagem;
        const n = prod.nome ? prod.nome.toLowerCase() : '';
        if (n.includes('luva')) return luvasImg;
        if (n.includes('seringa')) return seringaImg;
        if (n.includes('máscara') || n.includes('mascara')) return mascaraImg;
        return null;
    };

    // Função de exclusão restrita ao Gestor
    const handleExcluirProduto = async (produto) => {
        if (!ehGestor || !gestorId) return;

        const confirmar = window.confirm(`Tem certeza que deseja excluir o produto "${produto.nome}"?`);
        if (!confirmar) return;

        setMensagem('');
        setExcluindoId(produto.id);

        try {
            const resposta = await fetch(
                `${API_URL}/${produto.id}?gestorId=${gestorId}`,
                {
                    method: 'DELETE'
                }
            );
            if (!resposta.ok) {
                throw new Error(`Não foi possível excluir o produto. HTTP ${resposta.status}`);
            }

            setProdutos((listaAtual) => {
                const novaLista = listaAtual.filter((item) => item.id !== produto.id);
                localStorage.setItem(storageKey, JSON.stringify(novaLista));
                return novaLista;
            });

            setMensagem('Produto excluído com sucesso!');
        } catch (erro) {
            console.error('Erro ao excluir produto:', erro);
            setMensagem('Não foi possível excluir o produto. Tente novamente.');
        } finally {
            setExcluindoId(null);
        }
    };

    // Cabeçalho da tabela com o botão integrado na barra verde para o Gestor
    const colunasProdutos = (
        <div className="d-flex justify-content-between align-items-center w-100 pe-2">
            <div className="row w-100 m-0">
                <div className="col-md-5">Produto</div>
                <div className="col-md-3">Preço</div>
                <div className="col-md-4">Estoque</div>
            </div>
            {ehGestor && (
                <button
                    type="button"
                    className="btn btn-light btn-sm fw-semibold text-success text-nowrap px-3 shadow-sm"
                    onClick={() => navigate('/cadastrar-produto')}
                    style={{ border: 'none', borderRadius: '6px' }}
                >
                    <i className="bi bi-plus-lg me-1"></i>
                    Adicionar produto
                </button>
            )}
        </div>
    );

    return (
        <div className="min-vh-100 d-flex flex-column">
            <div className="d-flex flex-column flex-md-row p-3 gap-3 flex-grow-1">
                <Sidebar active="produtos" />

                <div className="flex-grow-1 w-100">
                    <Header valorBusca={termoBusca} onBuscar={setTermoBusca} />

                    {avisoApi && (
                        <div className="alert alert-warning rounded-3 py-2 small mt-3">
                            {avisoApi}
                        </div>
                    )}

                    {mensagem && (
                        <div className="alert alert-info rounded-3 py-2 small mt-3">
                            {mensagem}
                        </div>
                    )}

                    <div className="mt-3"></div>

                    <TableCard colunas={colunasProdutos}>
                        {carregando ? (
                            <div className="p-4 text-center text-muted">Carregando produtos...</div>
                        ) : produtosFiltrados.length === 0 ? (
                            <div className="p-4 text-center text-muted">Nenhum produto encontrado para essa busca.</div>
                        ) : (
                            produtosFiltrados.map((prod, index) => {
                                const imgSrc = obterImagemProduto(prod);
                                const estoqueCaixas = Number(prod.estoqueCaixas ?? 0);
                                const qtdPorCaixa = Number(prod.qtdPorCaixa ?? 0);
                                const emEstoque = estoqueCaixas > 0;

                                return (
                                    <div
                                        key={prod.id ?? index}
                                        className={`row align-items-center p-3 m-0 ${
                                            index < produtosFiltrados.length - 1 ? 'border-bottom' : ''
                                        }`}
                                    >
                                        <div className="col-12 col-md-5 d-flex align-items-center gap-3 mb-2 mb-md-0">
                                            {imgSrc ? (
                                                <img
                                                    src={imgSrc}
                                                    className="rounded shadow-sm"
                                                    width="45"
                                                    height="45"
                                                    style={{ objectFit: 'cover' }}
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
                                                <h6 className="mb-0 fw-bold text-dark">{prod.nome}</h6>
                                            </div>
                                        </div>

                                        <div className="col-6 col-md-3">
                                            <h6 className="mb-0 fw-bold">
                                                R$ {Number(prod.preco || 0).toFixed(2).replace('.', ',')}
                                            </h6>
                                            <small className="text-secondary">Caixa com {qtdPorCaixa}</small>
                                        </div>

                                        <div
                                            className={`col-6 col-md-4 fw-medium d-flex align-items-center justify-content-between ${
                                                emEstoque ? 'text-success' : 'text-danger'
                                            }`}
                                        >
                                            <span>
                                                <i className="bi bi-circle-fill small me-1"></i>
                                                <span className="d-none d-sm-inline">
                                                    {emEstoque ? `${estoqueCaixas} ${estoqueCaixas === 1 ? 'Caixa' : 'Caixas'}` : 'Sem estoque'}
                                                </span>
                                                <span className="d-inline d-sm-none">
                                                    {emEstoque ? 'Em estoque' : 'Sem estoque'}
                                                </span>
                                            </span>

                                            <div className="d-flex gap-2">
                                                {/* Botão de Editar (disponível para ambos) */}
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-secondary"
                                                    title="Editar este produto"
                                                    onClick={() =>
                                                        navigate('/editar-produtos', {
                                                            state: { produtoSelecionado: prod }
                                                        })
                                                    }
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>

                                                {/* Botão de Excluir visível APENAS para o Gestor */}
                                                {ehGestor && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger"
                                                        title="Excluir este produto"
                                                        disabled={excluindoId === prod.id}
                                                        onClick={() => handleExcluirProduto(prod)}
                                                    >
                                                        {excluindoId === prod.id ? (
                                                            <span className="spinner-border spinner-border-sm" role="status"></span>
                                                        ) : (
                                                            <i className="bi bi-trash"></i>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </TableCard>
                </div>
            </div>
            <Footer />
        </div>
    );
}