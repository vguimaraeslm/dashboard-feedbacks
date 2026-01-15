import { useState, useEffect } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
import FeedbacksTable, { type Feedback } from './FeedbacksTable';

function App() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);

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
        // Mock data atualizado com as novas colunas para não quebrar a tela
        setFeedbacks([
          { 
            id: 1, 
            created_at: '2026-01-15',
            marca: 'Teste Local', 
            formato: '16:9',
            tema: 'Teste',
            versao: 'V1',
            autor: 'Dev',
            comentario_original: 'Isso é um teste local',
            resumo_ia: 'Dados locais (API inacessível)', 
            categoria_topico: 'Teste',
            categoria_acao: 'Ajuste',
            status: 'Pendente', 
            sentimento: 'Neutro', 
            arquivo_video: 'teste.mp4' 
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-light min-vh-100 py-4">
      <Container fluid="xxl"> {/* Usei 'fluid' para dar mais espaço lateral */}
        <h2 className="mb-4 fw-bold text-dark text-center">
          📊 Monitoramento de Feedbacks
        </h2>

        {usingMockData && (
          <Alert variant="info" className="text-center shadow-sm mx-auto" style={{maxWidth: '600px'}}>
            <i className="bi bi-info-circle me-2"></i>
            Modo Local: Visualizando dados de teste.
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <FeedbacksTable feedbacks={feedbacks} />
        )}
      </Container>
    </div>
  );
}

export default App; 