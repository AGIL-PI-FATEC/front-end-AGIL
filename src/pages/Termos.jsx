import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Termos() {
    const navigate = useNavigate();

    const handleAceitar = () => {
        sessionStorage.setItem('agil_termos_aceitos', 'true');
        navigate('/cadastro');
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-4 px-3">
            <div className="card shadow-sm border-0 w-100" style={{ maxWidth: '800px', borderRadius: '12px', overflow: 'hidden' }}>
                
                {/* Cabeçalho */}
                <div
                    className="card-header text-white fw-bold py-3 px-4 d-flex align-items-center gap-2"
                    style={{ backgroundColor: '#1B7A56' }}
                >
                    <i className="bi bi-file-earmark-text"></i>
                    <span>Termos de Uso e Política de Privacidade — Sistema AGIL</span>
                </div>

            
                <div className="card-body p-4 text-secondary" style={{ maxHeight: '65vh', overflowY: 'auto', fontSize: '0.92rem' }}>
                    <p className="small text-muted mb-3">
                        <strong>Última atualização:</strong> Novembro de 2026
                    </p>

                    <p>
                        Bem-vindo(a) ao <strong className="text-dark">AGIL</strong>, plataforma de gestão e controle de estoque hospitalar. Ao criar sua conta e utilizar nossos serviços, você concorda integralmente com os termos descritos abaixo.
                    </p>

                    <h6 className="fw-bold text-dark mt-4">1. Objeto e Finalidade do Sistema</h6>
                    <p>
                        O <strong className="text-dark">AGIL</strong> é uma ferramenta destinada ao gerenciamento operacional de insumos, materiais médicos e suprimentos hospitalares, permitindo o cadastro de produtos, controle de entradas e saídas, monitoramento de níveis de estoque em caixas/unidades e gerenciamento de equipe.
                    </p>

                    <h6 className="fw-bold text-dark mt-4">2. Cadastro e Responsabilidade pela Conta</h6>
                    <ul>
                        <li className="mb-1">
                            <strong className="text-dark">Veracidade das Informações:</strong> O usuário compromete-se a fornecer dados verdadeiros, completos e atualizados no momento do cadastro.
                        </li>
                        <li className="mb-1">
                            <strong className="text-dark">Sigilo de Acesso:</strong> As credenciais de login (e-mail e senha) são pessoais e intransferíveis. O titular da conta é integralmente responsável por todas as movimentações, edições ou exclusões realizadas sob seu acesso.
                        </li>
                        <li className="mb-1">
                            <strong className="text-dark">Níveis de Permissão:</strong> Gestores são responsáveis por gerenciar o acesso dos funcionários vinculados à sua unidade ou instituição de saúde.
                        </li>
                    </ul>

                    <h6 className="fw-bold text-dark mt-4">3. Uso Adequado e Integridade dos Dados</h6>
                    <ul>
                        <li className="mb-1">
                            O usuário concorda em utilizar o <strong className="text-dark">AGIL</strong> exclusivamente para fins lícitos de gestão logística e hospitalar.
                        </li>
                        <li className="mb-1">
                            O <strong className="text-dark">AGIL</strong> atua como ferramenta de apoio ao controle de estoque, não substituindo protocolos clínicos, auditorias sanitárias obrigatórias (como normas da ANVISA) ou a conferência física periódica dos insumos médicos.
                        </li>
                        <li className="mb-1">
                            É proibida qualquer tentativa de explorar falhas, realizar engenharia reversa ou comprometer a disponibilidade e segurança da plataforma.
                        </li>
                    </ul>

                    <h6 className="fw-bold text-dark mt-4">4. Privacidade e Proteção de Dados (LGPD)</h6>
                    <ul>
                        <li className="mb-1">
                            Os dados pessoais fornecidos no cadastro e os registros operacionais inseridos na plataforma são tratados em conformidade com a <strong className="text-dark">Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</strong>.
                        </li>
                        <li className="mb-1">
                            As informações cadastrais são utilizadas unicamente para autenticação, funcionamento das funcionalidades do sistema e comunicação de suporte ou alertas operacionais.
                        </li>
                        <li className="mb-1">
                            O <strong className="text-dark">AGIL</strong> não comercializa nem compartilha dados de estoque ou informações institucionais com terceiros sem autorização expressa.
                        </li>
                    </ul>

                    <h6 className="fw-bold text-dark mt-4">5. Disponibilidade e Atualizações</h6>
                    <p>
                        O sistema passa por melhorias contínuas para aprimorar a experiência de gestão. Eventuais manutenções programadas ou atualizações de recursos poderão ocorrer visando maior estabilidade e segurança.
                    </p>

                    <h6 className="fw-bold text-dark mt-4">6. Aceite</h6>
                    <p className="mb-0">
                        Ao marcar a caixa de confirmação e concluir o seu cadastro, você declara que leu, compreendeu e concorda com estes <strong className="text-dark">Termos de Uso e Política de Privacidade</strong>.
                    </p>
                </div>

                {/* Rodapé com botões */}
                <div className="card-footer bg-white d-flex justify-content-between align-items-center p-3">
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => navigate('/cadastro')}
                    >
                        Voltar
                    </button>

                    <button
                        type="button"
                        className="btn text-white fw-semibold px-4"
                        style={{ backgroundColor: '#1B7A56' }}
                        onClick={handleAceitar}
                    >
                        Aceitar Termo de Uso
                    </button>
                </div>

            </div>
        </div>
    );
}