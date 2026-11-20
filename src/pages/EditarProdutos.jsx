import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import TableCard from '../components/TableCard';
import Footer from '../components/Footer';

import '../styles/produtos.css';

import luvasImg from '../assets/luvas.jpg';
import seringaImg from '../assets/seringa.jpg';
import mascaraImg from '../assets/mascara.jpg';

const API_URL = `${(import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')}/produtos`;
const STORAGE_KEY = 'agil_produtos_imagens';

// Recupera o ID do gestor que realizou o login.
function obterGestorId() {
    try {
        const gestorSalvo = sessionStorage.getItem('gestorLogado');

        if (!gestorSalvo) {
            throw new Error('Nenhum gestor está logado. Faça login novamente.');
        }

        const gestor = JSON.parse(gestorSalvo);

        if (!gestor?.id) {
            throw new Error('Não foi possível identificar o gestor logado.');
        }

        return gestor.id;
    } catch (erro) {
        if (erro instanceof SyntaxError) {
            throw new Error('Os dados do gestor estão inválidos. Faça login novamente.');
        }

        throw erro;
    }
}

// O armazenamento local guarda somente as imagens dos produtos.
function lerImagensLocais() {
    try {
        const salvas = localStorage.getItem(STORAGE_KEY);
        return salvas ? JSON.parse(salvas) : {};
    } catch (erro) {
        console.error('Erro ao ler imagens locais:', erro);
        return {};
    }
}

function salvarImagemLocal(id, imagem) {
    if (id === undefined || id === null || !imagem) return;

    try {
        const imagens = lerImagensLocais();
        imagens[id] = imagem;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(imagens));
    } catch (erro) {
        console.error('Erro ao salvar imagem local:', erro);
        alert('O produto foi salvo no servidor, mas não foi possível guardar sua imagem no navegador.');
    }
}

function excluirImagemLocal(id) {
    try {
        const imagens = lerImagensLocais();
        delete imagens[id];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(imagens));
    } catch (erro) {
        console.error('Erro ao remover imagem local:', erro);
    }
}

async function obterErroResposta(resposta) {
    const erro = await resposta.text();

    console.error('Erro retornado pelo backend:', erro);

    return erro || `HTTP ${resposta.status}`;
}

function FormularioProduto({
    titulo,
    textoBotao,
    tipo,
    produtoSelecionado,
    onSalvar,
    onCancelarEdicao
}) {
    const [nome, setNome] = useState('');
    const [preco, setPreco] = useState('');
    const [estoqueCaixas, setEstoqueCaixas] = useState('');
    const [qtdPorCaixa, setQtdPorCaixa] = useState('');
    const [imagem, setImagem] = useState('');
    const [carregando, setCarregando] = useState(false);

    const inputArquivoRef = useRef(null);

    useEffect(() => {
        if (tipo === 'editar' && produtoSelecionado) {
            setNome(produtoSelecionado.nome || '');
            setPreco(produtoSelecionado.preco ?? '');
            setEstoqueCaixas(produtoSelecionado.estoqueCaixas ?? '');
            setQtdPorCaixa(produtoSelecionado.qtdPorCaixa ?? '');
            setImagem(produtoSelecionado.imagem || '');
        } else if (tipo === 'adicionar') {
            setNome('');
            setPreco('');
            setEstoqueCaixas('');
            setQtdPorCaixa('');
            setImagem('');

            if (inputArquivoRef.current) {
                inputArquivoRef.current.value = '';
            }
        }
    }, [produtoSelecionado, tipo]);

    const handleImagemChange = (e) => {
        const arquivo = e.target.files?.[0];
        if (!arquivo) return;

        const reader = new FileReader();

        reader.onload = (evento) => {
            const img = new Image();

            img.onload = () => {
                const tamanho = 300;
                const canvas = document.createElement('canvas');

                canvas.width = tamanho;
                canvas.height = tamanho;

                const contexto = canvas.getContext('2d');
                contexto.drawImage(img, 0, 0, tamanho, tamanho);

                const imagemComprimida = canvas.toDataURL('image/jpeg', 0.7);
                setImagem(imagemComprimida);
            };

            img.onerror = () => {
                alert('Não foi possível carregar essa imagem.');
            };

            img.src = evento.target.result;
        };

        reader.readAsDataURL(arquivo);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const precoConvertido = parseFloat(preco);
        const caixasConvertidas = parseInt(estoqueCaixas, 10);
        const qtdCaixaConvertida = parseInt(qtdPorCaixa, 10);

        if (
            !nome.trim() ||
            Number.isNaN(precoConvertido) ||
            Number.isNaN(caixasConvertidas) ||
            Number.isNaN(qtdCaixaConvertida) ||
            precoConvertido < 0 ||
            caixasConvertidas < 0 ||
            qtdCaixaConvertida < 1
        ) {
            return;
        }

        const dadosProduto = {
            ...(produtoSelecionado?.id !== undefined && {
                id: produtoSelecionado.id
            }),
            nome: nome.trim(),
            preco: precoConvertido,
            estoqueCaixas: caixasConvertidas,
            qtdPorCaixa: qtdCaixaConvertida,
            embalagem: produtoSelecionado?.embalagem || 'Caixa',
            ...(imagem && { imagem })
        };

        setCarregando(true);

        try {
            const sucesso = await onSalvar(dadosProduto);

            if (sucesso && tipo === 'adicionar') {
                setNome('');
                setPreco('');
                setEstoqueCaixas('');
                setQtdPorCaixa('');
                setImagem('');

                if (inputArquivoRef.current) {
                    inputArquivoRef.current.value = '';
                }
            }
        } finally {
            setCarregando(false);
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

                    <div className="mb-3">
                        <label className="form-label small fw-semibold text-secondary">
                            Foto do Produto
                        </label>
                        <input
                            ref={inputArquivoRef}
                            type="file"
                            accept="image/*"
                            className="form-control"
                            style={estiloInput}
                            onChange={handleImagemChange}
                        />

                        {imagem && (
                            <img
                                src={imagem}
                                alt="Pré-visualização do produto"
                                className="mt-2 rounded shadow-sm"
                                width="60"
                                height="60"
                                style={{ objectFit: 'cover' }}
                            />
                        )}
                    </div>

                    <div className="d-flex gap-2">
                        <button
                            type="submit"
                            className="btn w-100 text-white fw-semibold"
                            disabled={carregando}
                            style={{
                                backgroundColor: tipo === 'adicionar' ? '#1B7A56' : '#2563EB',
                                borderRadius: '8px',
                                padding: '10px'
                            }}
                        >
                            {carregando ? 'Salvando...' : textoBotao}
                        </button>

                        {tipo === 'editar' && produtoSelecionado && (
                            <button
                                type="button"
                                className="btn btn-light border fw-semibold px-3"
                                onClick={onCancelarEdicao}
                                disabled={carregando}
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

function ExcluirProduto({ produtos, onExcluir, onErro }) {
    const [nomeParaExcluir, setNomeParaExcluir] = useState('');
    const [confirmando, setConfirmando] = useState(false);
    const [carregando, setCarregando] = useState(false);

    const verificarProduto = (e) => {
        e.preventDefault();

        const produtoExiste = produtos.some(
            (produto) =>
                produto.nome?.toLowerCase() === nomeParaExcluir.trim().toLowerCase()
        );

        if (!produtoExiste) {
            onErro(`Produto "${nomeParaExcluir}" não encontrado.`);
            return;
        }

        onErro('');
        setConfirmando(true);
    };

    const confirmar = async () => {
        const produto = produtos.find(
            (item) =>
                item.nome?.toLowerCase() === nomeParaExcluir.trim().toLowerCase()
        );

        if (!produto) return;

        setCarregando(true);

        try {
            const sucesso = await onExcluir(produto.id, produto.nome);

            if (sucesso) {
                setNomeParaExcluir('');
                setConfirmando(false);
            }
        } finally {
            setCarregando(false);
        }
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
                    backgroundColor: '#991B1B',
                    color: '#FFFFFF',
                    padding: '12px 16px',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
            >
                <i className="bi bi-trash-fill"></i>
                Excluir Produto
            </div>

            <div className="card-body p-3 d-flex flex-column justify-content-between">
                {!confirmando ? (
                    <form onSubmit={verificarProduto}>
                        <div className="mb-3">
                            <label className="form-label small fw-semibold text-secondary">
                                Nome do produto para excluir
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                style={{
                                    backgroundColor: '#F2F3F5',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '10px 12px',
                                    fontSize: '0.9rem'
                                }}
                                placeholder="Digite o nome exato"
                                value={nomeParaExcluir}
                                onChange={(e) => setNomeParaExcluir(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn w-100 text-white fw-semibold"
                            style={{
                                backgroundColor: '#DC2626',
                                borderRadius: '8px',
                                padding: '10px'
                            }}
                        >
                            Excluir Produto
                        </button>
                    </form>
                ) : (
                    <div
                        className="p-3 rounded"
                        style={{
                            backgroundColor: '#FEF2F2',
                            border: '1px solid #FECACA'
                        }}
                    >
                        <p className="small mb-3 text-danger">
                            Confirmar exclusão de <strong>{nomeParaExcluir}</strong>?
                        </p>

                        <div className="d-flex gap-2">
                            <button
                                type="button"
                                className="btn btn-danger btn-sm w-50 fw-semibold"
                                onClick={confirmar}
                                disabled={carregando}
                            >
                                {carregando ? 'Excluindo...' : 'Confirmar'}
                            </button>

                            <button
                                type="button"
                                className="btn btn-light btn-sm w-50 fw-semibold border"
                                onClick={() => setConfirmando(false)}
                                disabled={carregando}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}
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
    const [carregandoProdutos, setCarregandoProdutos] = useState(true);

    const carregarProdutos = useCallback(async () => {
        const gestorId = obterGestorId();

        const resposta = await fetch(
            `${API_URL}?gestorId=${encodeURIComponent(gestorId)}`
        );

        if (!resposta.ok) {
            throw new Error(await obterErroResposta(resposta));
        }

        const dados = await resposta.json();
        const listaApi = Array.isArray(dados) ? dados : [];
        const imagensLocais = lerImagensLocais();

        const listaComImagens = listaApi.map((produto) => ({
            ...produto,
            imagem: imagensLocais[produto.id] || '',
            embalagem: produto.embalagem || 'Caixa'
        }));

        setProdutos(listaComImagens);

        return listaComImagens;
    }, []);

    useEffect(() => {
        const iniciar = async () => {
            try {
                setCarregandoProdutos(true);
                await carregarProdutos();

                setMensagem({ texto: '', tipo: '' });
            } catch (erro) {
                console.error('Erro ao carregar produtos:', erro);

                setProdutos([]);
                setMensagem({
                    texto: `Não foi possível carregar os produtos do servidor: ${erro.message}`,
                    tipo: 'danger'
                });
            } finally {
                setCarregandoProdutos(false);
            }
        };

        iniciar();
    }, [carregarProdutos]);

    useEffect(() => {
        if (location.state?.produtoSelecionado) {
            setProdutoEmEdicao(location.state.produtoSelecionado);
        }
    }, [location.state]);

    const handleAdicionar = async (novoProduto) => {
        try {
            const gestorId = obterGestorId();

            const resposta = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome: novoProduto.nome,
                    preco: novoProduto.preco,
                    estoqueCaixas: novoProduto.estoqueCaixas,
                    qtdPorCaixa: novoProduto.qtdPorCaixa,
                    gestorId
                })
            });

            if (!resposta.ok) {
                throw new Error(await obterErroResposta(resposta));
            }

            let produtoCriado = null;

            const texto = await resposta.text();

            if (texto) {
                try {
                    produtoCriado = JSON.parse(texto);
                } catch {
                    console.warn('O backend não retornou um JSON válido.');
                }
            }

            const listaAtualizada = await carregarProdutos();

            const produtoEncontrado =
                listaAtualizada.find((item) => item.id === produtoCriado?.id) ||
                listaAtualizada.find(
                    (item) =>
                        item.nome?.toLowerCase() === novoProduto.nome.toLowerCase()
                );

            if (novoProduto.imagem && produtoEncontrado?.id !== undefined) {
                salvarImagemLocal(produtoEncontrado.id, novoProduto.imagem);

                setProdutos((lista) =>
                    lista.map((item) =>
                        item.id === produtoEncontrado.id
                            ? { ...item, imagem: novoProduto.imagem }
                            : item
                    )
                );
            }

            setMensagem({
                texto: `Produto "${novoProduto.nome}" cadastrado com sucesso!`,
                tipo: 'success'
            });

            return true;
        } catch (erro) {
            console.error('Erro ao cadastrar produto:', erro);

            setMensagem({
                texto: `Não foi possível cadastrar o produto: ${erro.message}`,
                tipo: 'danger'
            });

            return false;
        }
    };

    const handleEditar = async (dadosEditados) => {
        if (dadosEditados.id === undefined || dadosEditados.id === null) {
            setMensagem({
                texto: 'Selecione um produto pelo botão de lápis na tabela antes de editar.',
                tipo: 'warning'
            });

            return false;
        }

        try {
            const gestorId = obterGestorId();

            const resposta = await fetch(`${API_URL}/${dadosEditados.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: dadosEditados.id,
                    nome: dadosEditados.nome,
                    preco: dadosEditados.preco,
                    estoqueCaixas: dadosEditados.estoqueCaixas,
                    qtdPorCaixa: dadosEditados.qtdPorCaixa,
                    gestorId
                })
            });

            if (!resposta.ok) {
                throw new Error(await obterErroResposta(resposta));
            }

            if (dadosEditados.imagem) {
                salvarImagemLocal(dadosEditados.id, dadosEditados.imagem);
            }

            await carregarProdutos();
            setProdutoEmEdicao(null);

            setMensagem({
                texto: `Produto "${dadosEditados.nome}" atualizado com sucesso!`,
                tipo: 'success'
            });

            return true;
        } catch (erro) {
            console.error('Erro ao editar produto:', erro);

            setMensagem({
                texto: `Não foi possível atualizar o produto: ${erro.message}`,
                tipo: 'danger'
            });

            return false;
        }
    };

    const handleExcluir = async (id, nome) => {
        if (!window.confirm(`Tem certeza que deseja excluir "${nome}"?`)) {
            return false;
        }

        try {
            const resposta = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });

            if (!resposta.ok) {
                throw new Error(await obterErroResposta(resposta));
            }

            excluirImagemLocal(id);

            await carregarProdutos();

            if (produtoEmEdicao?.id === id) {
                setProdutoEmEdicao(null);
            }

            setMensagem({
                texto: `Produto "${nome}" excluído com sucesso!`,
                tipo: 'success'
            });

            return true;
        } catch (erro) {
            console.error('Erro ao excluir produto:', erro);

            setMensagem({
                texto: `Não foi possível excluir o produto: ${erro.message}`,
                tipo: 'danger'
            });

            return false;
        }
    };

    const obterImagemProduto = (produto) => {
        if (produto.imagem) return produto.imagem;

        const nome = produto.nome ? produto.nome.toLowerCase() : '';

        if (nome.includes('luva')) return luvasImg;
        if (nome.includes('seringa')) return seringaImg;
        if (nome.includes('máscara') || nome.includes('mascara')) return mascaraImg;

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
                        <div className="col-lg-4">
                            <FormularioProduto
                                titulo="Adicionar Produto"
                                textoBotao="Cadastrar"
                                tipo="adicionar"
                                onSalvar={handleAdicionar}
                            />
                        </div>

                        <div className="col-lg-4">
                            <FormularioProduto
                                titulo="Editar Produto"
                                textoBotao="Salvar Alterações"
                                tipo="editar"
                                produtoSelecionado={produtoEmEdicao}
                                onSalvar={handleEditar}
                                onCancelarEdicao={() => setProdutoEmEdicao(null)}
                            />
                        </div>

                        <div className="col-lg-4">
                            <ExcluirProduto
                                produtos={produtos}
                                onExcluir={handleExcluir}
                                onErro={(erro) =>
                                    setMensagem(
                                        erro
                                            ? { texto: erro, tipo: 'danger' }
                                            : { texto: '', tipo: '' }
                                    )
                                }
                            />
                        </div>
                    </div>

                    <TableCard colunas={colunasResumo} acoes={acaoVoltar}>
                        {carregandoProdutos ? (
                            <div className="p-4 text-center text-muted">
                                Carregando produtos...
                            </div>
                        ) : produtos.length === 0 ? (
                            <div className="p-4 text-center text-muted">
                                Nenhum produto cadastrado.
                            </div>
                        ) : (
                            produtos.map((produto, index) => {
                                const imagemProduto = obterImagemProduto(produto);
                                const caixas = Number(produto.estoqueCaixas ?? 0);
                                const quantidadePorCaixa = Number(produto.qtdPorCaixa ?? 0);

                                return (
                                    <div
                                        key={produto.id ?? index}
                                        className={`row align-items-center p-3 m-0 ${
                                            index < produtos.length - 1 ? 'border-bottom' : ''
                                        }`}
                                    >
                                        <div className="col-12 col-md-5 d-flex align-items-center gap-3 mb-2 mb-md-0">
                                            {imagemProduto ? (
                                                <img
                                                    src={imagemProduto}
                                                    className="rounded shadow-sm"
                                                    width="45"
                                                    height="45"
                                                    style={{ objectFit: 'cover' }}
                                                    alt={produto.nome}
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
                                                    {produto.nome}
                                                </h6>
                                                <small className="text-muted">
                                                    ID: {produto.id}
                                                </small>
                                            </div>
                                        </div>

                                        <div className="col-6 col-md-3">
                                            <h6 className="mb-0 fw-bold">
                                                R$ {Number(produto.preco || 0).toFixed(2).replace('.', ',')}
                                            </h6>
                                            <small className="text-secondary">
                                                {produto.embalagem || 'Caixa'} com {quantidadePorCaixa}
                                            </small>
                                        </div>

                                        <div className="col-3 col-md-2 fw-medium">
                                            <span className={caixas > 0 ? 'text-success' : 'text-danger'}>
                                                {caixas} {caixas === 1 ? 'Caixa' : 'Caixas'}
                                            </span>
                                        </div>

                                        <div className="col-3 col-md-2 text-end text-md-center d-flex justify-content-end justify-content-md-center gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => setProdutoEmEdicao(produto)}
                                                title="Editar Produto"
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </button>

                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleExcluir(produto.id, produto.nome)}
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
