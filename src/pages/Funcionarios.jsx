
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';

import imagemPerfil from '../assets/imagem_perfil.png';

export default function Funcionarios() {
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    const gestor = JSON.parse(
        sessionStorage.getItem('gestorLogado') || 'null'
    );

    const funcionarioLogado = JSON.parse(
        sessionStorage.getItem('funcionarioLogado') || 'null'
    );

    const usuarioGestor = !!gestor;

    //procura o id do gestor responsável
    const gestorId = gestor?.id || funcionarioLogado?.gestorId;

    const [listaFuncionarios, setListaFuncionarios] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    //busca os funcionários vinculados ao gestor
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

    return (
        <div className="min-vh-100 d-flex flex-column">
            <div className="d-flex flex-column flex-md-row p-3 gap-3 flex-grow-1">

                <Sidebar active="funcionarios" />

                <div className="flex-grow-1 w-100">

                    <Header />

                    <div className="colaborators-card mb-3">
                        <h4 className="d-flex justify-content-between align-items-center fw-bold mb-0 p-2">
                            Funcionários

                            {usuarioGestor && (
                                <div className="d-flex gap-3 fs-5">
                                    <button
                                        type="button"
                                        className="btn p-0 border-0 bg-transparent"
                                        title="Cadastrar funcionário"
                                        onClick={() => navigate('/gerenciar-funcionarios')}
                                    >
                                        <i className="bi bi-plus-square"></i>
                                    </button>
                                </div>
                            )}
                        </h4>
                    </div>

                    <div className="bg-white p-4 rounded-4 shadow-sm mt-4">
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

            <Footer />
        </div>
    );
}