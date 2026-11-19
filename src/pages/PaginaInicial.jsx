
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import BemVindo from '../components/BemVindo';
import TableCard from '../components/TableCard';
import Footer from '../components/Footer';
import imagemPerfil from '../assets/imagem_perfil.png';

export default function PaginaInicial() {
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    const gestor = JSON.parse(
        sessionStorage.getItem('gestorLogado') || 'null'
    );

    const funcionarioLogado = JSON.parse(
        sessionStorage.getItem('funcionarioLogado') || 'null'
    );

    // Identifica o gestor responsável
    const gestorId = gestor?.id || funcionarioLogado?.gestorId;

    const [listaFuncionarios, setListaFuncionarios] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    // Busca os funcionários vinculados ao gestor
    useEffect(() => {
        async function buscarFuncionarios() {
            if (!gestorId) {
                setErro('Não foi possível identificar o gestor responsável.');
                setCarregando(false);
                return;
            }

            try {
                const resposta = await fetch(
                    `${API_URL}/funcionarios?gestorId=${gestorId}`
                );

                if (!resposta.ok) {
                    throw new Error('Não foi possível carregar os funcionários.');
                }

                const dados = await resposta.json();
                setListaFuncionarios(dados);

            } catch (error) {
                setErro(error.message);
            } finally {
                setCarregando(false);
            }
        }

        buscarFuncionarios();
    }, [API_URL, gestorId]);

    // Dados de exemplo do estoque
    const produtosExemplo = [
        { id: 1, nome: 'Seringa Descartável', quantidade: 150, status: 'Em Estoque' },
        { id: 2, nome: 'Luvas de Nitrilo', quantidade: 20, status: 'Estoque Baixo' },
        { id: 3, nome: 'Álcool em Gel 70%', quantidade: 80, status: 'Em Estoque' },
    ];

    const colunasTabela = (
        <>
            <div className="col-4">Produto</div>
            <div className="col-4">Quantidade</div>
            <div className="col-4">Status</div>
        </>
    );

    const acoesTabela = (
        <>
            <i className="bi bi-filter style-pointer" title="Filtrar"></i>
            <i className="bi bi-plus-circle style-pointer" title="Adicionar"></i>
        </>
    );

    return (
        <div className="d-flex flex-column min-vh-100">

            <div className="d-flex flex-column flex-md-row p-3 gap-3 flex-grow-1">

                <Sidebar active="inicio" />

                <div className="flex-grow-1 w-100">

                    <Header />

                    <div className="container-fluid flex-grow-1 p-0">

                        <div className="row mb-4">
                            <div className="col-12">
                                <BemVindo />
                            </div>
                        </div>

                        <div className="row g-4">

                            {/* Resumo do estoque */}
                            <div className="col-12 col-lg-8">

                                <h5 className="fw-bold mb-3">
                                    Resumo do Estoque
                                </h5>

                                <TableCard colunas={colunasTabela} acoes={acoesTabela}>
                                    <ul className="list-group list-group-flush">

                                        {produtosExemplo.map((item) => (
                                            <li
                                                key={item.id}
                                                className="list-group-item d-flex align-items-center justify-content-between p-3"
                                            >
                                                <div className="row w-100 align-items-center">

                                                    <div className="col-12 col-md-4 fw-medium">
                                                        {item.nome}
                                                    </div>

                                                    <div className="col-12 col-md-4 text-muted">
                                                        {item.quantidade} un
                                                    </div>

                                                    <div className="col-12 col-md-4">
                                                        <span className={`badge ${item.status === 'Estoque Baixo' ? 'bg-danger' : 'bg-success'}`}>
                                                            {item.status}
                                                        </span>
                                                    </div>

                                                </div>
                                            </li>
                                        ))}

                                    </ul>
                                </TableCard>

                            </div>

                            {/* Lista de funcionários */}
                            <div className="col-12 col-lg-4">

                                <div className="colaborators-card mb-3">
                                    <h5 className="d-flex justify-content-between align-items-center fw-bold mb-0 p-2">

                                        Funcionários

                                        <button
                                            type="button"
                                            className="btn p-0 border-0 bg-transparent"
                                            title="Ver todos os funcionários"
                                            onClick={() => navigate('/funcionarios')}
                                        >
                                            <i className="bi bi-arrow-right-circle"></i>
                                        </button>

                                    </h5>
                                </div>

                                <div className="bg-white p-4 rounded-4 shadow-sm">

                                    <div className="colaborator-list">

                                        {carregando && (
                                            <p className="text-center text-muted">
                                                Carregando funcionários...
                                            </p>
                                        )}

                                        {!carregando && erro && (
                                            <p className="text-center text-danger">
                                                {erro}
                                            </p>
                                        )}

                                        {!carregando && !erro && listaFuncionarios.length === 0 && (
                                            <p className="text-center text-muted">
                                                Nenhum funcionário cadastrado.
                                            </p>
                                        )}

                                        {!carregando && !erro && listaFuncionarios.map((func) => (
                                            <div
                                                key={func.id}
                                                className="d-flex align-items-center justify-content-between py-3 border-bottom item-colaborador"
                                            >

                                                <div className="d-flex align-items-center gap-3">

                                                    <img
                                                        src={func.fotoUrl || imagemPerfil}
                                                        alt={`Foto de ${func.nome}`}
                                                        className="rounded-circle object-fit-cover"
                                                        width="50"
                                                        height="50"
                                                    />

                                                    <div>
                                                        <h6 className="m-0 fw-bold">
                                                            {func.nome}
                                                        </h6>

                                                        <small className="text-muted">
                                                            {func.cargo}
                                                        </small>
                                                    </div>

                                                </div>

                                                <i className="bi bi-chevron-right text-muted"></i>

                                            </div>
                                        ))}

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
