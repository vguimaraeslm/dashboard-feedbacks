import { useState, useEffect, useMemo } from 'react';
import { Spinner, Alert, Row, Col, Card, Form } from 'react-bootstrap';
import { FaCheckCircle, FaExclamationTriangle, FaChartLine, FaFilter, FaVideo } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import FeedbacksTable, { type Feedback } from './FeedbacksTable';
import DashboardLayout from './components/DashboardLayout';

function App() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  
  // Filtros (Essencial para UX de decisão)
  const [filterMarca, setFilterMarca] = useState('Todas');
  const [filterStatus, setFilterStatus] = useState('Todos');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/feedbacks');
        if (!response.ok) throw new Error('Erro na API');
        const data = await response.json();
        // @ts-ignore
        setFeedbacks(data);
      } catch (error) {
        console.warn("Usando dados de teste.");
        setUsingMockData(true);
        // Dados de teste robustos para visualização
        setFeedbacks([
            { id: 1, created_at: '2026-01-15', marca: 'Coca-Cola', formato: '16:9', tema: 'Verão', versao: 'V1', autor: 'Agência A', comentario_original: 'Ajustar cor', resumo_ia: 'Problema de color grading', categoria_topico: '["Imagem"]', categoria_acao: 'Correção', status: 'Revisão', sentimento: 'Negativo', arquivo_video: 'coca.mp4' },
            { id: 2, created_at: '2026-01-14', marca: 'Nubank', formato: '9:16', tema: 'Promo', versao: 'V2', autor: 'In-house', comentario_original: 'Ok', resumo_ia: 'Aprovado sem ressalvas', categoria_topico: '["Geral"]', categoria_acao: 'Aprovação', status: 'Resolvido', sentimento: 'Positivo', arquivo_video: 'nu.mp4' },
            { id: 3, created_at: '2026-01-14', marca: 'Coca-Cola', formato: '16:9', tema: 'Institucional', versao: 'V1', autor: 'Agência A', comentario_original: 'Som baixo', resumo_ia: 'Audio desbalanceado', categoria_topico: '["Audio"]', categoria_acao: 'Ajuste', status: 'Pendente', sentimento: 'Neutro', arquivo_video: 'coca_inst.mp4' },
            { id: 4, created_at: '2026-01-13', marca: 'Fiat', formato: '1:1', tema: 'Varejo', versao: 'V3', autor: 'Agência B', comentario_original: 'Texto errado', resumo_ia: 'Erro de lettering', categoria_topico: '["Texto"]', categoria_acao: 'Correção', status: 'Revisão', sentimento: 'Negativo', arquivo_video: 'fiat.mp4' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Lógica de Filtragem (Processamento no Frontend para rapidez)
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter(f => {
      const matchMarca = filterMarca === 'Todas' || f.marca === filterMarca;
      const matchStatus = filterStatus === 'Todos' || f.status === filterStatus;
      return matchMarca && matchStatus;
    });
  }, [feedbacks, filterMarca, filterStatus]);

  // Cálculos para os Gráficos (Analytics)
  const stats = useMemo(() => {
    const total = filteredFeedbacks.length;
    const aprovados = filteredFeedbacks.filter(f => f.status?.toLowerCase().includes('resolvido') || f.status?.toLowerCase().includes('aprovado')).length;
    const revisao = filteredFeedbacks.filter(f => f.status?.toLowerCase().includes('revisão')).length;
    
    // Dados para gráfico de Sentimento
    const sentimentData = [
      { name: 'Positivo', value: filteredFeedbacks.filter(f => f.sentimento?.toLowerCase().includes('positivo')).length, color: '#198754' },
      { name: 'Neutro', value: filteredFeedbacks.filter(f => f.sentimento?.toLowerCase().includes('neutro')).length, color: '#ffc107' },
      { name: 'Negativo', value: filteredFeedbacks.filter(f => f.sentimento?.toLowerCase().includes('negativo')).length, color: '#dc3545' },
    ].filter(d => d.value > 0);

    // Dados para gráfico de Marcas (Top 5)
    const marcasCount = filteredFeedbacks.reduce((acc: any, curr) => {
      acc[curr.marca] = (acc[curr.marca] || 0) + 1;
      return acc;
    }, {});
    const marcasData = Object.keys(marcasCount).map(key => ({ name: key, value: marcasCount[key] })).slice(0, 5);

    return { total, aprovados, revisao, sentimentData, marcasData };
  }, [filteredFeedbacks]);

  // Lista única de marcas para o filtro
  const uniqueMarcas = Array.from(new Set(feedbacks.map(f => f.marca))).sort();

  return (
    <DashboardLayout>
      {usingMockData && (
        <Alert variant="warning" className="mb-4 py-2 small shadow-sm border-0">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <strong>Ambiente de Demonstração:</strong> Exibindo dados simulados. Conecte ao banco D1 para ver dados reais.
        </Alert>
      )}

      {/* 1. SEÇÃO DE FILTROS INTELIGENTES */}
      <Card className="border-0 shadow-sm mb-4 bg-white">
        <Card.Body className="py-3">
          <Row className="align-items-center g-3">
            <Col xs="auto" className="text-muted"><FaFilter className="me-1"/> Filtrar por:</Col>
            <Col md={3}>
              <Form.Select size="sm" value={filterMarca} onChange={(e) => setFilterMarca(e.target.value)} className="border-light bg-light fw-bold text-dark">
                <option value="Todas">Todas as Marcas</option>
                {uniqueMarcas.map(m => <option key={m} value={m}>{m}</option>)}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select size="sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border-light bg-light fw-bold text-dark">
                <option value="Todos">Todos os Status</option>
                <option value="Resolvido">Resolvido / Aprovado</option>
                <option value="Revisão">Em Revisão</option>
                <option value="Pendente">Pendente</option>
              </Form.Select>
            </Col>
            <Col className="text-end text-muted small">
              Exibindo <strong>{filteredFeedbacks.length}</strong> de {feedbacks.length} registros
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* 2. KPIs ESTRATÉGICOS (Topo - Padrão de leitura F) */}
      <Row className="mb-4 g-3">
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100 overflow-hidden">
            <Card.Body className="position-relative">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted text-uppercase mb-1 small fw-bold" style={{letterSpacing: '1px'}}>Volume Total</p>
                  <h2 className="display-6 fw-bold mb-0 text-dark">{stats.total}</h2>
                  <small className="text-success"><FaChartLine/> +12% vs mês anterior</small>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                  <FaVideo size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted text-uppercase mb-1 small fw-bold" style={{letterSpacing: '1px'}}>Taxa de Aprovação</p>
                  <h2 className="display-6 fw-bold mb-0 text-success">
                    {stats.total > 0 ? Math.round((stats.aprovados / stats.total) * 100) : 0}%
                  </h2>
                  <small className="text-muted">{stats.aprovados} vídeos aprovados</small>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success">
                  <FaCheckCircle size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted text-uppercase mb-1 small fw-bold" style={{letterSpacing: '1px'}}>Pontos de Atenção</p>
                  <h2 className="display-6 fw-bold mb-0 text-danger">{stats.revisao}</h2>
                  <small className="text-muted">Vídeos aguardando correção</small>
                </div>
                <div className="bg-danger bg-opacity-10 p-3 rounded-circle text-danger">
                  <FaExclamationTriangle size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 3. GRÁFICOS ANALÍTICOS (Visualização de Dados) */}
      <Row className="mb-4 g-3">
        <Col lg={8}>
            <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white py-3 border-bottom-0">
                    <h6 className="fw-bold m-0">Volume por Marca</h6>
                </Card.Header>
                <Card.Body style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.marcasData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                            <RechartsTooltip cursor={{fill: 'transparent'}} />
                            <Bar dataKey="value" fill="#0d6efd" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card.Body>
            </Card>
        </Col>
        <Col lg={4}>
            <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white py-3 border-bottom-0">
                    <h6 className="fw-bold m-0">Análise de Sentimento</h6>
                </Card.Header>
                <Card.Body style={{ height: '300px' }} className="d-flex flex-column justify-content-center align-items-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={stats.sentimentData} 
                                cx="50%" cy="50%" 
                                innerRadius={60} 
                                outerRadius={80} 
                                paddingAngle={5} 
                                dataKey="value"
                            >
                                {stats.sentimentData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <RechartsTooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="d-flex justify-content-center gap-3 small mt-2">
                        {stats.sentimentData.map((item, idx) => (
                            <div key={idx} className="d-flex align-items-center">
                                <span className="d-inline-block rounded-circle me-1" style={{width: 10, height: 10, backgroundColor: item.color}}></span>
                                {item.name}
                            </div>
                        ))}
                    </div>
                </Card.Body>
            </Card>
        </Col>
      </Row>

      {/* 4. TABELA DETALHADA */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <FeedbacksTable feedbacks={filteredFeedbacks} />
      )}
    </DashboardLayout>
  );
}

export default App;