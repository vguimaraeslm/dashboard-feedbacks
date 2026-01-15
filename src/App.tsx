import { useState, useEffect } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
import FeedbacksTable, { type Feedback } from './FeedbacksTable';

function App() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    // Função para buscar dados
    const fetchData = async () => {
      try {
        const response = await fetch('/api/feedbacks');
        
        if (!response.ok) {
          throw new Error('Erro na API');
        }

        const data = await response.json();
        // @ts-ignore
        setFeedbacks(data);
      } catch (error) {
        console.warn("Rodando localmente ou API offline. Usando dados de teste.");
        setUsingMockData(true);
        // Dados de teste (Fallback)
        setFeedbacks([
          { id: 101, marca: 'Local Test', resumo_ia: 'Dados locais (API inacessível)', status: 'Pendente', sentimento: 'Neutro', arquivo_video: 'teste_local.mp4' },
          { id: 102, marca: 'Coca-Cola', resumo_ia: 'O vídeo está com a iluminação escura.', status: 'Revisão', sentimento: 'Negativo', arquivo_video: 'campanha_verao.mp4' },
          { id: 103, marca: 'Nubank', resumo_ia: 'Tudo certo, aprovado.', status: 'Aprovado', sentimento: 'Positivo', arquivo_video: 'promo_roxinho.mov' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-light min-vh-100 py-5">
      <Container>
        <h2 className="mb-4 fw-bold text-dark text-center">
          📊 Monitoramento de Feedbacks
        </h2>

        {usingMockData && (
          <Alert variant="info" className="text-center shadow-sm">
            <i className="bi bi-info-circle me-2"></i>
            Você está visualizando <strong>dados de teste</strong> (Modo Local). No servidor, serão os dados reais.
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Carregando...</span>
            </Spinner>
            <p className="mt-2 text-muted">Carregando dados...</p>
          </div>
        ) : (
          <FeedbacksTable feedbacks={feedbacks} />
        )}
      </Container>
    </div>
  );
}

export default App;