import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import TableCard from '../components/TableCard';
import Footer from '../components/Footer';
import '../styles/produtos.css';

import luvasImg from '../assets/luvas.jpg';
import seringaImg from '../assets/seringa.jpg';
import mascaraImg from '../assets/mascara.jpg';

const PRODUTOS_INICIAIS = [
    { id: 1, nome: 'Luvas Cirúrgicas', preco: 89.90, qtdPorCaixa: 100, estoqueCaixas: 12, embalagem: 'Caixa' },
    { id: 2, nome: 'Seringa Descartável', preco: 45.50, qtdPorCaixa: 50, estoqueCaixas: 20, embalagem: 'Pacote' },
    { id: 3, nome: 'Máscara Cirúrgica', preco: 32.00, qtdPorCaixa: 50, estoqueCaixas: 18, embalagem: 'Caixa' }
];

function FormularioProduto({ titulo, textoBotao, tipo, onSalvar }) {
    const [nome, setNome] = useState('');
    const [preco, setPreco] = useState('');
    const [qtdPorCaixa, setQtdPorCaixa] = useState('');
    const [estoqueCaixas, setEstoqueCaixas] = useState('');
    const [imagem, setImagem] = useState('');
    const inputArquivoRef = useRef(null);

    const handleImagemChange = (e) => {
        const arquivo = e.target.files[0];
        if (!arquivo) return;

        const reader = new FileReader();
        reader.onload = (evento) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const tamanho = 150;
                canvas.width = tamanho;
                canvas.height = tamanho;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, tamanho, tamanho);
                const imagemComprimida = canvas.toDataURL('image/jpeg', 0.7);
                setImagem(imagemComprimida);
            };
            img.src = evento.target.result;
        };
        reader.readAsDataURL(arquivo);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSalvar({
            nome: nome.trim(),
            preco: parseFloat(preco),
            qtdPorCaixa: parseInt(qtdPorCaixa, 10),
            estoqueCaixas: parseInt(estoqueCaixas, 10),
            ...(imagem && { imagem })
        });
        setNome('');
        setPreco('');
        setQtdPorCaixa('');
        setEstoqueCaixas('');
        setImagem('');
        if (inputArquivoRef.current) {
            inputArquivoRef.current.value = '';
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
                    backgroundColor: '#1B7A56',
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
                {titulo}
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
                                Qtd por Caixa
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

                        <div className="col-6">
                            <label className="form-label small fw-semibold text-secondary">
                                Estoque (Caixas)
                            </label>
                            <input
                                type="number"
                                min="0"
                                className="form-control"
                                style={estiloInput}
                                placeholder="Ex: 15"
                                value={estoqueCaixas}
                                onChange={(e) => setEstoqueCaixas(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {tipo === 'adicionar' && (
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
                                    alt="Pré-visualização"
                                    className="mt-2 rounded shadow-sm"
                                    width="50"
                                    height="50"
                                    style={{ objectFit: 'cover' }}
                                />
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn w-100 text-white fw-semibold"
                        style={{
                            backgroundColor: '#1B7A56',
                            borderRadius: '8px',
                            padding: '10px'
                        }}
                    >
                        {textoBotao}
                    </button>
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
        const existe = produtos.some(
            (p) => p.nome.toLowerCase() === nomeParaExcluir.trim().toLowerCase()
        );
        if (!existe) {
            onErro(`Produto "${nomeParaExcluir}" não encontrado.`);
            return;
        }
        onErro('');
        setConfirmando(true);
    };

    const confirmar = () => {
        onExcluir(nomeParaExcluir.trim());
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
    const [produtos, setProdutos] = useState(() => {
        const salvos = localStorage.getItem('agil_produtos');
        return salvos ? JSON.parse(salvos) : PRODUTOS_INICIAIS;
    });

    const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

    const salvarNoNavegador = (novaLista) => {
        setProdutos(novaLista);
        try {
            localStorage.setItem('agil_produtos', JSON.stringify(novaLista));
        } catch (erro) {
            console.error('Erro ao salvar no localStorage:', erro);
            alert('A imagem escolhida é muito pesada. Tente cadastrar sem foto ou com uma imagem menor.');
        }
    };

    const handleAdicionar = (novoProduto) => {
        const novaLista = [...produtos, { id: Date.now(), embalagem: 'Caixa', ...novoProduto }];
        salvarNoNavegador(novaLista);
        setMensagem({ texto: `Produto "${novoProduto.nome}" adicionado com sucesso!`, tipo: 'success' });
    };

    const handleEditar = (dadosEditados) => {
        const index = produtos.findIndex(
            (p) => p.nome.toLowerCase() === dadosEditados.nome.toLowerCase()
        );
        if (index === -1) {
            setMensagem({ texto: `Produto "${dadosEditados.nome}" não encontrado.`, tipo: 'danger' });
            return;
        }
        const atualizados = [...produtos];
        atualizados[index] = { ...atualizados[index], ...dadosEditados };
        salvarNoNavegador(atualizados);
        setMensagem({ texto: `Produto "${dadosEditados.nome}" atualizado com sucesso!`, tipo: 'success' });
    };

    const handleExcluir = (nomeExcluido) => {
        const novaLista = produtos.filter((p) => p.nome.toLowerCase() !== nomeExcluido.toLowerCase());
        salvarNoNavegador(novaLista);
        setMensagem({ texto: `Produto "${nomeExcluido}" excluído com sucesso!`, tipo: 'success' });
    };

    const obterImagemProduto = (prod) => {
        if (prod.imagem) return prod.imagem;
        const n = prod.nome.toLowerCase();
        if (n.includes('luva')) return luvasImg;
        if (n.includes('seringa')) return seringaImg;
        if (n.includes('máscara') || n.includes('mascara')) return mascaraImg;
        return null;
    };

    const colunasResumo = (
        <>
            <div className="col-md-6">Produto</div>
            <div className="col-md-3">Preço</div>
            <div className="col-md-3">Estoque</div>
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
                                onSalvar={handleEditar}
                            />
                        </div>

                        <div className="col-lg-4">
                            <ExcluirProduto
                                produtos={produtos}
                                onExcluir={handleExcluir}
                                onErro={(erro) =>
                                    setMensagem(erro ? { texto: erro, tipo: 'danger' } : { texto: '', tipo: '' })
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
                            produtos.map((prod, index) => {
                                const imgSrc = obterImagemProduto(prod);
                                return (
                                    <div
                                        key={prod.id}
                                        className={`row align-items-center p-3 m-0 ${
                                            index < produtos.length - 1 ? 'border-bottom' : ''
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
                                            <h6 className="mb-0 fw-bold text-dark">{prod.nome}</h6>
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <h6 className="mb-0 fw-bold">
                                                R$ {Number(prod.preco).toFixed(2).replace('.', ',')}
                                            </h6>
                                            <small className="text-secondary">
                                                {prod.embalagem || 'Caixa'} com {prod.qtdPorCaixa}
                                            </small>
                                        </div>
                                        <div
                                            className={`col-6 col-md-3 fw-medium text-end text-md-start ${
                                                prod.estoqueCaixas > 0 ? 'text-success' : 'text-danger'
                                            }`}
                                        >
                                            <i className="bi bi-circle-fill small me-1"></i>
                                            <span>
                                                {prod.estoqueCaixas > 0 ? `${prod.estoqueCaixas} Caixas` : 'Sem estoque'}
                                            </span>
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