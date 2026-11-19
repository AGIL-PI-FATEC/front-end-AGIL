import React, { useState, useMemo, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import TableCard from '../components/TableCard';
import Footer from '../components/Footer';

import '../styles/produtos.css';

const REGISTROS_HISTORICO = [
    {
        id: 1,
        produto: 'Seringa Descartável',
        tipo: 'Entrada',
        quantidade: '100 un.',
        data: '20/03/2026'
    },
    {
        id: 2,
        produto: 'Álcool 70%',
        tipo: 'Saída',
        quantidade: '12 un.',
        data: '10/01/2026'
    },
    {
        id: 3,
        produto: 'Máscara Cirúrgica',
        tipo: 'Entrada',
        quantidade: '200 un.',
        data: '27/02/2026'
    }
];

function dataParaNumero(dataStr) {
    if (!dataStr) return 0;
    const [dia, mes, ano] = dataStr.split('/').map(Number);
    return new Date(ano, (mes || 1) - 1, dia || 1).getTime();
}

export default function Historico() {
    const [ordemData, setOrdemData] = useState('desc'); // 'desc' = mais recente | 'asc' = mais antigo
    const [abrirFiltroData, setAbrirFiltroData] = useState(false);
    const [dataSelecionada, setDataSelecionada] = useState(''); // YYYY-MM-DD
    const menuFiltroRef = useRef(null);

    // Fecha o menuzinho se clicar fora dele
    useEffect(() => {
        const handleClickFora = (e) => {
            if (menuFiltroRef.current && !menuFiltroRef.current.contains(e.target)) {
                setAbrirFiltroData(false);
            }
        };
        document.addEventListener('mousedown', handleClickFora);
        return () => document.removeEventListener('mousedown', handleClickFora);
    }, []);

    const itensExibidos = useMemo(() => {
        const filtrados = REGISTROS_HISTORICO.filter((item) => {
            if (!dataSelecionada) return true;
            const [ano, mes, dia] = dataSelecionada.split('-');
            return item.data === `${dia}/${mes}/${ano}`;
        });

        return [...filtrados].sort((a, b) => {
            const diff = dataParaNumero(a.data) - dataParaNumero(b.data);
            return ordemData === 'desc' ? -diff : diff;
        });
    }, [ordemData, dataSelecionada]);

    const colunasHistorico = (
        <>
            <div className="col-md-4">Produto</div>
            <div className="col-md-3">Tipo</div>
            <div className="col-md-2 text-center">Quantidade</div>
            <div className="col-md-3 text-end">Data</div>
        </>
    );

    const acoesHistorico = (
        <div ref={menuFiltroRef} style={{ position: 'relative', display: 'inline-block' }}>
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
                            ordemData === 'desc' ? 'btn-success text-white' : 'btn-light text-dark'
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
                            ordemData === 'asc' ? 'btn-success text-white' : 'btn-light text-dark'
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

                    <Header />

                    <TableCard colunas={colunasHistorico} acoes={acoesHistorico}>

                        {itensExibidos.length === 0 ? (
                            <div className="p-4 text-center text-muted">
                                Nenhum registro encontrado para a data selecionada.
                            </div>
                        ) : (
                            itensExibidos.map((item, index) => {
                                const isEntrada = item.tipo === 'Entrada';
                                const ultimoItem = index === itensExibidos.length - 1;

                                return (
                                    <div
                                        key={item.id}
                                        className={`row align-items-center p-3 m-0 ${
                                            !ultimoItem ? 'border-bottom' : ''
                                        }`}
                                    >
                                        <div className="col-12 col-md-4 mb-2 mb-md-0">
                                            <h6 className="mb-0 fw-bold text-dark">{item.produto}</h6>
                                        </div>
                                        <div
                                            className={`col-4 col-md-3 fw-medium ${
                                                isEntrada ? 'text-success' : 'text-danger'
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
                                            {item.quantidade}
                                        </div>
                                        <div className="col-4 col-md-3 text-end text-muted">
                                            <i className="bi bi-calendar3 me-1 d-inline d-md-none"></i>{' '}
                                            {item.data}
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