
import React, { useState, useEffect } from 'react';
import '../styles/perfil.css';

export default function Perfil({ titulo, usuario, tipo, onSalvar }) {
    const [nome, setNome] = useState(usuario?.nome || '');
    const [email, setEmail] = useState(usuario?.email || '');


    useEffect(() => {
        setNome(usuario?.nome || '');
        setEmail(usuario?.email || '');
    }, [usuario]);

    const handleSubmit = (e) => {
        e.preventDefault();

        onSalvar({
            nome: nome,
            email: email
        });
    };

    return (
        <div className="perfil-container">
            <h2>{titulo}</h2>

            <form onSubmit={handleSubmit}>
                <div className="perfil-conteudo">

                    <div className="perfil-campo">
                        <label htmlFor="nome">Nome</label>
                        <input
                            id="nome"
                            type="text"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            required
                        />
                    </div>

                    <div className="perfil-campo">
                        <label htmlFor="email">E-mail</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {tipo === 'gestor' && (
                        <>
                            <div className="perfil-campo">
                                <label>CNPJ</label>
                                <p>{usuario?.cnpj || 'Não informado'}</p>
                            </div>

                            <div className="perfil-campo">
                                <label>Razão Social</label>
                                <p>{usuario?.razaoSocial || 'Não informado'}</p>
                            </div>

                            <div className="perfil-campo">
                                <label>Nome da Empresa</label>
                                <p>{usuario?.nomeEmpresa || 'Não informado'}</p>
                            </div>
                        </>
                    )}
                </div>

                <button type="submit" className="btn-salvar-perfil">
                    Salvar alterações
                </button>
            </form>
        </div>
    );
}
