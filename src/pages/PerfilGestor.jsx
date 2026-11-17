
import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Perfil from '../components/Perfil';

export default function PerfilGestor() {
    const navigate = useNavigate();

    const dadosGestor = sessionStorage.getItem('gestorLogado');

    //verifica se tem um gestor logado
    if (!dadosGestor) {
        return <Navigate to="/login" replace />;
    }

    const [gestor, setGestor] = useState(JSON.parse(dadosGestor));
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL;

    //atualiza nome e email do gestor
    const handleSalvar = async (dadosAtualizados) => {
        setErro('');
        setMensagem('');
        setCarregando(true);

        try {
            const resposta = await fetch(
                `${API_URL}/gestores/${gestor.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        nome: dadosAtualizados.nome,
                        email: dadosAtualizados.email
                    })
                }
            );

            if (!resposta.ok) {
                throw new Error('Não foi possível atualizar os dados.');
            }

            const novoGestor = {
                ...gestor,
                nome: dadosAtualizados.nome,
                email: dadosAtualizados.email
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

    //exclui a conta do gestor
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
            const resposta = await fetch(
                `${API_URL}/gestores/${gestor.id}`,
                {
                    method: 'DELETE'
                }
            );

            if (!resposta.ok) {
                throw new Error('Não foi possível excluir a conta.');
            }

            sessionStorage.removeItem('gestorLogado');

            navigate('/login');

        } catch (error) {
            console.error('Erro ao excluir gestor:', error);
            setErro(error.message);
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div>
            <Perfil
                titulo="Meu Perfil"
                usuario={gestor}
                tipo="gestor"
                onSalvar={handleSalvar}
            />

            {mensagem && <p>{mensagem}</p>}
            {erro && <p>{erro}</p>}

            <button
                type="button"
                onClick={handleExcluir}
                disabled={carregando}
            >
                Excluir minha conta
            </button>

            {carregando && <p>Processando...</p>}
        </div>
    );
}
