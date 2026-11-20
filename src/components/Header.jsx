
import React from 'react';
import { useNavigate } from 'react-router-dom';
import imagemPerfil from '../assets/imagem_perfil.png';
import '../styles/header.css';

export default function Header({ valorBusca = '', onBuscar = () => {} }) {
    const navigate = useNavigate();

    const usuarioLogado =
        JSON.parse(sessionStorage.getItem('gestorLogado') || 'null') ||
        JSON.parse(sessionStorage.getItem('funcionarioLogado') || 'null');

    const tipoUsuario = sessionStorage.getItem('tipoUsuario');

    const caminhoPerfil = tipoUsuario === 'gestor'
        ? '/perfil-gestor'
        : tipoUsuario === 'funcionario'
            ? '/perfil-funcionario'
            : '/login';

    return (
        <div className="header d-flex align-items-center justify-content-between">
            <div className="search-box w-50 position-relative">
                <input
                    type="text"
                    className="form-control rounded-pill ps-4 pe-5"
                    placeholder="Buscar"
                    value={valorBusca}
                    onChange={(e) => onBuscar(e.target.value)}
                />

                <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3"></i>
            </div>

            <div className="user d-flex align-items-center gap-2">
                <span className="fw-medium">
                    {usuarioLogado?.nome || 'Usuário'}
                </span>

                <button
                    type="button"
                    className="botao-perfil-header"
                    onClick={() => navigate(caminhoPerfil)}
                    title="Acessar meu perfil"
                >
                    <img
                        src={imagemPerfil}
                        className="rounded-circle"
                        width="35"
                        height="35"
                        alt="Meu perfil"
                    />
                </button>
            </div>
        </div>
    );
}
