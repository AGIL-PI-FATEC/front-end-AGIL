import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';

import '../styles/produtos.css';

const API_URL = `${(import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')}/produtos`;
const STORAGE_KEY = 'agil_produtos_imagens';

// Recupera o ID do gestor ou da empresa associada ao usuário logado.
function obterGestorId() {
    try {
        const gestor = JSON.parse(
            sessionStorage.getItem('gestorLogado') || 'null'
        );

        const funcionario = JSON.parse(
            sessionStorage.getItem('funcionarioLogado') || 'null'
        );

        const gestorId = gestor?.id || funcionario?.gestorId;

        if (!gestorId) {
            throw new Error('Não foi possível identificar a empresa.');
        }

        return gestorId;
    } catch (erro) {
        if (erro instanceof SyntaxError) {
            throw new Error('Os dados de autenticação estão inválidos. Faça login novamente.');
        }

        throw erro;
    }
}

async function obterErroResposta(resposta) {
    const erro = await resposta.text();
    console.error('Erro retornado pelo backend:', erro);
    return erro || `HTTP ${resposta.status}`;
}

export default function EditarProdutos() {
    const location = useLocation();
    const navigate = useNavigate();

    const produtoParam = location.state?.produtoSelecionado || null;

    const [nome, setNome] = useState(produtoParam?.nome || '');
    const [preco, setPreco] = useState(produtoParam?.preco ?? '');
    const [estoqueCaixas, setEstoqueCaixas] = useState(produtoParam?.estoqueCaixas ?? '');
    const [qtdPorCaixa, setQtdPorCaixa] = useState(produtoParam?.qtdPorCaixa ?? '');
    const [imagem, setImagem] = useState(produtoParam?.imagem || '');
    const [carregando, setCarregando] = useState(false);
    const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

    const inputArquivoRef = useRef(null);

    useEffect(() => {
        if (produtoParam) {
            setNome(produtoParam.nome || '');
            setPreco(produtoParam.preco ?? '');
            setEstoqueCaixas(produtoParam.estoqueCaixas ?? '');
            setQtdPorCaixa(produtoParam.qtdPorCaixa ?? '');
            setImagem(produtoParam.imagem || '');
        }
    }, [produtoParam]);

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

    const handleSalvarEdicao = async (e) => {
        e.preventDefault();

        if (!produtoParam?.id) {
            setMensagem({
                texto: 'Nenhum produto selecionado para edição.',
                tipo: 'warning'
            });
            return;
        }

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
            setMensagem({
                texto: 'Preencha todos os campos corretamente.',
                tipo: 'warning'
            });
            return;
        }

        setCarregando(true);

        try {
            const gestorId = obterGestorId();

            const resposta = await fetch(`${API_URL}/${produtoParam.id}?gestorId=${gestorId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: produtoParam.id,
                    nome: nome.trim(),
                    preco: precoConvertido,
                    estoqueCaixas: caixasConvertidas,
                    qtdPorCaixa: qtdCaixaConvertida,
                    gestorId,
                    imagem
                })
            });

            if (!resposta.ok) {
                throw new Error(await obterErroResposta(resposta));
            }

            setMensagem({
                texto: `Produto "${nome}" atualizado com sucesso!`,
                tipo: 'success'
            });

            setTimeout(() => {
                navigate('/produtos');
            }, 1500);

        } catch (erro) {
            console.error('Erro ao editar produto:', erro);
            setMensagem({
                texto: `Não foi possível atualizar o produto: ${erro.message}`,
                tipo: 'danger'
            });
        } finally {
            setCarregando(false);
        }
    };

    const estiloInput = {
        backgroundColor: '#f5f8f7',
        border: '1px solid #d8e3df',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '0.9rem',
        color: '#263b35'
    };

    return (
        <div className="min-vh-100 d-flex flex-column">
            <div className="d-flex flex-column flex-md-row p-3 gap-3 flex-grow-1">
                <Sidebar active="produtos" />

                <div className="flex-grow-1 w-100">
                    <Header />

                    {mensagem.texto && (
                        <div className={`alert alert-${mensagem.tipo === 'success' ? 'success' : 'danger'} alert-dismissible fade show rounded-3 mt-3 shadow-sm`}>
                            {mensagem.texto}
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setMensagem({ texto: '', tipo: '' })}
                            ></button>
                        </div>
                    )}

                    {/* Centralização e largura maior no desktop (col-lg-9 ou col-xl-8) com altura mais compacta */}
                    <div className="row justify-content-center mt-4 mb-4">
                        <div className="col-lg-9 col-xl-8">
                            <div
                                className="card shadow-sm bg-white"
                                style={{
                                    borderRadius: '16px',
                                    border: '1px solid #d1ded9', // Frame com cor levemente destacada
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Cabeçalho verde padrão */}
                                <div
                                    style={{
                                        backgroundColor: '#087653',
                                        color: '#FFFFFF',
                                        padding: '14px 20px',
                                        fontWeight: '600',
                                        fontSize: '0.95rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}
                                >
                                    <i className="bi bi-pencil-square fs-5"></i>
                                    Editar Produto {produtoParam?.nome ? `(${produtoParam.nome})` : ''}
                                </div>

                                {/* Corpo do card mais compacto/distribuído em grid horizontal no desktop */}
                                <div className="card-body p-4 p-md-4">
                                    <form onSubmit={handleSalvarEdicao}>
                                        
                                        {/* Linha 1: Nome e Preço lado a lado para diminuir a altura */}
                                        <div className="row g-3 mb-3">
                                            <div className="col-md-7">
                                                <label className="form-label small fw-semibold" style={{ color: '#263b35' }}>
                                                    Nome do Produto
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control shadow-none"
                                                    style={estiloInput}
                                                    placeholder="Ex: Luvas Cirúrgicas"
                                                    value={nome}
                                                    onChange={(e) => setNome(e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-5">
                                                <label className="form-label small fw-semibold" style={{ color: '#263b35' }}>
                                                    Preço do Produto (R$)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    className="form-control shadow-none"
                                                    style={estiloInput}
                                                    placeholder="Ex: 89.90"
                                                    value={preco}
                                                    onChange={(e) => setPreco(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Linha 2: Estoque, Qtd por Caixa e Foto */}
                                        <div className="row g-3 mb-4">
                                            <div className="col-md-4">
                                                <label className="form-label small fw-semibold" style={{ color: '#263b35' }}>
                                                    Qtd de Caixas (Estoque)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="form-control shadow-none"
                                                    style={estiloInput}
                                                    placeholder="Ex: 12"
                                                    value={estoqueCaixas}
                                                    onChange={(e) => setEstoqueCaixas(e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-4">
                                                <label className="form-label small fw-semibold" style={{ color: '#263b35' }}>
                                                    Quantidade por Caixa
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="form-control shadow-none"
                                                    style={estiloInput}
                                                    placeholder="Ex: 100"
                                                    value={qtdPorCaixa}
                                                    onChange={(e) => setQtdPorCaixa(e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-4">
                                                <label className="form-label small fw-semibold" style={{ color: '#263b35' }}>
                                                    Foto do Produto
                                                </label>
                                                <div className="d-flex align-items-center gap-2">
                                                    <input
                                                        ref={inputArquivoRef}
                                                        type="file"
                                                        accept="image/*"
                                                        className="form-control shadow-none"
                                                        style={{ ...estiloInput, padding: '7px 10px', fontSize: '0.85rem' }}
                                                        onChange={handleImagemChange}
                                                    />
                                                    {imagem && (
                                                        <img
                                                            src={imagem}
                                                            alt="Prévia"
                                                            className="rounded shadow-sm border flex-shrink-0"
                                                            width="38"
                                                            height="38"
                                                            style={{ objectFit: 'cover' }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Botões de ação */}
                                        <div className="d-flex gap-3 pt-2">
                                            <button
                                                type="submit"
                                                className="btn w-100 text-white fw-semibold shadow-sm"
                                                disabled={carregando}
                                                style={{
                                                    background: 'linear-gradient(90deg, #087653, #269c7e)',
                                                    borderRadius: '8px',
                                                    padding: '11px',
                                                    border: 'none',
                                                    transition: 'opacity 0.2s'
                                                }}
                                            >
                                                {carregando ? 'Salvando...' : 'Salvar Alterações'}
                                            </button>

                                            <Link
                                                to="/produtos"
                                                className="btn btn-light border fw-semibold px-4 d-flex align-items-center justify-content-center text-decoration-none"
                                                style={{ 
                                                    borderRadius: '8px', 
                                                    borderColor: '#d8e3df',
                                                    color: '#263b35' 
                                                }}
                                            >
                                                Cancelar
                                            </Link>
                                        </div>
                                    </form>
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