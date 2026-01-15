import { useState, useEffect, useMemo } from 'react';
import { Alert, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { FaLayerGroup, FaExclamationCircle, FaCalendarAlt, FaCog } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, CartesianGrid, ComposedChart, Line } from 'recharts';
import FeedbacksTable, { type Feedback } from './FeedbacksTable';
import Sidebar from './components/Sidebar';
import { parseISO, format } from 'date-fns';

function App() {
  // --- ESTADOS ---
  const [activePage, setActivePage] = useState('dashboard');
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);

  // --- FILTROS GLOBAIS ---
  const [filterMarca, setFilterMarca] = useState('Todas');
  // Mantemos o estado do período, mesmo que fixo por enquanto, para expansão futura
  const [filterPeriodo] = useState('30'); 

  // --- BUSCA DE DADOS ---
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
        setFeedbacks([
            { id: 1, created_at: '2026-01-15', marca: 'Coca-Cola', formato: '16:9', tema: 'Verão', versao: 'V1', autor: 'Agência A', comentario_original: '-', resumo_ia: '-', categoria_topico: '["Cor"]', categoria_acao: 'Correção', status: 'Revisão', sentimento: 'Negativo', arquivo_video: 'video1.mp4' },
            { id: 2, created_at: '2026-01-15', marca: 'Coca-Cola', formato: '16:9', tema: 'Verão', versao: 'V2', autor: 'Agência A', comentario_original: '-', resumo_ia: '-', categoria_topico: '["Cor"]', categoria_acao: 'Aprovação', status: 'Resolvido', sentimento: 'Positivo', arquivo_video: 'video1_v2.mp4' },
            { id: 3, created_at: '2026-01-14', marca: 'Nubank', formato: '9:16', tema: 'App', versao: 'V1', autor: 'In-house', comentario_original: '-', resumo_ia: '-', categoria_topico: '["Roteiro"]', categoria_acao: 'Aprovação', status: 'Resolvido', sentimento: 'Positivo', arquivo_video: 'nu.mp4' },
            { id: 4, created_at: '2026-01-10', marca: 'Fiat', formato: '1:1', tema: 'Oferta', versao: 'V1', autor: 'Agência B', comentario_original: '-', resumo_ia: '-', categoria_topico: '["Texto"]', categoria_acao: 'Correção', status: 'Revisão', sentimento: 'Neutro', arquivo_video: 'fiat.mp4' },
            { id: 5, created_at: '2026-01-12', marca: 'Fiat', formato: '1:1', tema: 'Oferta', versao: 'V2', autor: 'Agência B', comentario_original: '-', resumo_ia: '-', categoria_topico: '["Texto"]', categoria_acao: 'Correção', status: 'Revisão', sentimento: 'Negativo', arquivo_video: 'fiat_v2.mp4' },
            { id: 6, created_at: '2026-01-14', marca: 'Fiat', formato: '1:1', tema: 'Oferta', versao: 'V3', autor: 'Agência B', comentario_original: '-', resumo_ia: '-', categoria_topico: '["Geral"]', categoria_acao: 'Aprovação', status: 'Resolvido', sentimento: 'Positivo', arquivo_video: 'fiat_v3.mp4' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- MOTOR DE ANÁLISE DE DADOS (BI) ---
  const analytics = useMemo(() => {
    const filtered = feedbacks.filter(f => filterMarca === 'Todas' || f.marca === filterMarca);
    
    const projetosMap = new Map();
    
    filtered.forEach(f => {
        const key = `${f.marca}-${f.tema}`;
        if (!projetosMap.has(key)) {
            projetosMap.set(key, { marca: f.marca, versoes: new Set(), statusFinal: 'Em Andamento', maxVersao: 0 });
        }
        const proj = projetosMap.get(key);
        proj.versoes.add(f.versao);
        
        const vNum = parseInt(f.versao?.replace(/\D/g, '') || '0');
        if (vNum > proj.maxVersao) proj.maxVersao = vNum;
        
        if (f.status === 'Resolvido') proj.statusFinal = 'Aprovado';
    });

    const projetos = Array.from(projetosMap.values());
    
    const versoesPorMarca: any = {};
    projetos.forEach((p: any) => {
        if (!versoesPorMarca[p.marca]) versoesPorMarca[p.marca] = { totalVersoes: 0, count: 0 };
        versoesPorMarca[p.marca].totalVersoes += p.maxVersao || 1;
        versoesPorMarca[p.marca].count += 1;
    });

    const chartVersoesData = Object.keys(versoesPorMarca).map(m => ({
        name: m,
        media: (versoesPorMarca[m].totalVersoes / versoesPorMarca[m].count).toFixed(1),
        projetos: versoesPorMarca[m].count
    }));

    const topicosPorMarca: any = {};
    filtered.forEach(f => {
        if (f.status === 'Revisão' || f.status === 'Pendente') {
            const cleanTopic = f.categoria_topico?.replace(/[\[\]"]/g, '') || 'Outros';
            if (!topicosPorMarca[cleanTopic]) topicosPorMarca[cleanTopic] = {};
            if (!topicosPorMarca[cleanTopic][f.marca]) topicosPorMarca[cleanTopic][f.marca] = 0;
            topicosPorMarca[cleanTopic][f.marca] += 1;
        }
    });

    const chartTopicosData = Object.keys(topicosPorMarca).map(topic => {
        const obj: any = { name: topic };
        Object.keys(topicosPorMarca[topic]).forEach(marca => {
            obj[marca] = topicosPorMarca[topic][marca];
        });
        return obj;
    });

    const timeline: any = {};
    filtered.forEach(f => {
        try {
            const date = format(parseISO(f.created_at), 'dd/MM');
            if (!timeline[date]) timeline[date] = 0;
            timeline[date] += 1;
        } catch (e) {}
    });
    const chartTimelineData = Object.keys(timeline).sort().map(d => ({ date: d, volume: timeline[d] }));

    return { 
        totalProjetos: projetos.length,
        projetosAprovados: projetos.filter((p:any) => p.statusFinal === 'Aprovado').length,
        chartVersoesData,
        chartTopicosData,
        chartTimelineData
    };

  }, [feedbacks, filterMarca]);

  const uniqueMarcas = Array.from(new Set(feedbacks.map(f => f.marca))).sort();

  return (
    <div className="d-flex">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <div className="flex-grow-1 bg-light" style={{ marginLeft: '250px', minHeight: '100vh' }}>
        
        <header className="bg-white shadow-sm py-3 px-4 d-flex justify-content-between align-items-center sticky-top">
            <div>
                <h5 className="m-0 fw-bold text-dark">
                    {activePage === 'dashboard' ? 'Dashboard Executivo' : activePage === 'feedbacks' ? 'Gerenciador de Dados' : 'Configurações'}
                </h5>
                <small className="text-muted">Análise estratégica de produção criativa</small>
            </div>
            <div className="d-flex gap-2">
                <Form.Select size="sm" value={filterMarca} onChange={(e) => setFilterMarca(e.target.value)} className="fw-bold border-primary text-primary" style={{width: '200px'}}>
                    <option value="Todas">Todas as Marcas</option>
                    {uniqueMarcas.map(m => <option key={m} value={m}>{m}</option>)}
                </Form.Select>
                <Button variant="outline-secondary" size="sm"><FaCalendarAlt/> {filterPeriodo} dias</Button>
            </div>
        </header>

        <main className="p-4">
            {usingMockData && (
                <Alert variant="warning" className="py-2 small shadow-sm border-0 mb-4">
                <FaExclamationCircle className="me-2"/> Modo de Demonstração: Exibindo dados simulados.
                </Alert>
            )}

            {/* LOADER GLOBAL */}
            {loading ? (
                <div className="d-flex flex-column align-items-center justify-content-center py-5">
                    <div className="spinner-border text-primary mb-3" role="status"></div>
                    <span className="text-muted">Processando Inteligência...</span>
                </div>
            ) : (
                <>
                {activePage === 'dashboard' && (
                    <>
                        <Row className="g-3 mb-4">
                            <Col md={3}>
                                <Card className="border-0 shadow-sm h-100 border-start border-4 border-primary">
                                    <Card.Body>
                                        <small className="text-muted text-uppercase fw-bold">Projetos Ativos</small>
                                        <h2 className="fw-bold mb-0">{analytics.totalProjetos}</h2>
                                        <small className="text-muted">Demandas únicas (Tema)</small>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card className="border-0 shadow-sm h-100 border-start border-4 border-success">
                                    <Card.Body>
                                        <small className="text-muted text-uppercase fw-bold">Taxa de Aprovação</small>
                                        <h2 className="fw-bold mb-0 text-success">
                                            {analytics.totalProjetos > 0 ? Math.round((analytics.projetosAprovados / analytics.totalProjetos) * 100) : 0}%
                                        </h2>
                                        <small className="text-muted">Projetos finalizados</small>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={6}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Body className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <h6 className="fw-bold text-primary mb-1">Dica de Eficiência</h6>
                                            <p className="small text-muted mb-0 m-0">
                                                A marca com maior retrabalho é <strong>{analytics.chartVersoesData.sort((a:any,b:any) => b.media - a.media)[0]?.name || '-'}</strong>.
                                                Verifique os tópicos de "Correção" abaixo.
                                            </p>
                                        </div>
                                        <FaLayerGroup size={30} className="text-primary opacity-25"/>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        <Row className="g-3 mb-4">
                            <Col lg={6}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Header className="bg-white fw-bold border-0 pt-4 px-4">
                                        <FaLayerGroup className="me-2 text-warning"/>
                                        Média de Versões até Aprovação
                                        <div className="small text-muted fw-normal">Mede o esforço da equipe por marca (Menor é melhor)</div>
                                    </Card.Header>
                                    <Card.Body style={{ height: 300 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={analytics.chartVersoesData} layout="vertical" margin={{left: 20}}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                                <XAxis type="number" domain={[0, 'auto']} hide />
                                                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12, fontWeight: 'bold'}} />
                                                <RechartsTooltip cursor={{fill: '#f8f9fa'}} />
                                                <Bar dataKey="media" name="Média de Versões" fill="#ffc107" radius={[0, 4, 4, 0]} barSize={25} label={{ position: 'right', fill: '#666' }} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col lg={6}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Header className="bg-white fw-bold border-0 pt-4 px-4">
                                        <FaExclamationCircle className="me-2 text-danger"/>
                                        Principais Motivos de Refação
                                        <div className="small text-muted fw-normal">O que está travando as aprovações?</div>
                                    </Card.Header>
                                    <Card.Body style={{ height: 300 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={analytics.chartTopicosData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" tick={{fontSize: 12}} />
                                                <YAxis />
                                                <RechartsTooltip />
                                                <Legend wrapperStyle={{fontSize: '12px', paddingTop: '10px'}}/>
                                                {uniqueMarcas.map((marca, index) => (
                                                    <Bar key={marca} dataKey={marca} stackId="a" fill={`hsl(${index * 60}, 70%, 50%)`} barSize={40} />
                                                ))}
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                        
                        <Card className="border-0 shadow-sm">
                            <Card.Body style={{height: 250}}>
                                <h6 className="fw-bold mb-3">Volume de Feedbacks (Timeline)</h6>
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={analytics.chartTimelineData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="date" tick={{fontSize: 12}} />
                                        <YAxis hide />
                                        <RechartsTooltip />
                                        <Line type="monotone" dataKey="volume" stroke="#0d6efd" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </Card.Body>
                        </Card>
                    </>
                )}

                {activePage === 'feedbacks' && (
                    <FeedbacksTable feedbacks={feedbacks.filter(f => filterMarca === 'Todas' || f.marca === filterMarca)} />
                )}

                {activePage === 'settings' && (
                    <div className="text-center py-5 text-muted">
                        <FaCog size={40} className="mb-3"/>
                        <h4>Configurações</h4>
                        <p>Funcionalidade em desenvolvimento.</p>
                    </div>
                )}
                </>
            )}
        </main>
      </div>
    </div>
  );
}

export default App;