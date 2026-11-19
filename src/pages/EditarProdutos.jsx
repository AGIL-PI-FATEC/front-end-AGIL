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

const API_URL = 'http://localhost:8080/produtos';
const STORAGE_KEY = 'agil_produtos';

const PRODUTOS_INICIAIS = [
    { id: 1, nome: 'Luvas Cirúrgicas', preco: 89.90, qtdPorCaixa: 100, estoqueCaixas: 12, embalagem: 'Caixa' },
    { id: 2, nome: 'Seringa Descartável', preco: 45.50, qtdPorCaixa: 50, estoqueCaixas: 20, embalagem: 'Pacote' },
    { id: 3, nome: 'Máscara Cirúrgica', preco: 32.00, qtdPorCaixa: 50, estoqueCaixas: 18, embalagem: 'Caixa' }
];

function lerProdutosLocais() {
    try {
        const salvos = localStorage.getItem(STORAGE_KEY);

        if (salvos) {
            const parsed = JSON.parse(salvos);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch (erro) {
        console.error('Erro ao ler produtos locais:', erro);
    }

    return [];
}

function salvarProdutosLocais(lista) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    } catch (erro) {
        console.error('Erro ao salvar produtos no navegador:', erro);
        alert('Não foi possível salvar os dados localmente. Verifique se a imagem escolhida é muito grande.');
    }
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
            if (inputArquivoRef.current) inputArquivoRef.current.value = '';
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
            qtdPorCaixa: qtdCaixaConvertida,
            embalagem: produtoSelecionado?.embalagem || 'Caixa',
            ...(imagem && { imagem })
        });

        if (tipo === 'adicionar') {
            setNome('');
            setPreco('');
            setEstoqueCaixas('');
            setQtdPorCaixa('');
            setImagem('');
            if (inputArquivoRef.current) inputArquivoRef.current.value = '';
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

function ExcluirProduto({ produtos, onExcluir, onErro }) {
    const [nomeParaExcluir, setNomeParaExcluir] = useState('');
    const [confirmando, setConfirmando] = useState(false);

    const verificarProduto = (e) => {
        e.preventDefault();

        const produtoExiste = produtos.some(
            (produto) => produto.nome.toLowerCase() === nomeParaExcluir.trim().toLowerCase()
        );

        if (!produtoExiste) {
            onErro(`Produto "${nomeParaExcluir}" não encontrado.`);
            return;
        }

        onErro('');
        setConfirmando(true);
    };

    const confirmar = () => {
        const produto = produtos.find(
            (item) => item.nome.toLowerCase() === nomeParaExcluir.trim().toLowerCase()
        );

        if (produto) onExcluir(produto.id, produto.nome);

        setNomeParaExcluir('');
        setConfirmando(false);
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
                        style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}
                    >
                        <p className="small mb-3 text-danger">
                            Confirmar exclusão de <strong>{nomeParaExcluir}</strong>?
                        </p>

                        <div className="d-flex gap-2">
                            <button
                                type="button"
                                className="btn btn-danger btn-sm w-50 fw-semibold"
                                onClick={confirmar}
                            >
                                Confirmar
                            </button>

                            <button
                                type="button"
                                className="btn btn-light btn-sm w-50 fw-semibold border"
                                onClick={() => setConfirmando(false)}
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

    const [produtos, setProdutos] = useState(() => {
        const salvos = lerProdutosLocais();
        return salvos.length > 0 ? salvos : PRODUTOS_INICIAIS;
    });

    const [produtoEmEdicao, setProdutoEmEdicao] = useState(
        location.state?.produtoSelecionado || null
    );

    const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

    const salvarListaLocal = (lista) => {
        salvarProdutosLocais(lista);
        setProdutos(lista);
    };

    const carregarProdutos = useCallback(async () => {
        try {
            const resposta = await fetch(API_URL);

            if (!resposta.ok) {
                throw new Error(`HTTP ${resposta.status}`);
            }

            const dados = await resposta.json();
            const listaApi = Array.isArray(dados) ? dados : [];
            const produtosLocais = lerProdutosLocais();

            // Mantém as fotos locais, pois a API atual não recebe o arquivo/imagem.
            const listaComImagens = listaApi.map((produto) => {
                const produtoLocal = produtosLocais.find(
                    (local) =>
                        (local.id !== undefined && local.id === produto.id) ||
                        local.nome?.toLowerCase() === produto.nome?.toLowerCase()
                );

                return {
                    ...produto,
                    ...(produtoLocal?.imagem && { imagem: produtoLocal.imagem }),
                    embalagem: produto.embalagem || produtoLocal?.embalagem || 'Caixa'
                };
            });

            setProdutos(listaComImagens);
            salvarProdutosLocais(listaComImagens);
            setMensagem((anterior) =>
                anterior.tipo === 'danger' || anterior.tipo === 'warning'
                    ? { texto: '', tipo: '' }
                    : anterior
            );
        } catch (erro) {
            console.error('Erro ao conectar com a API:', erro);

            const listaLocal = lerProdutosLocais();
            setProdutos(listaLocal.length > 0 ? listaLocal : PRODUTOS_INICIAIS);

            setMensagem({
                texto: 'API em localhost:8080 indisponível. Os dados exibidos vêm do armazenamento local do navegador.',
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

            let produtoCriado = null;
            try {
                produtoCriado = await resposta.json();
            } catch {
                // A API pode responder sem corpo.
            }

            const listaAtual = lerProdutosLocais();
            const produtoComImagem = {
                ...novoProduto,
                ...(produtoCriado?.id !== undefined && { id: produtoCriado.id }),
                ...(produtoCriado?.id === undefined && { id: Date.now() })
            };

            const listaAtualizada = [
                ...listaAtual.filter(
                    (item) => item.nome?.toLowerCase() !== novoProduto.nome.toLowerCase()
                ),
                produtoComImagem
            ];

            salvarProdutosLocais(listaAtualizada);
            await carregarProdutos();

            // Garante que a imagem recém-selecionada continue aparecendo após a busca.
            setProdutos((lista) =>
                lista.map((item) =>
                    item.id === produtoComImagem.id ||
                    item.nome?.toLowerCase() === produtoComImagem.nome.toLowerCase()
                        ? { ...item, imagem: novoProduto.imagem }
                        : item
                )
            );

            setMensagem({
                texto: `Produto "${novoProduto.nome}" adicionado com sucesso!`,
                tipo: 'success'
            });
        } catch (erro) {
            console.error('Erro ao cadastrar produto:', erro);

            const atual = lerProdutosLocais();
            const proximoId =
                atual.reduce((maior, item) => Math.max(maior, Number(item.id) || 0), 0) + 1;

            const criado = { ...novoProduto, id: novoProduto.id ?? proximoId };
            const novaLista = [...atual, criado];

            salvarListaLocal(novaLista);
            setMensagem({
                texto: `Produto "${novoProduto.nome}" salvo localmente (API indisponível).`,
                tipo: 'info'
            });
        }
    };

    const handleEditar = async (dadosEditados) => {
        if (dadosEditados.id === undefined || dadosEditados.id === null) {
            setMensagem({
                texto: 'Selecione um produto pelo botão de lápis na tabela antes de editar.',
                tipo: 'warning'
            });
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

            const locais = lerProdutosLocais();
            const atualizadosLocais = locais.map((item) =>
                item.id === dadosEditados.id
                    ? { ...item, ...dadosEditados }
                    : item
            );

            salvarProdutosLocais(atualizadosLocais);
            await carregarProdutos();
            setProdutoEmEdicao(null);

            setMensagem({
                texto: `Produto "${dadosEditados.nome}" atualizado com sucesso!`,
                tipo: 'success'
            });
        } catch (erro) {
            console.error('Erro ao editar produto:', erro);

            const atual = lerProdutosLocais().length > 0 ? lerProdutosLocais() : produtos;
            const novaLista = atual.map((item) =>
                item.id === dadosEditados.id
                    ? { ...item, ...dadosEditados }
                    : item
            );

            salvarListaLocal(novaLista);
            setProdutoEmEdicao(null);

            setMensagem({
                texto: `Produto "${dadosEditados.nome}" atualizado localmente (API indisponível).`,
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

            const locais = lerProdutosLocais();
            const novaLista = locais.filter((item) => item.id !== id);

            salvarProdutosLocais(novaLista);
            await carregarProdutos();

            if (produtoEmEdicao?.id === id) setProdutoEmEdicao(null);

            setMensagem({
                texto: `Produto "${nome}" excluído com sucesso!`,
                tipo: 'success'
            });
        } catch (erro) {
            console.error('Erro ao excluir produto:', erro);

            const atual = lerProdutosLocais().length > 0 ? lerProdutosLocais() : produtos;
            const novaLista = atual.filter((item) => item.id !== id);

            salvarListaLocal(novaLista);

            if (produtoEmEdicao?.id === id) setProdutoEmEdicao(null);

            setMensagem({
                texto: `Produto "${nome}" removido localmente (API indisponível).`,
                tipo: 'info'
            });
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
                        {produtos.length === 0 ? (
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
                                                <h6 className="mb-0 fw-bold text-dark">{produto.nome}</h6>
                                                <small className="text-muted">ID: {produto.id}</small>
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
