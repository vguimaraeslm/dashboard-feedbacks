import { useState, useEffect, useMemo } from 'react';
import { Alert, Row, Col, Card, Form, Button, Table, Badge, Nav } from 'react-bootstrap';
import { FaLayerGroup, FaExclamationCircle, FaCalendarAlt, FaCog, FaChartArea, FaListOl, FaChartPie, FaChartLine, FaVideo, FaTable } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, CartesianGrid, ComposedChart, Line } from 'recharts';
import FeedbacksTable, { type Feedback } from './FeedbacksTable';
import { parseISO, format } from 'date-fns';

// --- DEFINIÇÃO DA SIDEBAR (INTERNA E SIMPLIFICADA) ---
// Removemos "React.FC" para evitar erro de importação
interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const InternalSidebar = ({ activePage, onNavigate }: SidebarProps) => {
  const navItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: <FaChartLine className="me-2" /> },
    { id: 'analytics', label: 'Performance', icon: <FaChartPie className="me-2" /> },
    { id: 'feedbacks', label: 'Base de Dados', icon: <FaTable className="me-2" /> },
    { id: 'settings', label: 'Configurações', icon: <FaCog className="me-2" /> },
  ];

  return (
    <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark" style={{ width: '250px', minHeight: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 1000 }}>
      <div className="d-flex align-items-center mb-4 mb-md-0 me-md-auto text-white text-decoration-none">
        <div className="bg-primary rounded p-1 me-2">
            <FaVideo className="text-white" />
        </div>
        <span className="fs-5 fw-bold">Frame.io Dash</span>
      </div>
      <hr className="border-secondary" />
      <Nav variant="pills" className="flex-column mb-auto gap-2">
        {navItems.map((item) => (
          <Nav.Item key={item.id}>
            <Nav.Link 
              href="#" 
              active={activePage === item.id}
              onClick={() => onNavigate(item.id)}
              className={`d-flex align-items-center text-white ${activePage === item.id ? 'bg-primary shadow' : 'hover-bg-secondary'}`}
            >
              {item.icon} {item.label}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>
    </div>
  );
};

// --- DEFINIÇÃO DOS TIPOS DO APP ---
interface ProjectStats {
    marca: string;
    tema: string;
    versoes: number;
    alteracoes: number;
    topicos: string[];
}

// --- APLICAÇÃO PRINCIPAL ---
function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const [filterMarca, setFilterMarca] = useState('Todas');
  const [filterPeriodo] = useState('30'); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/feedbacks');
        if (!response.ok) throw new Error('Erro na API');
        const data = await response.json();
        // @ts-ignore
        setFeedbacks(data || []);
      } catch (error) {
        console.warn("Usando dados de teste.");
        setUsingMockData(true);
        setFeedbacks([
            { id: 1, created_at: '2026-01-10', marca: 'Coca-Cola', formato: '16:9', tema: 'Verão', versao: 'V1', autor: 'Agência', comentario_original: 'Mudar cor', resumo_ia: '-', categoria_topico: '["Cor"]', categoria_acao: 'Correção', status: 'Revisão', sentimento: 'Negativo', arquivo_video: 'coca_v1.mp4' },
            { id: 2, created_at: '2026-01-10', marca: 'Coca-Cola', formato: '16:9', tema: 'Verão', versao: 'V1', autor: 'Agência', comentario_original: 'Aumentar logo', resumo_ia: '-', categoria_topico: '["Marca"]', categoria_acao: 'Correção', status: 'Revisão', sentimento: 'Neutro', arquivo_video: 'coca_v1.mp4' },
            { id: 3, created_at: '2026-01-12', marca: 'Coca-Cola', formato: '16:9', tema: 'Verão', versao: 'V2', autor: 'Agência', comentario_original: 'Ainda escuro', resumo_ia: '-', categoria_topico: '["Cor"]', categoria_acao: 'Correção', status: 'Revisão', sentimento: 'Negativo', arquivo_video: 'coca_v2.mp4' },
            { id: 4, created_at: '2026-01-14', marca: 'Coca-Cola', formato: '16:9', tema: 'Verão', versao: 'V3', autor: 'Agência', comentario_original: 'Ok', resumo_ia: '-', categoria_topico: '["Geral"]', categoria_acao: 'Aprovação', status: 'Resolvido', sentimento: 'Positivo', arquivo_video: 'coca_v3.mp4' },
            { id: 5, created_at: '2026-01-14', marca: 'Nubank', formato: '9:16', tema: 'App', versao: 'V1', autor: 'In-house', comentario_original: 'Ok', resumo_ia: '-', categoria_topico: '["Geral"]', categoria_acao: 'Aprovação', status: 'Resolvido', sentimento: 'Positivo', arquivo_video: 'nu.mp4' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const analytics = useMemo(() => {
    if (!feedbacks || feedbacks.length === 0) {
        return { 
            totalProjetos: 0, 
            avgVersoesGeral: 0, 
            totalAlteracoes: 0,
            chartVersoesData: [], 
            chartTopicosData: [], 
            chartTimelineData: [], 
            projectsTable: [],
            topRetrabalhoName: '-' 
        };
    }

    try {
        const filtered = feedbacks.filter(f => filterMarca === 'Todas' || f.marca === filterMarca);
        const projetosMap = new Map();
        
        filtered.forEach(f => {
            if (!f.marca) return;
            const temaSafe = f.tema || f.arquivo_video || 'Geral';
            const key = `${f.marca}-${temaSafe}`;
            
            if (!projetosMap.has(key)) {
                projetosMap.set(key, { marca: f.marca, tema: temaSafe, versoesSet: new Set(), alteracoesCount: 0, maxVersaoNum: 0 });
            }
            const proj = projetosMap.get(key);
            const versaoRaw = f.versao || 'V1';
            proj.versoesSet.add(versaoRaw);
            proj.alteracoesCount += 1; 
            const vNum = parseInt(versaoRaw.replace(/\D/g, '') || '0');
            if (vNum > proj.maxVersaoNum) proj.maxVersaoNum = vNum;
        });

        const projetos = Array.from(projetosMap.values()) as any[];
        const totalProjetos = projetos.length;
        const totalVersoesAcumuladas = projetos.reduce((acc, p) => acc + (p.maxVersaoNum || 1), 0);
        const avgVersoesGeral = totalProjetos > 0 ? (totalVersoesAcumuladas / totalProjetos).toFixed(1) : 0;
        const totalAlteracoes = filtered.length;

        const projectsTable: ProjectStats[] = projetos.map(p => ({
            marca: p.marca,
            tema: p.tema,
            versoes: p.maxVersaoNum || 1, 
            alteracoes: p.alteracoesCount,
            topicos: [] 
        })).sort((a, b) => b.versoes - a.versoes); 

        const versoesPorMarca: any = {};
        projetos.forEach((p: any) => {
            if (!versoesPorMarca[p.marca]) versoesPorMarca[p.marca] = { totalVersoes: 0, count: 0 };
            versoesPorMarca[p.marca].totalVersoes += (p.maxVersaoNum || 1);
            versoesPorMarca[p.marca].count += 1;
        });

        const chartVersoesData = Object.keys(versoesPorMarca).map(m => ({
            name: m,
            media: Number((versoesPorMarca[m].totalVersoes / versoesPorMarca[m].count).toFixed(1)),
        }));

        const topicosPorMarca: any = {};
        filtered.forEach(f => {
            if (f.status === 'Revisão' || f.status === 'Pendente') {
                const cleanTopic = f.categoria_topico ? f.categoria_topico.replace(/[\[\]"]/g, '') : 'Outros';
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
                if (f.created_at) {
                    const date = format(parseISO(f.created_at), 'dd/MM');
                    if (!timeline[date]) timeline[date] = 0;
                    timeline[date] += 1;
                }
            } catch (e) {}
        });
        const chartTimelineData = Object.keys(timeline).sort().map(d => ({ date: d, volume: timeline[d] }));

        return { 
            totalProjetos, avgVersoesGeral, totalAlteracoes,
            chartVersoesData, chartTopicosData, chartTimelineData, projectsTable,
            topRetrabalhoName: projectsTable[0]?.marca || '-'
        };
    } catch (err) {
        return { totalProjetos: 0, avgVersoesGeral: 0, totalAlteracoes: 0, chartVersoesData: [], chartTopicosData: [], chartTimelineData: [], projectsTable: [], topRetrabalhoName: 'Erro' };
    }
  }, [feedbacks, filterMarca]);

  const uniqueMarcas = Array.from(new Set(feedbacks.map(f => f.marca || 'Unknown'))).sort();

  return (
    <div className="d-flex">
      {/* SIDEBAR INTERNA */}
      <InternalSidebar activePage={activePage} onNavigate={setActivePage} />

      <div className="flex-grow-1 bg-light" style={{ marginLeft: '250px', minHeight: '100vh' }}>
        
        <header className="bg-white shadow-sm py-3 px-4 d-flex justify-content-between align-items-center sticky-top">
            <div>
                <h5 className="m-0 fw-bold text-dark">
                    {activePage === 'dashboard' ? 'Visão Geral' : activePage === 'analytics' ? 'Performance & Eficiência' : activePage === 'feedbacks' ? 'Banco de Dados' : 'Configurações'}
                </h5>
                <small className="text-muted">
                    {activePage === 'analytics' ? 'Análise detalhada de retrabalho e esforço por projeto' : 'Monitoramento de produção criativa'}
                </small>
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

            {loading ? (
                <div className="d-flex flex-column align-items-center justify-content-center py-5">
                    <div className="spinner-border text-primary mb-3" role="status"></div>
                    <span className="text-muted">Processando Dados...</span>
                </div>
            ) : (
                <>
                {activePage === 'dashboard' && (
                    <>
                        <Row className="g-3 mb-4">
                            <Col md={4}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Body>
                                        <small className="text-muted text-uppercase fw-bold">Projetos Entregues</small>
                                        <h2 className="fw-bold mb-0">{analytics.totalProjetos}</h2>
                                        <small className="text-success">Vídeos únicos processados</small>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={4}>
                                <Card className="border-0 shadow-sm h-100 border-start border-4 border-warning">
                                    <Card.Body>
                                        <small className="text-muted text-uppercase fw-bold">Média de Versões</small>
                                        <h2 className="fw-bold mb-0 text-warning">{analytics.avgVersoesGeral}</h2>
                                        <small className="text-muted">Versões p/ aprovar um vídeo</small>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={4}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Body>
                                        <small className="text-muted text-uppercase fw-bold">Volume de Interações</small>
                                        <h2 className="fw-bold mb-0">{analytics.totalAlteracoes}</h2>
                                        <small className="text-muted">Comentários processados</small>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body style={{height: 300}}>
                                <h6 className="fw-bold mb-3 px-2">Fluxo de Entrada de Feedbacks</h6>
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={analytics.chartTimelineData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="date" tick={{fontSize: 12}} />
                                        <YAxis />
                                        <RechartsTooltip />
                                        <Line type="monotone" dataKey="volume" stroke="#0d6efd" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </Card.Body>
                        </Card>
                    </>
                )}
                {activePage === 'analytics' && (
                    <>
                        <Row className="mb-4">
                             <Col md={12}>
                                <Alert variant="light" className="border shadow-sm d-flex align-items-center">
                                    <FaChartArea className="text-primary fs-4 me-3" />
                                    <div>
                                        <strong>Análise de Esforço:</strong>
                                        <div className="small text-muted">
                                            A marca <strong>{analytics.topRetrabalhoName}</strong> lidera o ranking de refações. 
                                        </div>
                                    </div>
                                </Alert>
                             </Col>
                        </Row>
                        <Row className="g-3 mb-4">
                            <Col lg={6}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Header className="bg-white fw-bold border-0 pt-4 px-4">
                                        <FaLayerGroup className="me-2 text-warning"/>
                                        Média de Versões por Marca
                                    </Card.Header>
                                    <Card.Body style={{ height: 300 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={analytics.chartVersoesData} layout="vertical" margin={{left: 20}}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                                <XAxis type="number" domain={[0, 'auto']} hide />
                                                <YAxis dataKey="name" type="category" width={90} tick={{fontSize: 12, fontWeight: 'bold'}} />
                                                <RechartsTooltip />
                                                <Bar dataKey="media" name="Média Versões" fill="#ffc107" radius={[0, 4, 4, 0]} barSize={25} label={{ position: 'right', fill: '#666' }} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col lg={6}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Header className="bg-white fw-bold border-0 pt-4 px-4">
                                        <FaExclamationCircle className="me-2 text-danger"/>
                                        Categorias de Ajuste Solicitados
                                    </Card.Header>
                                    <Card.Body style={{ height: 300 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={analytics.chartTopicosData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" tick={{fontSize: 12}} />
                                                <YAxis />
                                                <RechartsTooltip />
                                                <Legend />
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
                            <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                                <h6 className="fw-bold m-0"><FaListOl className="me-2"/> Detalhamento por Projeto (Vídeo)</h6>
                                <Badge bg="secondary">{analytics.projectsTable.length} Projetos</Badge>
                            </Card.Header>
                            <Card.Body className="p-0 table-responsive">
                                <Table hover className="mb-0 align-middle">
                                    <thead className="bg-light text-muted small">
                                        <tr>
                                            <th className="ps-4">Marca</th>
                                            <th>Nome do Vídeo / Tema</th>
                                            <th className="text-center">Versões Geradas</th>
                                            <th className="text-center">Total Alterações</th>
                                            <th className="text-center">Média Alterações/Versão</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analytics.projectsTable.map((proj, idx) => (
                                            <tr key={idx}>
                                                <td className="ps-4 fw-bold text-primary">{proj.marca}</td>
                                                <td>{proj.tema}</td>
                                                <td className="text-center">
                                                    <Badge bg={proj.versoes > 2 ? 'danger' : 'success'} pill className="px-3">
                                                        V{proj.versoes}
                                                    </Badge>
                                                </td>
                                                <td className="text-center fw-bold">{proj.alteracoes}</td>
                                                <td className="text-center text-muted">
                                                    {(proj.alteracoes / proj.versoes).toFixed(1)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
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