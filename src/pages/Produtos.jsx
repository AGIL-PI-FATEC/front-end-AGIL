import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const PRODUTOS_FALLBACK = [
    { id: 1, nome: 'Luvas Cirúrgicas', preco: 89.90, qtdPorCaixa: 100, estoqueCaixas: 12 },
    { id: 2, nome: 'Seringa Descartável', preco: 45.50, qtdPorCaixa: 50, estoqueCaixas: 20 },
    { id: 3, nome: 'Máscara Cirúrgica', preco: 32.00, qtdPorCaixa: 50, estoqueCaixas: 18 }
];

function lerProdutosSalvos() {
    try {
        const salvos = localStorage.getItem(STORAGE_KEY);
        if (salvos) {
            const parsed = JSON.parse(salvos);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch {
        // ignora erro de leitura
    }
    return PRODUTOS_FALLBACK;
}

export default function Produtos() {
    const navigate = useNavigate();
    const [produtos, setProdutos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [avisoApi, setAvisoApi] = useState('');
    
    // Correção: o useState foi movido para dentro do componente
    const [termoBusca, setTermoBusca] = useState('');

    const carregarProdutos = useCallback(async () => {
        setCarregando(true);
        try {
            const resposta = await fetch(API_URL);
            if (!resposta.ok) {
                throw new Error(`HTTP ${resposta.status}`);
            }
            const dados = await resposta.json();
            const lista = Array.isArray(dados) ? dados : [];
            setProdutos(lista);
            setAvisoApi('');
            localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
        } catch (erro) {
            console.error('Erro ao buscar produtos da API:', erro);
            const listaLocal = lerProdutosSalvos();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(listaLocal));
            setProdutos(listaLocal);
            setAvisoApi('Não foi possível conectar à API em localhost:8080. Exibindo dados locais/salvos.');
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregarProdutos();
        window.addEventListener('focus', carregarProdutos);

        return () => {
            window.removeEventListener('focus', carregarProdutos);
        };
    }, [carregarProdutos]);

    const produtosFiltrados = produtos.filter((prod) =>
        (prod.nome || '')
            .toLowerCase()
            .includes(termoBusca.trim().toLowerCase())
    );

    const obterImagemProduto = (prod) => {
        if (prod.imagem) return prod.imagem;
        const n = prod.nome ? prod.nome.toLowerCase() : '';
        if (n.includes('luva')) return luvasImg;
        if (n.includes('seringa')) return seringaImg;
        if (n.includes('máscara') || n.includes('mascara')) return mascaraImg;
        return null;
    };

    const colunasProdutos = (
        <>
            <div className="col-md-6">Produto</div>
            <div className="col-md-3">Preço</div>
            <div className="col-md-3">Estoque</div>
        </>
    );

    const acoesProdutos = (
        <Link
            to="/editar-produtos"
            title="Editar Produtos"
            style={{ color: 'inherit', textDecoration: 'none' }}
        >
            <i className="bi bi-pencil-fill" style={{ cursor: 'pointer' }}></i>
        </Link>
    );

    return (
        <div className="min-vh-100 d-flex flex-column">
            <div className="d-flex flex-column flex-md-row p-3 gap-3 flex-grow-1">

                <Sidebar active="produtos" />

                <div className="flex-grow-1 w-100">

                    <Header
                        valorBusca={termoBusca}
                        onBuscar={setTermoBusca}
                    />

                    {avisoApi && (
                        <div className="alert alert-warning rounded-3 py-2 small">
                            {avisoApi}
                        </div>
                    )}

                    <TableCard colunas={colunasProdutos} acoes={acoesProdutos}>
                        {carregando ? (
                            <div className="p-4 text-center text-muted">
                                Carregando produtos...
                            </div>
                        ) : produtosFiltrados.length === 0 ? (
                            <div className="p-4 text-center text-muted">
                                Nenhum produto encontrado para essa busca.
                            </div>
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
                                        <div className="col-12 col-md-6 d-flex align-items-center gap-3 mb-2 mb-md-0">
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
                                            <small className="text-secondary">
                                                Caixa com {qtdPorCaixa}
                                            </small>
                                        </div>

                                        <div
                                            className={`col-6 col-md-3 fw-medium d-flex align-items-center justify-content-between ${
                                                emEstoque ? 'text-success' : 'text-danger'
                                            }`}
                                        >
                                            <span>
                                                <i className="bi bi-circle-fill small me-1"></i>
                                                <span className="d-none d-sm-inline">
                                                    {emEstoque
                                                        ? `${estoqueCaixas} ${estoqueCaixas === 1 ? 'Caixa' : 'Caixas'}`
                                                        : 'Sem estoque'}
                                                </span>
                                                <span className="d-inline d-sm-none">
                                                    {emEstoque ? 'Em estoque' : 'Sem estoque'}
                                                </span>
                                            </span>

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