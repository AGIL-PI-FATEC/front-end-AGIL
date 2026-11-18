
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/Logo_semfundo.png';
import loginImg from '../assets/Login.png';
import '../styles/log.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErro('');
    setCarregando(true);

    try {
      const dadosLogin = {
        email: email,
        senha: password
      };

      let resposta = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login/gestor`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dadosLogin)
        }
      );

      let tipoUsuario = 'gestor';

      //se nao encontrar um gestor com essas credenciais, tenta fazer o login como funcionário
      if (resposta.status === 401) {
        resposta = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/login/funcionario`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosLogin)
          }
        );

        tipoUsuario = 'funcionario';
      }

      const texto = await resposta.text();

      let dados = null;

      if (texto) {
        try {
          dados = JSON.parse(texto);
        } catch {
          throw new Error('O servidor retornou uma resposta inválida.');
        }
      }

      //verifica falhas
      if (!resposta.ok) {
        throw new Error(
          dados?.erro ||
          dados?.email ||
          dados?.senha ||
          `Erro ao realizar login. Código: ${resposta.status}`
        );
      }

      // Verificacao
      if (!dados || !dados.id) {
        throw new Error('O servidor não retornou os dados do usuário.');
      }

      // Guarda os dados do usuário que realizou o login
      if (tipoUsuario === 'gestor') {
        sessionStorage.setItem('gestorLogado', JSON.stringify(dados));
        sessionStorage.removeItem('funcionarioLogado');
      } else {
        sessionStorage.setItem('funcionarioLogado', JSON.stringify(dados));
        sessionStorage.removeItem('gestorLogado');
      }

      // Redireciona após o login
      navigate('/inicio-gestor');

    } catch (error) {
      console.error('Erro ao realizar login:', error);
      setErro(error.message || 'Não foi possível conectar ao servidor.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        {/* Lado Esquerdo - Formulário */}
        <div className="login-form">
          <img
            src={logo}
            alt="Logo Ágil"
            style={{ maxWidth: '80px', marginBottom: '10px' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <h2>Bem-vindo!</h2>

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div className="input-group">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Senha</label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {erro && (
              <p style={{ color: 'red', marginBottom: '10px' }}>
                {erro}
              </p>
            )}

            <button
              type="submit"
              className="btn-login"
              disabled={carregando}
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>

            <Link to="/cadastro" className="btn-login1">
              <i className="bi bi-globe2 me-2"></i> Cadastre-se
            </Link>
          </form>
        </div>

        {/* Lado Direito - Ilustração */}
        <div className="login-image">
          <img src={loginImg} alt="Ilustração Login" />
        </div>

      </div>
    </div>
  );
}
