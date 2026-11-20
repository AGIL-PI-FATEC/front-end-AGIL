import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Perfil from '../components/Perfil';
import Footer from '../components/Footer';

import imagemPerfil from '../assets/imagem_perfil.png';

export default function PerfilFuncionario() {
    const navigate = useNavigate();

    const dadosFuncionario = sessionStorage.getItem('funcionarioLogado');

    // verifica se tem um funcionário logado
    if (!dadosFuncionario) {
        return <Navigate to="/login" replace />;
    }

    const funcionario = JSON.parse(dadosFuncionario);

    // Realiza o logout do funcionário
    const handleSair = () => {
        sessionStorage.removeItem('funcionarioLogado');
        sessionStorage.removeItem('tipoUsuario');
        navigate('/login');
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

                <div className="text-center mb-4">
                    <img
                        src={funcionario.foto || imagemPerfil}
                        alt={`Foto de ${funcionario.nome}`}
                        width="110"
                        height="110"
                        style={{
                            borderRadius: '50%',
                            objectFit: 'cover'
                        }}
                    />
                </div>

                <Perfil
                    titulo="Meu Perfil"
                    usuario={funcionario}
                    tipo="funcionario"
                />

                {/* Botão de Sair centralizado */}
                <div className="d-flex justify-content-center my-4">
                    <button
                        type="button"
                        className="btn btn-outline-secondary px-5 py-2 fw-semibold shadow-sm"
                        onClick={handleSair}
                        style={{ borderRadius: '8px' }}
                    >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Sair
                    </button>
                </div>

            </div>

            <Footer />
        </>
    );
}