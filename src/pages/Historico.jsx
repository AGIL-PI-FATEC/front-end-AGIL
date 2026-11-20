import React, { useState, useMemo, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import TableCard from '../components/TableCard';
import Footer from '../components/Footer';

import '../styles/produtos.css';

const API_BASE_URL = (
    import.meta.env.VITE_API_URL || 'http://localhost:8080'
).replace(/\/$/, '');

const API_URL = `${API_BASE_URL}/historico`;

// Recupera o ID do gestor associado ao usuário logado
function obterGestorId() {
    const gestorLogado = sessionStorage.getItem('gestorLogado');
    const funcionarioLogado = sessionStorage.getItem('funcionarioLogado');

    if (gestorLogado) {
        const gestor = JSON.parse(gestorLogado);
        if (gestor.id) return gestor.id;
    }

    if (funcionarioLogado) {
        const funcionario = JSON.parse(funcionarioLogado);

        return (
            funcionario.gestorId ||
            funcionario.idGestor ||
            funcionario.gestor?.id ||
            funcionario.gestor?.idGestor ||
            null
        );
    }

    return null;
}

// Converte a data ISO recebida do backend para data brasileira
function formatarData(data) {
    if (!data) return '-';

    const [dataParte, horaParte] = data.split('T');
    const [ano, mes, dia] = dataParte.split('-');

    if (!ano || !mes || !dia) return data;

    const dataFormatada = `${dia}/${mes}/${ano}`;

    if (!horaParte) return dataFormatada;

    return `${dataFormatada} ${horaParte.substring(0, 5)}`;
}

// Converte a data ISO em número para ordenação
function dataParaNumero(data) {
    if (!data) return 0;

    return new Date(data).getTime() || 0;
}

export default function Historico() {
    const [registros, setRegistros] = useState([]);
    const [ordemData, setOrdemData] = useState('desc');
    const [abrirFiltroData, setAbrirFiltroData] = useState(false);
    const [dataSelecionada, setDataSelecionada] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    
    // Estado do termo de busca adicionado
    const [termoBusca, setTermoBusca] = useState('');

    const menuFiltroRef = useRef(null);

    // Busca o histórico do gestor logado
    useEffect(() => {
        let ativo = true;

        async function buscarHistorico() {
            try {
                setCarregando(true);
                setErro('');

                const gestorId = obterGestorId();

                if (!gestorId) {
                    throw new Error(
                        'Não foi possível identificar o gestor associado ao usuário logado.'
                    );
                }

                const resposta = await fetch(
                    `${API_URL}?gestorId=${encodeURIComponent(gestorId)}`
                );

                if (!resposta.ok) {
                    const mensagem = await resposta.text();

                    throw new Error(
                        mensagem || `Erro ao buscar histórico (${resposta.status}).`
                    );
                }

                const dados = await resposta.json();

                if (!Array.isArray(dados)) {
                    throw new Error('O formato dos dados recebidos é inválido.');
                }

                if (ativo) {
                    setRegistros(dados);
                }
            } catch (error) {
                if (ativo) {
                    setErro(error.message || 'Não foi possível carregar o histórico.');
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        buscarHistorico();

        return () => {
            ativo = false;
        };
    }, []);

    // Fecha o menu quando clicar fora dele
    useEffect(() => {
        const handleClickFora = (e) => {
            if (
                menuFiltroRef.current &&
                !menuFiltroRef.current.contains(e.target)
            ) {
                setAbrirFiltroData(false);
            }
        };

        document.addEventListener('mousedown', handleClickFora);

        return () => {
            document.removeEventListener('mousedown', handleClickFora);
        };
    }, []);

    // Filtra e ordena os registros recebidos da API
    const itensExibidos = useMemo(() => {
        const busca = termoBusca.trim().toLowerCase();

        const filtrados = registros.filter((item) => {
            const correspondeData =
                !dataSelecionada ||
                item.data?.substring(0, 10) === dataSelecionada;

            const textoRegistro = [
                item.produto,
                item.tipo,
                item.quantidade,
                item.unidade,
                formatarData(item.data)
            ]
                .join(' ')
                .toLowerCase();

            return (
                correspondeData &&
                textoRegistro.includes(busca)
            );
        });

        return [...filtrados].sort((a, b) => {
            const diff =
                dataParaNumero(a.data) - dataParaNumero(b.data);

            return ordemData === 'desc' ? -diff : diff;
        });
    }, [registros, ordemData, dataSelecionada, termoBusca]);

    const colunasHistorico = (
        <>
            <div className="col-md-4">Produto</div>
            <div className="col-md-3">Tipo</div>
            <div className="col-md-2 text-center">Quantidade</div>
            <div className="col-md-3 text-end">Data</div>
        </>
    );

    const acoesHistorico = (
        <div
            ref={menuFiltroRef}
            style={{ position: 'relative', display: 'inline-block' }}
        >
            <i
                className="bi bi-filter"
                style={{ cursor: 'pointer' }}
                title="Filtrar por data"
                onClick={() => setAbrirFiltroData((prev) => !prev)}
            ></i>

            {abrirFiltroData && (
                <div
                    className="bg-white border rounded-3 shadow-sm p-2 d-flex flex-column gap-1"
                    style={{
                        position: 'absolute',
                        top: '130%',
                        right: 0,
                        zIndex: 1050,
                        minWidth: '155px'
                    }}
                >
                    <button
                        type="button"
                        className={`btn btn-sm text-start py-1 px-2 ${
                            ordemData === 'desc'
                                ? 'btn-success text-white'
                                : 'btn-light text-dark'
                        }`}
                        style={{ fontSize: '0.78rem' }}
                        onClick={() => {
                            setOrdemData('desc');
                            setAbrirFiltroData(false);
                        }}
                    >
                        Mais recente
                    </button>

                    <button
                        type="button"
                        className={`btn btn-sm text-start py-1 px-2 ${
                            ordemData === 'asc'
                                ? 'btn-success text-white'
                                : 'btn-light text-dark'
                        }`}
                        style={{ fontSize: '0.78rem' }}
                        onClick={() => {
                            setOrdemData('asc');
                            setAbrirFiltroData(false);
                        }}
                    >
                        Mais antigo
                    </button>

                    <div className="border-top pt-1 mt-1 d-flex align-items-center gap-1">
                        <input
                            type="date"
                            className="form-control form-control-sm py-1 px-1"
                            style={{ fontSize: '0.75rem' }}
                            value={dataSelecionada}
                            onChange={(e) => setDataSelecionada(e.target.value)}
                            title="Buscar por data"
                        />

                        {dataSelecionada && (
                            <button
                                type="button"
                                className="btn btn-sm btn-light px-1 py-0 text-secondary"
                                style={{ fontSize: '0.75rem' }}
                                onClick={() => setDataSelecionada('')}
                                title="Limpar data"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-vh-100 d-flex flex-column">
            <div className="d-flex flex-column flex-md-row p-3 gap-3 flex-grow-1">

                <Sidebar active="historico" />

                <div className="flex-grow-1 w-100">

                    <Header
                        valorBusca={termoBusca}
                        onBuscar={setTermoBusca}
                    />

                    <TableCard
                        colunas={colunasHistorico}
                        acoes={acoesHistorico}
                    >
                        {carregando ? (
                            <div className="p-4 text-center text-muted">
                                Carregando histórico...
                            </div>
                        ) : erro ? (
                            <div className="p-4 text-center text-danger">
                                {erro}
                            </div>
                        ) : itensExibidos.length === 0 ? (
                            <div className="p-4 text-center text-muted">
                                Nenhum registro encontrado
                                {dataSelecionada
                                    ? ' para a data selecionada.'
                                    : '.'}
                            </div>
                        ) : (
                            itensExibidos.map((item, index) => {
                                const isEntrada = item.tipo === 'Entrada';
                                const ultimoItem =
                                    index === itensExibidos.length - 1;

                                return (
                                    <div
                                        key={item.id}
                                        className={`row align-items-center p-3 m-0 ${
                                            !ultimoItem ? 'border-bottom' : ''
                                        }`}
                                    >
                                        <div className="col-12 col-md-4 mb-2 mb-md-0">
                                            <h6 className="mb-0 fw-bold text-dark">
                                                {item.produto}
                                            </h6>
                                        </div>

                                        <div
                                            className={`col-4 col-md-3 fw-medium ${
                                                isEntrada
                                                    ? 'text-success'
                                                    : 'text-danger'
                                            }`}
                                        >
                                            <i
                                                className={`bi ${
                                                    isEntrada
                                                        ? 'bi-arrow-down-circle-fill'
                                                        : 'bi-arrow-up-circle-fill'
                                                } me-1`}
                                            ></i>{' '}
                                            {item.tipo}
                                        </div>

                                        <div className="col-4 col-md-2 text-center fw-bold">
                                            {item.quantidade} {item.unidade || ''}
                                        </div>

                                        <div className="col-4 col-md-3 text-end text-muted">
                                            <i className="bi bi-calendar3 me-1 d-inline d-md-none"></i>{' '}
                                            {formatarData(item.data)}
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