
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
                        src={funcionario.fotoUrl || imagemPerfil}
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

            </div>

            <Footer />
        </>
    );
}
