import React from 'react';
import { Table, Badge, Card, Button } from 'react-bootstrap';
import { FaFileVideo, FaRobot, FaSearch } from 'react-icons/fa';

// (Mantenha a interface Feedback igual estava antes, ou copie daqui)
export interface Feedback {
  id: number;
  created_at: string;
  marca: string;
  formato: string;
  tema: string;
  versao: string;
  autor: string;
  comentario_original: string;
  resumo_ia: string;
  categoria_topico: string;
  categoria_acao: string;
  status: string;
  sentimento: string;
  arquivo_video: string;
}

interface FeedbacksTableProps {
  feedbacks: Feedback[];
}

const FeedbacksTable: React.FC<FeedbacksTableProps> = ({ feedbacks }) => {
  
  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('resolvido') || s.includes('aprovado')) return 'success';
    if (s.includes('pendente')) return 'warning';
    if (s.includes('revisão')) return 'danger';
    return 'secondary';
  };

  const getSentimentEmoji = (sentiment: string) => {
    const s = sentiment?.toLowerCase() || '';
    if (s.includes('positivo')) return '😊';
    if (s.includes('negativo')) return '😟';
    return '😐';
  };

  // Função para limpar o JSON das categorias
  const formatCategory = (cat: string) => {
      if (!cat) return '-';
      return cat.replace(/[\[\]"]/g, '').replace(/,/g, ', ');
  };

  return (
    <Card className="border-0 shadow-sm rounded-3">
      <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
        <div>
            <h5 className="mb-0 fw-bold text-dark">Base de Feedbacks</h5>
            <small className="text-muted">Monitoramento em tempo real do Frame.io</small>
        </div>
        <div className="d-flex gap-2">
            <Button variant="light" size="sm" className="border"><FaSearch className="text-muted"/></Button>
            <Button variant="primary" size="sm">+ Novo Filtro</Button>
        </div>
      </Card.Header>
      <Card.Body className="p-0 table-responsive">
        <Table hover className="mb-0 align-middle text-nowrap" style={{ fontSize: '0.9rem' }}>
          <thead className="bg-light text-uppercase text-muted" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
            <tr>
              <th className="ps-4 py-3">Marca / Vídeo</th>
              <th>Status</th>
              <th>IA Insights</th>
              <th>Categorias</th>
              <th>Autor</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-5 text-muted">
                  Nenhum feedback encontrado.
                </td>
              </tr>
            ) : (
              feedbacks.map((item) => (
                <tr key={item.id}>
                  {/* Coluna Marca e Vídeo Combinados */}
                  <td className="ps-4">
                    <div className="d-flex align-items-center">
                        <div className="bg-light rounded p-2 me-3 text-primary">
                            <FaFileVideo size={20} />
                        </div>
                        <div>
                            <div className="fw-bold text-dark">{item.marca}</div>
                            <div className="small text-muted">{item.tema} <span className="badge bg-light text-dark border ms-1">{item.versao}</span></div>
                        </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td>
                    <Badge bg={getStatusColor(item.status)} className="px-3 py-2 rounded-pill fw-normal">
                      {item.status}
                    </Badge>
                  </td>

                  {/* Resumo IA */}
                  <td style={{ maxWidth: '300px', whiteSpace: 'normal' }}>
                    <div className="d-flex align-items-start">
                        <FaRobot className="text-info me-2 mt-1" />
                        <div>
                            <div className="text-dark small mb-1">{item.resumo_ia}</div>
                            <div className="text-muted x-small" style={{fontSize: '0.75rem'}}>
                                Sentimento: {getSentimentEmoji(item.sentimento)} {item.sentimento}
                            </div>
                        </div>
                    </div>
                  </td>

                  {/* Categorias */}
                  <td>
                    <div className="d-flex flex-column gap-1">
                        <span className="badge bg-light text-secondary border text-start fw-normal">
                            {formatCategory(item.categoria_topico)}
                        </span>
                        <span className="badge bg-light text-secondary border text-start fw-normal">
                            Ação: {item.categoria_acao}
                        </span>
                    </div>
                  </td>

                  {/* Autor e Comentário */}
                  <td>
                    <div className="fw-bold text-dark" style={{fontSize: '0.85rem'}}>{item.autor || 'Desconhecido'}</div>
                    <div className="text-muted text-truncate small" style={{maxWidth: '150px'}} title={item.comentario_original}>
                        "{item.comentario_original}"
                    </div>
                  </td>

                  {/* Data */}
                  <td className="text-muted small">
                    {new Date(item.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card.Body>
      <Card.Footer className="bg-white border-top py-3 text-end">
        <small className="text-muted me-3">Mostrando {feedbacks.length} resultados</small>
        {/* Paginação Fake para visual */}
        <Button variant="outline-secondary" size="sm" disabled className="me-1">Anterior</Button>
        <Button variant="outline-secondary" size="sm" disabled>Próxima</Button>
      </Card.Footer>
    </Card>
  );
};

export default FeedbacksTable;