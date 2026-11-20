import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';

import '../styles/produtos.css';

const API_URL = `${(import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')}/produtos`;

// Recupera o ID do gestor logado
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

export default function CadastrarProduto() {
    const navigate = useNavigate();

    const [nome, setNome] = useState('');
    const [preco, setPreco] = useState('');
    const [estoqueCaixas, setEstoqueCaixas] = useState('');
    const [qtdPorCaixa, setQtdPorCaixa] = useState('');
    const [imagem, setImagem] = useState('');
    
    const [produtosRecentes, setProdutosRecentes] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

    const inputArquivoRef = useRef(null);

    // Busca produtos existentes para exibir na lista lateral de apoio
    useEffect(() => {
        async function buscarProdutos() {
            try {
                const gestorId = obterGestorId();
                const resposta = await fetch(`${API_URL}?gestorId=${gestorId}`);
                if (resposta.ok) {
                    const dados = await resposta.json();
                    setProdutosRecentes(Array.isArray(dados) ? dados.slice(-5).reverse() : []);
                }
            } catch (erro) {
                console.error('Erro ao buscar produtos recentes:', erro);
            }
        }
        buscarProdutos();
    }, []);

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

    const handleCadastrar = async (e) => {
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
            setMensagem({
                texto: 'Preencha todos os campos corretamente.',
                tipo: 'warning'
            });
            return;
        }

        setCarregando(true);

        try {
            const gestorId = obterGestorId();

            const resposta = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
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
                texto: `Produto "${nome}" cadastrado com sucesso!`,
                tipo: 'success'
            });

            setTimeout(() => {
                navigate('/produtos');
            }, 1500);

        } catch (erro) {
            console.error('Erro ao cadastrar produto:', erro);
            setMensagem({
                texto: `Não foi possível cadastrar o produto: ${erro.message}`,
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

                    {/* Layout em Grid dividindo o formulário principal e a listagem lateral de apoio */}
                    <div className="row mt-4 mb-4 g-4">
                        
                        {/* Coluna do Formulário de Cadastro */}
                        <div className="col-lg-8">
                            <div
                                className="card shadow-sm bg-white"
                                style={{
                                    borderRadius: '16px',
                                    border: '1px solid #d1ded9',
                                    overflow: 'hidden'
                                }}
                            >
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
                                    <i className="bi bi-plus-circle-fill fs-5"></i>
                                    Cadastrar Novo Produto
                                </div>

                                <div className="card-body p-4 p-md-4">
                                    <form onSubmit={handleCadastrar}>
                                        
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
                                                {carregando ? 'Cadastrando...' : 'Cadastrar Produto'}
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

                        {/* Coluna Lateral: Lista de Produtos Recentes (Apoio visual) */}
                        <div className="col-lg-4">
                            <div
                                className="card shadow-sm bg-white h-100"
                                style={{
                                    borderRadius: '16px',
                                    border: '1px solid #d1ded9',
                                    overflow: 'hidden'
                                }}
                            >
                                <div
                                    style={{
                                        backgroundColor: '#f5f8f7',
                                        color: '#087653',
                                        padding: '14px 20px',
                                        fontWeight: '700',
                                        fontSize: '0.9rem',
                                        borderBottom: '1px solid #d8e3df'
                                    }}
                                >
                                    <i className="bi bi-box-seam me-2"></i>
                                    Últimos Produtos Cadastrados
                                </div>

                                <div className="card-body p-3 d-flex flex-column gap-3">
                                    {produtosRecentes.length === 0 ? (
                                        <p className="text-muted small text-center my-auto py-4">
                                            Nenhum produto recente para exibir.
                                        </p>
                                    ) : (
                                        produtosRecentes.map((prod) => (
                                            <div 
                                                key={prod.id} 
                                                className="d-flex align-items-center justify-content-between p-2 rounded border-bottom"
                                                style={{ backgroundColor: '#fafcfb' }}
                                            >
                                                <div className="d-flex align-items-center gap-2">
                                                    <div 
                                                        className="rounded bg-light d-flex align-items-center justify-content-center border"
                                                        style={{ width: '35px', height: '35px', flexShrink: 0 }}
                                                    >
                                                        {prod.imagem ? (
                                                            <img src={prod.imagem} alt="" width="35" height="35" className="rounded" style={{ objectFit: 'cover' }} />
                                                        ) : (
                                                            <i className="bi bi-box text-success small"></i>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h6 className="mb-0 fw-bold small text-dark">{prod.nome}</h6>
                                                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                            Estoque: {prod.estoqueCaixas ?? 0} caixas
                                                        </small>
                                                    </div>
                                                </div>
                                                <span className="badge bg-success bg-opacity-10 text-success fw-semibold small">
                                                    R$ {Number(prod.preco || 0).toFixed(2).replace('.', ',')}
                                                </span>
                                            </div>
                                        ))
                                    )}

                                    <div className="mt-auto pt-2 text-center">
                                        <Link to="/produtos" className="small text-decoration-none fw-semibold" style={{ color: '#087653' }}>
                                            Ver inventário completo →
                                        </Link>
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