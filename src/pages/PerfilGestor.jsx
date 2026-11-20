import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import Perfil from '../components/Perfil';
import Footer from '../components/Footer';

export default function PerfilGestor() {
    const navigate = useNavigate();

    const dadosGestor = sessionStorage.getItem('gestorLogado');

    // Verifica se existe um gestor logado
    if (!dadosGestor) {
        return <Navigate to="/login" replace />;
    }

    const [gestor, setGestor] = useState(JSON.parse(dadosGestor));
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL;

    // Atualiza os dados e a foto do gestor
    const handleSalvar = async (dadosAtualizados) => {
        setErro('');
        setMensagem('');
        setCarregando(true);

        try {
            const resposta = await fetch(`${API_URL}/gestores/${gestor.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome: dadosAtualizados.nome,
                    email: dadosAtualizados.email,
                    foto: dadosAtualizados.foto
                })
            });

            if (!resposta.ok) {
                throw new Error('Não foi possível atualizar os dados.');
            }

            const dadosResposta = await resposta.json();

            const novoGestor = {
                ...gestor,
                ...dadosResposta
            };

            setGestor(novoGestor);

            sessionStorage.setItem(
                'gestorLogado',
                JSON.stringify(novoGestor)
            );

            setMensagem('Dados atualizados com sucesso!');

        } catch (error) {
            console.error('Erro ao atualizar gestor:', error);
            setErro(error.message);

        } finally {
            setCarregando(false);
        }
    };

    // Realiza o logout do gestor
    const handleSair = () => {
        sessionStorage.removeItem('gestorLogado');
        sessionStorage.removeItem('tipoUsuario');
        navigate('/login');
    };

    // Exclui a conta do gestor
    const handleExcluir = async () => {
        const confirmar = window.confirm(
            'Tem certeza que deseja excluir sua conta? Essa ação não poderá ser desfeita.'
        );

        if (!confirmar) {
            return;
        }

        setErro('');
        setCarregando(true);

        try {
            const resposta = await fetch(`${API_URL}/gestores/${gestor.id}`, {
                method: 'DELETE'
            });

            if (!resposta.ok) {
                throw new Error('Não foi possível excluir a conta.');
            }

            sessionStorage.removeItem('gestorLogado');
            sessionStorage.removeItem('tipoUsuario');

            navigate('/login');

        } catch (error) {
            console.error('Erro ao excluir gestor:', error);
            setErro(error.message);

        } finally {
            setCarregando(false);
        }
    };

    return (
        <>
            <div className="perfil-pagina">

                <button
                    type="button"
                    className="perfil-voltar"
                    onClick={() => navigate('/inicio-gestor')}
                >
                    ← Voltar ao início
                </button>

                <Perfil
                    titulo="Meu Perfil"
                    usuario={gestor}
                    tipo="gestor"
                    onSalvar={handleSalvar}
                />

                {mensagem && <p className="text-success text-center mt-2">{mensagem}</p>}
                {erro && <p className="text-danger text-center mt-2">{erro}</p>}

                {/* Container para alinhar os botões de Sair e Excluir conta lado a lado */}
                <div className="d-flex justify-content-center align-items-center gap-3 my-4 flex-wrap">
                    <button
                        type="button"
                        className="btn btn-outline-secondary px-4 py-2 fw-semibold"
                        onClick={handleSair}
                        style={{ borderRadius: '8px' }}
                    >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Sair
                    </button>

                    <button
                        type="button"
                        className="btn-excluir-perfil m-0"
                        onClick={handleExcluir}
                        disabled={carregando}
                    >
                        Excluir minha conta
                    </button>
                </div>

                {carregando && <p className="text-center text-muted">Processando...</p>}

            </div>

            <Footer />
        </>
    );
}