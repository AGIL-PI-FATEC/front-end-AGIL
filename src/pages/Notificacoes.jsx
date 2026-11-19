import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/estilo.css';

export default function Notificacoes() {
    const [listaNotificacoes, setListaNotificacoes] = useState([]);
    const [filtro, setFiltro] = useState('TODAS');
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    const gestor = JSON.parse(sessionStorage.getItem('gestorLogado'));
    const gestorId = gestor?.id;

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        async function buscarNotificacoes() {
            if (!gestorId) {
                setErro('Não foi possível identificar o gestor logado.');
                setCarregando(false);
                return;
            }

            try {
                const resposta = await fetch(
                    `${API_URL}/notificacoes?gestorId=${gestorId}`
                );

                if (!resposta.ok) {
                    throw new Error('Não foi possível carregar as notificações.');
                }

                const dados = await resposta.json();
                setListaNotificacoes(dados);

            } catch (error) {
                console.error('Erro ao buscar notificações:', error);
                setErro(error.message);
            } finally {
                setCarregando(false);
            }
        }

        buscarNotificacoes();
    }, [gestorId, API_URL]);

    async function marcarComoLida(id) {
        try {
            const resposta = await fetch(
                `${API_URL}/notificacoes/${id}/lida`,
                {
                    method: 'PATCH'
                }
            );

            if (!resposta.ok) {
                throw new Error('Não foi possível marcar como lida.');
            }

            setListaNotificacoes((listaAtual) =>
                listaAtual.map((item) =>
                    item.id === id ? { ...item, lida: true } : item
                )
            );

        } catch (error) {
            console.error('Erro ao marcar notificação:', error);
            setErro(error.message);
        }
    }

    function obterCor(tipo) {
        if (tipo === 'ESTOQUE_ZERADO') {
            return 'bg-danger';
        }

        if (tipo === 'ESTOQUE_BAIXO') {
            return 'bg-warning';
        }

        return 'bg-secondary';
    }

    const notificacoesFiltradas = listaNotificacoes.filter((item) => {
        if (filtro === 'LIDAS') return item.lida;
        if (filtro === 'NAO_LIDAS') return !item.lida;
        return true;
    });

    const quantidadeNaoLidas = listaNotificacoes.filter(
        (item) => !item.lida
    ).length;

    return (
        <div className="min-vh-100 d-flex flex-column">
            <div className="d-flex flex-column flex-md-row p-3 gap-3 flex-grow-1">

                <Sidebar active="notificacao" />

                <div className="flex-grow-1 w-100">
                    <Header />

                    <div className="notificacao_banner d-flex justify-content-between align-items-center mb-3 shadow-sm mt-3">
                        <h4 className="fw-bold mb-0 p-2">Notificações</h4>
                        <i className="bi bi-bell-fill fs-4"></i>
                    </div>

                    <div className="bg-white rounded-4 shadow-sm overflow-hidden mb-5">

                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 p-3 border-bottom">

                            <div className="d-flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    className={`btn btn-filtro-notificacao ${filtro === 'TODAS' ? 'ativo' : ''}`}
                                    onClick={() => setFiltro('TODAS')}
                                >
                                    Todas
                                </button>

                                <button
                                    type="button"
                                    className={`btn btn-filtro-notificacao ${filtro === 'NAO_LIDAS' ? 'ativo' : ''}`}
                                    onClick={() => setFiltro('NAO_LIDAS')}
                                >
                                    Não lidas
                                    {quantidadeNaoLidas > 0 && (
                                        <span className="contador-notificacao">
                                            {quantidadeNaoLidas}
                                        </span>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    className={`btn btn-filtro-notificacao ${filtro === 'LIDAS' ? 'ativo' : ''}`}
                                    onClick={() => setFiltro('LIDAS')}
                                >
                                    Lidas
                                </button>
                            </div>

                        </div>

                        {carregando && (
                            <p className="text-center p-4 mb-0">
                                Carregando notificações...
                            </p>
                        )}

                        {!carregando && erro && (
                            <p className="text-danger text-center p-4 mb-0">
                                {erro}
                            </p>
                        )}

                        {!carregando && !erro && notificacoesFiltradas.length === 0 && (
                            <p className="text-muted text-center p-4 mb-0">
                                {filtro === 'LIDAS'
                                    ? 'Nenhuma notificação lida.'
                                    : filtro === 'NAO_LIDAS'
                                        ? 'Você não possui notificações não lidas.'
                                        : 'Nenhuma notificação no momento.'}
                            </p>
                        )}

                        {!carregando && !erro && notificacoesFiltradas.map((item, index) => (
                            <div
                                key={item.id}
                                className={`p-4 item-notificacao ${
                                    index !== notificacoesFiltradas.length - 1
                                        ? 'border-bottom'
                                        : ''
                                } ${item.lida ? 'notificacao-lida' : ''}`}
                            >
                                <div className="d-flex justify-content-between align-items-center gap-3">

                                    <div className="flex-grow-1">
                                        <h6 className="fw-bold mb-1" style={{ color: '#334155' }}>
                                            {item.titulo}
                                        </h6>

                                        <p className="text-muted small mb-1">
                                            {item.mensagem}
                                        </p>

                                        {item.data && (
                                            <small className="text-muted">
                                                {new Date(item.data).toLocaleString('pt-BR')}
                                            </small>
                                        )}

                                        {!item.lida ? (
                                            <div>
                                                <button
                                                    type="button"
                                                    className="btn-marcar-lida mt-2"
                                                    onClick={() => marcarComoLida(item.id)}
                                                >
                                                    <i className="bi bi-check2 me-1"></i>
                                                    Marcar como lida
                                                </button>
                                            </div>
                                        ) : (
                                            <small className="texto-lida mt-2 d-inline-block">
                                                <i className="bi bi-check2-all me-1"></i>
                                                Lida
                                            </small>
                                        )}
                                    </div>

                                    <div
                                        className={`dot ${obterCor(item.tipo)}`}
                                        style={{
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            flexShrink: 0,
                                            opacity: item.lida ? 0.4 : 1
                                        }}
                                    ></div>

                                </div>
                            </div>
                        ))}

                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}