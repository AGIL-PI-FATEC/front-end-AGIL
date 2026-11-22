import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/Logo_semfundo.png';
import '../styles/cad.css';

export default function Cadastro() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nomeCompleto: '',
    cnpj: '',
    email: '',
    nomeEmpresa: '',
    razaoSocial: '',
    senha: '',
    confirmarSenha: '',
    termos: false,
  });

  useEffect(() => {
    const termosAceitos = sessionStorage.getItem('agil_termos_aceitos');

    if (termosAceitos === 'true') {
      setFormData((prev) => ({
        ...prev,
        termos: true,
      }));

      sessionStorage.removeItem('agil_termos_aceitos');
    }
  }, []);

  const [carregando, setCarregando] = useState(false);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.senha !== formData.confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    if (!formData.termos) {
      alert('Você precisa aceitar os termos.');
      return;
    }

    const dadosCadastro = {
      nome: formData.nomeCompleto,
      email: formData.email,
      cnpj: formData.cnpj,
      nomeEmpresa: formData.nomeEmpresa,
      razaoSocial: formData.razaoSocial,
      senha: formData.senha,
      confirmacaoSenha: formData.confirmarSenha,
    };

    try {
      setCarregando(true);

      // comunicação entre o React e o Spring Boot
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/gestores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosCadastro),
      });

      const resultado = await response.json();

      if (!response.ok) {
        alert(resultado.erro || 'Erro ao realizar cadastro.');
        return;
      }

      alert('Cadastro realizado com sucesso!');
      navigate('/login');

    } catch (error) {
      console.error('Erro ao conectar com o servidor:', error);
      alert('Não foi possível conectar ao servidor.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="cadastro-container">
      <div className="card shadow border-0 p-4 cadastro-card">
        <div className="row align-items-center w-100 m-0">

          {/* Lado Esquerdo - Logo e Título */}
          <div className="col-md-5 text-center mb-4 mb-md-0">
            <img
              src={logo}
              className="img-fluid mb-3 logo-cad"
              alt="Logo Ágil"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <h1 className="fw-bold fs-2 text-dark">Crie sua conta</h1>
            <p className="text-muted fs-6">
              Preencha os dados abaixo para começar
            </p>
          </div>

          {/* Lado Direito - Formulário */}
          <div className="col-md-7">
            <form onSubmit={handleSubmit}>
              <div className="mb-2">
                <input
                  type="text"
                  id="nomeCompleto"
                  className="form-control custom-input"
                  placeholder="Nome completo"
                  value={formData.nomeCompleto}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-2">
                <input
                  type="text"
                  id="cnpj"
                  className="form-control custom-input"
                  placeholder="CNPJ"
                  value={formData.cnpj}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-2">
                <input
                  type="email"
                  id="email"
                  className="form-control custom-input"
                  placeholder="E-mail"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-2">
                <input
                  type="text"
                  id="nomeEmpresa"
                  className="form-control custom-input"
                  placeholder="Nome da empresa"
                  value={formData.nomeEmpresa}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-2">
                <input
                  type="text"
                  id="razaoSocial"
                  className="form-control custom-input"
                  placeholder="Razão social"
                  value={formData.razaoSocial}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-2">
                <input
                  type="password"
                  id="senha"
                  className="form-control custom-input"
                  placeholder="Senha"
                  value={formData.senha}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <input
                  type="password"
                  id="confirmarSenha"
                  className="form-control custom-input"
                  placeholder="Confirmar senha"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="termos"
                  checked={formData.termos}
                  onChange={handleChange}
                  required
                />

                <label
                  className="form-check-label text-secondary"
                  htmlFor="termos"
                >
                  Li e aceito os{' '}
                  <Link
                    to="/termos"
                    className="text-success fw-bold text-decoration-none"
                  >
                    Termos de Uso e Política de Privacidade
                  </Link>
                </label>
              </div>

              <div className="d-grid gap-2">
                <button
                  type="submit"
                  className="btn btn-dark btn-lg shadow-sm w-100"
                  style={{ borderRadius: '12px' }}
                  disabled={carregando}
                >
                  {carregando ? 'Cadastrando...' : 'Criar Conta'}
                </button>
              </div>

              <div className="text-center mt-3">
                <span className="text-muted fs-6">
                  Já possui uma conta?{' '}
                </span>
                <Link
                  to="/login"
                  className="text-dark fw-bold text-decoration-none"
                >
                  Faça Login
                </Link>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}