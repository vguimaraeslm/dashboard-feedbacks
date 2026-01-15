import React from 'react';
import { Table, Badge, Card } from 'react-bootstrap';

// Aqui definimos o "formato" dos dados para o TypeScript não reclamar
export interface Feedback {
  id: number;
  marca: string;
  resumo_ia: string;
  status: string;
  sentimento: string;
  arquivo_video: string;
}

interface FeedbacksTableProps {
  feedbacks: Feedback[];
}

const FeedbacksTable: React.FC<FeedbacksTableProps> = ({ feedbacks }) => {
  
  // Função que escolhe a cor do badge baseada no texto do status
  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('aprovado')) return 'success'; // Verde
    if (s.includes('pendente')) return 'warning'; // Amarelo
    if (s.includes('revisão') || s.includes('revisao')) return 'danger'; // Vermelho
    return 'secondary'; // Cinza (padrão)
  };

  return (
    <Card className="shadow-sm">
      <Card.Header as="h5" className="bg-white py-3">
        📋 Últimos Feedbacks do Frame.io
      </Card.Header>
      <Card.Body className="p-0">
        <Table responsive hover className="mb-0 align-middle">
          <thead className="bg-light">
            <tr>
              <th className="ps-4">Marca</th>
              <th>Resumo IA</th>
              <th>Status</th>
              <th>Sentimento</th>
              <th>Arquivo</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-5 text-muted">
                  Nenhum feedback encontrado.
                </td>
              </tr>
            ) : (
              feedbacks.map((item) => (
                <tr key={item.id}>
                  <td className="ps-4 fw-bold text-primary">{item.marca}</td>
                  <td style={{ maxWidth: '300px' }} className="text-truncate" title={item.resumo_ia}>
                    {item.resumo_ia}
                  </td>
                  <td>
                    <Badge bg={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </td>
                  <td>{item.sentimento}</td>
                  <td className="text-muted small">
                    <i className="bi bi-file-earmark-play me-1"></i>
                    {item.arquivo_video}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default FeedbacksTable;