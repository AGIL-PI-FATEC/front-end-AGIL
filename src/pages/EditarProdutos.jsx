import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

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

export default function EditarProdutos() {
    const location = useLocation();
    const navigate = useNavigate();

    // Identificando o tipo de usuário logado
    const funcionario = JSON.parse(
        sessionStorage.getItem('funcionarioLogado') || 'null'
    );

    const gestor = JSON.parse(
        sessionStorage.getItem('gestorLogado') || 'null'
    );

    const ehFuncionario = !!funcionario;

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

            const resposta = await fetch(`${API_URL}/${produtoParam.id}`, {
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
                    gestorId
                })
            });

            if (!resposta.ok) {
                throw new Error(await obterErroResposta(resposta));
            }

            if (imagem) {
                salvarImagemLocal(produtoParam.id, imagem);
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
        backgroundColor: '#F2F3F5',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 12px',
        fontSize: '0.9rem'
    };

    return (
        <div className="min-vh-100 d-flex flex-column">
            <div className="d-flex flex-column flex-md-row p-3 gap-3 flex-grow-1">
                <Sidebar active="produtos" />

                <div className="flex-grow-1 w-100">
                    <Header />

                    {mensagem.texto && (
                        <div className={`alert alert-${mensagem.tipo} alert-dismissible fade show rounded-3 mt-3`}>
                            {mensagem.texto}
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setMensagem({ texto: '', tipo: '' })}
                            ></button>
                        </div>
                    )}

                    <div className="row justify-content-center mt-4">
                        <div className="col-lg-6 col-md-8">
                            <div
                                className="card shadow-sm"
                                style={{
                                    borderRadius: '12px',
                                    border: '1px solid #E5E7EB',
                                    overflow: 'hidden'
                                }}
                            >
                                <div
                                    style={{
                                        backgroundColor: '#2563EB',
                                        color: '#FFFFFF',
                                        padding: '12px 16px',
                                        fontWeight: '600',
                                        fontSize: '0.95rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <i className="bi bi-pencil-fill"></i>
                                    Editar Produto {produtoParam?.nome ? `(${produtoParam.nome})` : ''}
                                </div>

                                <div className="card-body p-4">
                                    <form onSubmit={handleSalvarEdicao}>
                                        <div className="mb-3">
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

                                        <div className="mb-3">
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
                                                <label className="file-label form-label small fw-semibold text-secondary">
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

                                        <div className="mb-4">
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
                                                    backgroundColor: '#2563EB',
                                                    borderRadius: '8px',
                                                    padding: '10px'
                                                }}
                                            >
                                                {carregando ? 'Salvando...' : 'Salvar Alterações'}
                                            </button>

                                            <Link
                                                to="/produtos"
                                                className="btn btn-light border fw-semibold px-4 d-flex align-items-center justify-content-center text-decoration-none"
                                                style={{ borderRadius: '8px' }}
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