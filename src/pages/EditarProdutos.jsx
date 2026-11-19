import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
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

function lerProdutosLocais() {
    try {
        const salvos = localStorage.getItem(STORAGE_KEY);
        if (salvos) {
            const parsed = JSON.parse(salvos);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch {
        // ignora erro de leitura
    }
    return [];
}

function salvarProdutosLocais(lista) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

function FormularioProduto({ titulo, textoBotao, tipo, produtoSelecionado, onSalvar, onCancelarEdicao }) {
    const [nome, setNome] = useState('');
    const [preco, setPreco] = useState('');
    const [estoqueCaixas, setEstoqueCaixas] = useState('');
    const [qtdPorCaixa, setQtdPorCaixa] = useState('');

    useEffect(() => {
        if (tipo === 'editar' && produtoSelecionado) {
            setNome(produtoSelecionado.nome || '');
            setPreco(produtoSelecionado.preco ?? '');
            setEstoqueCaixas(produtoSelecionado.estoqueCaixas ?? '');
            setQtdPorCaixa(produtoSelecionado.qtdPorCaixa ?? '');
        } else if (tipo === 'adicionar') {
            setNome('');
            setPreco('');
            setEstoqueCaixas('');
            setQtdPorCaixa('');
        }
    }, [produtoSelecionado, tipo]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const precoConvertido = parseFloat(preco);
        const caixasConvertidas = parseInt(estoqueCaixas, 10);
        const qtdCaixaConvertida = parseInt(qtdPorCaixa, 10);

        if (
            !nome.trim() ||
            Number.isNaN(precoConvertido) ||
            Number.isNaN(caixasConvertidas) ||
            Number.isNaN(qtdCaixaConvertida)
        ) {
            return;
        }

        onSalvar({
            ...(produtoSelecionado?.id !== undefined && { id: produtoSelecionado.id }),
            nome: nome.trim(),
            preco: precoConvertido,
            estoqueCaixas: caixasConvertidas,
            qtdPorCaixa: qtdCaixaConvertida
        });

        if (tipo === 'adicionar') {
            setNome('');
            setPreco('');
            setEstoqueCaixas('');
            setQtdPorCaixa('');
        }
    };

    const estiloInput = {
        backgroundColor: '#F2F3F5',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 12px',
        fontSize: '0.9rem'
    };

    return (
        <div
            className="card h-100"
            style={{
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                overflow: 'hidden'
            }}
        >
            <div
                style={{
                    backgroundColor: tipo === 'adicionar' ? '#1B7A56' : '#2563EB',
                    color: '#FFFFFF',
                    padding: '12px 16px',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
            >
                <i className={`bi ${tipo === 'adicionar' ? 'bi-plus-circle' : 'bi-pencil-fill'}`}></i>
                {titulo} {tipo === 'editar' && produtoSelecionado ? `(${produtoSelecionado.nome})` : ''}
            </div>

            <div className="card-body p-3">
                <form onSubmit={handleSubmit}>
                    <div className="mb-2">
                        <label className="form-label small fw-semibold text-secondary">
                            Nome do Produto
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            style={estiloInput}
                            placeholder="Ex: Luvas Cirúrgicas"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-2">
                        <label className="form-label small fw-semibold text-secondary">
                            Preço do Produto (R$)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="form-control"
                            style={estiloInput}
                            placeholder="Ex: 89.90"
                            value={preco}
                            onChange={(e) => setPreco(e.target.value)}
                            required
                        />
                    </div>

                    <div className="row g-2 mb-3">
                        <div className="col-6">
                            <label className="form-label small fw-semibold text-secondary">
                                Quantidade de Caixas (Estoque)
                            </label>
                            <input
                                type="number"
                                min="0"
                                className="form-control"
                                style={estiloInput}
                                placeholder="Ex: 12"
                                value={estoqueCaixas}
                                onChange={(e) => setEstoqueCaixas(e.target.value)}
                                required
                            />
                        </div>

                        <div className="col-6">
                            <label className="form-label small fw-semibold text-secondary">
                                Quantidade por Caixa
                            </label>
                            <input
                                type="number"
                                min="1"
                                className="form-control"
                                style={estiloInput}
                                placeholder="Ex: 100"
                                value={qtdPorCaixa}
                                onChange={(e) => setQtdPorCaixa(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="d-flex gap-2">
                        <button
                            type="submit"
                            className="btn w-100 text-white fw-semibold"
                            style={{
                                backgroundColor: tipo === 'adicionar' ? '#1B7A56' : '#2563EB',
                                borderRadius: '8px',
                                padding: '10px'
                            }}
                        >
                            {textoBotao}
                        </button>
                        {tipo === 'editar' && produtoSelecionado && (
                            <button
                                type="button"
                                className="btn btn-light border fw-semibold px-3"
                                onClick={onCancelarEdicao}
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function EditarProdutos() {
    const location = useLocation();
    const [produtos, setProdutos] = useState([]);
    const [produtoEmEdicao, setProdutoEmEdicao] = useState(
        location.state?.produtoSelecionado || null
    );
    const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

    const carregarProdutos = useCallback(async () => {
        try {
            const resposta = await fetch(API_URL);
            if (!resposta.ok) {
                throw new Error(`HTTP ${resposta.status}`);
            }
            const dados = await resposta.json();
            const lista = Array.isArray(dados) ? dados : [];
            setProdutos(lista);
            salvarProdutosLocais(lista);
            setMensagem((prev) => (prev.tipo === 'danger' ? { texto: '', tipo: '' } : prev));
        } catch (erro) {
            console.error('Erro ao conectar com a API:', erro);
            const listaLocal = lerProdutosLocais();
            setProdutos(listaLocal);
            setMensagem({
                texto: 'API em localhost:8080 indisponível. Alterações salvas localmente no navegador.',
                tipo: 'warning'
            });
        }
    }, []);

    useEffect(() => {
        carregarProdutos();
    }, [carregarProdutos]);

    useEffect(() => {
        if (location.state?.produtoSelecionado) {
            setProdutoEmEdicao(location.state.produtoSelecionado);
        }
    }, [location.state]);

    const handleAdicionar = async (novoProduto) => {
        try {
            const resposta = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: novoProduto.nome,
                    preco: novoProduto.preco,
                    estoqueCaixas: novoProduto.estoqueCaixas,
                    qtdPorCaixa: novoProduto.qtdPorCaixa
                })
            });
            if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

            await carregarProdutos();
            setMensagem({ texto: `Produto "${novoProduto.nome}" adicionado com sucesso!`, tipo: 'success' });
        } catch (erro) {
            console.error(erro);
            const atual = lerProdutosLocais();
            const proximoId =
                atual.reduce((maior, item) => Math.max(maior, Number(item.id) || 0), 0) + 1;
            const criada = { ...novoProduto, id: proximoId };
            const novaLista = [...atual, criada];
            salvarProdutosLocais(novaLista);
            setProdutos(novaLista);
            setMensagem({
                texto: `Produto "${novoProduto.nome}" salvo localmente (API offline).`,
                tipo: 'info'
            });
        }
    };

    const handleEditar = async (dadosEditados) => {
        if (!dadosEditados.id) {
            setMensagem({ texto: 'Clique no botão de lápis na tabela para selecionar um produto.', tipo: 'warning' });
            return;
        }

        try {
            const resposta = await fetch(`${API_URL}/${dadosEditados.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: dadosEditados.id,
                    nome: dadosEditados.nome,
                    preco: dadosEditados.preco,
                    estoqueCaixas: dadosEditados.estoqueCaixas,
                    qtdPorCaixa: dadosEditados.qtdPorCaixa
                })
            });
            if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

            await carregarProdutos();
            setProdutoEmEdicao(null);
            setMensagem({ texto: `Produto "${dadosEditados.nome}" atualizado com sucesso!`, tipo: 'success' });
        } catch (erro) {
            console.error(erro);
            const atual = lerProdutosLocais();
            const novaLista = atual.map((item) =>
                item.id === dadosEditados.id ? { ...item, ...dadosEditados } : item
            );
            salvarProdutosLocais(novaLista);
            setProdutos(novaLista);
            setProdutoEmEdicao(null);
            setMensagem({
                texto: `Produto "${dadosEditados.nome}" atualizado localmente (API offline).`,
                tipo: 'info'
            });
        }
    };

    const handleExcluir = async (id, nome) => {
        if (!window.confirm(`Tem certeza que deseja excluir "${nome}"?`)) return;

        try {
            const resposta = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });
            if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

            await carregarProdutos();
            if (produtoEmEdicao?.id === id) setProdutoEmEdicao(null);
            setMensagem({ texto: `Produto "${nome}" excluído com sucesso!`, tipo: 'success' });
        } catch (erro) {
            console.error(erro);
            const atual = lerProdutosLocais();
            const novaLista = atual.filter((item) => item.id !== id);
            salvarProdutosLocais(novaLista);
            setProdutos(novaLista);
            if (produtoEmEdicao?.id === id) setProdutoEmEdicao(null);
            setMensagem({
                texto: `Produto "${nome}" removido localmente (API offline).`,
                tipo: 'info'
            });
        }
    };

    const obterImagemProduto = (prod) => {
        const n = prod.nome ? prod.nome.toLowerCase() : '';
        if (n.includes('luva')) return luvasImg;
        if (n.includes('seringa')) return seringaImg;
        if (n.includes('máscara') || n.includes('mascara')) return mascaraImg;
        return null;
    };

    const colunasResumo = (
        <>
            <div className="col-md-5">Produto</div>
            <div className="col-md-3">Preço</div>
            <div className="col-md-2">Estoque</div>
            <div className="col-md-2 text-center">Ações</div>
        </>
    );

    const acaoVoltar = (
        <Link
            to="/produtos"
            className="text-white text-decoration-none d-inline-flex align-items-center gap-1 fw-semibold small"
            title="Voltar para Produtos"
        >
            <i className="bi bi-arrow-left"></i> Voltar
        </Link>
    );

    return (
        <div className="min-vh-100 d-flex flex-column">
            <div className="d-flex flex-column flex-md-row p-3 gap-3 flex-grow-1">
                <Sidebar active="produtos" />

                <div className="flex-grow-1 w-100">
                    <Header />

                    {mensagem.texto && (
                        <div className={`alert alert-${mensagem.tipo} alert-dismissible fade show rounded-3`}>
                            {mensagem.texto}
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setMensagem({ texto: '', tipo: '' })}
                            ></button>
                        </div>
                    )}

                    <div className="row g-3 mb-4">
                        <div className="col-lg-6">
                            <FormularioProduto
                                titulo="Adicionar Produto"
                                textoBotao="Cadastrar"
                                tipo="adicionar"
                                onSalvar={handleAdicionar}
                            />
                        </div>

                        <div className="col-lg-6">
                            <FormularioProduto
                                titulo="Editar Produto"
                                textoBotao="Salvar Alterações"
                                tipo="editar"
                                produtoSelecionado={produtoEmEdicao}
                                onSalvar={handleEditar}
                                onCancelarEdicao={() => setProdutoEmEdicao(null)}
                            />
                        </div>
                    </div>

                    <TableCard colunas={colunasResumo} acoes={acaoVoltar}>
                        {produtos.length === 0 ? (
                            <div className="p-4 text-center text-muted">
                                Nenhum produto cadastrado.
                            </div>
                        ) : (
                            produtos.map((prod, index) => {
                                const imgSrc = obterImagemProduto(prod);
                                const caixas = Number(prod.estoqueCaixas ?? 0);
                                const porCaixa = Number(prod.qtdPorCaixa ?? 0);

                                return (
                                    <div
                                        key={prod.id ?? index}
                                        className={`row align-items-center p-3 m-0 ${
                                            index < produtos.length - 1 ? 'border-bottom' : ''
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
                                                <small className="text-muted">ID: {prod.id}</small>
                                            </div>
                                        </div>

                                        <div className="col-6 col-md-3">
                                            <h6 className="mb-0 fw-bold">
                                                R$ {Number(prod.preco || 0).toFixed(2).replace('.', ',')}
                                            </h6>
                                            <small className="text-secondary">
                                                Caixa com {porCaixa}
                                            </small>
                                        </div>

                                        <div className="col-3 col-md-2 fw-medium">
                                            <span className={caixas > 0 ? 'text-success' : 'text-danger'}>
                                                {caixas} {caixas === 1 ? 'Caixa' : 'Caixas'}
                                            </span>
                                        </div>

                                        <div className="col-3 col-md-2 text-end text-md-center d-flex justify-content-end justify-content-md-center gap-2">
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => setProdutoEmEdicao(prod)}
                                                title="Editar Produto"
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleExcluir(prod.id, prod.nome)}
                                                title="Excluir Produto"
                                            >
                                                <i className="bi bi-trash"></i>
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