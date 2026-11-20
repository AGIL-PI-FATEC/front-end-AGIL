
import React, { useState, useEffect } from 'react';
import '../styles/perfil.css';
import imagemPerfil from '../assets/imagem_perfil.png';

export default function Perfil({ titulo, usuario, tipo, onSalvar }) {
    const [nome, setNome] = useState(usuario?.nome || '');
    const [email, setEmail] = useState(usuario?.email || '');
    const [foto, setFoto] = useState(usuario?.foto || '');

    const somenteVisualizacao = tipo === 'funcionario';

    useEffect(() => {
        setNome(usuario?.nome || '');
        setEmail(usuario?.email || '');
        setFoto(usuario?.foto || '');
    }, [usuario]);

    function handleFotoChange(event) {
        const arquivo = event.target.files[0];

        if (!arquivo) return;

        if (!arquivo.type.startsWith('image/')) {
            alert('Selecione um arquivo de imagem válido.');
            event.target.value = '';
            return;
        }

        const leitor = new FileReader();

        leitor.onloadend = () => {
            setFoto(leitor.result);
        };

        leitor.readAsDataURL(arquivo);
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        onSalvar({
            nome: nome,
            email: email,
            foto: foto || null
        });
    };

    return (
        <div className="perfil-container">
            <h2>{titulo}</h2>

            <form onSubmit={handleSubmit}>

                {tipo === 'gestor' && (
                    <div className="perfil-foto">
                        <label>Foto de perfil</label>

                        <div className="perfil-foto-conteudo">
                            <img
                                src={foto || imagemPerfil}
                                alt="Foto do gestor"
                                className="perfil-imagem"
                            />

                            <div className="perfil-foto-selecao">
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={handleFotoChange}
                                />

                                <small>
                                    A foto é opcional. Se não selecionar uma,
                                    será utilizada a imagem padrão.
                                </small>
                            </div>
                        </div>
                    </div>
                )}

                <div className="perfil-dados">

                    <div className="perfil-campo">
                        <label htmlFor="nome">Nome</label>

                        {somenteVisualizacao ? (
                            <p>{usuario?.nome || 'Não informado'}</p>
                        ) : (
                            <input
                                id="nome"
                                type="text"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                required
                            />
                        )}
                    </div>

                    <div className="perfil-campo">
                        <label htmlFor="email">E-mail</label>

                        {somenteVisualizacao ? (
                            <p>{usuario?.email || 'Não informado'}</p>
                        ) : (
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        )}
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

                    {tipo === 'funcionario' && (
                        <>
                            <div className="perfil-campo">
                                <label>Cargo</label>
                                <p>{usuario?.cargo || 'Não informado'}</p>
                            </div>

                            <div className="perfil-campo">
                                <label>Nome da Empresa</label>
                                <p>{usuario?.nomeEmpresa || 'Não informado'}</p>
                            </div>
                        </>
                    )}

                </div>

                {!somenteVisualizacao && (
                    <button type="submit" className="btn-salvar-perfil">
                        Salvar alterações
                    </button>
                )}

            </form>
        </div>
    );
}
