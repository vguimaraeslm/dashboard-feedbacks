import React from 'react';
import { Table, Badge, Card } from 'react-bootstrap';

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
    return 'secondary';
  };

  // Limpa caracteres extras do JSON de categorias (ex: ["Roteiro"] -> Roteiro)
  const formatCategory = (cat: string) => {
    if (!cat) return '-';
    return cat.replace(/[\[\]"]/g, '').replace(/,/g, ', ');
  };

  return (
    <Card className="shadow-sm">
      <Card.Header as="h5" className="bg-white py-3">
        📋 Base de Feedbacks Completa
      </Card.Header>
      <Card.Body className="p-0 table-responsive">
        <Table hover className="mb-0 align-middle small text-nowrap">
          <thead className="bg-light">
            <tr>
              <th className="ps-3">Data</th>
              <th>Marca</th>
              <th>Formato</th>
              <th>Tema</th>
              <th>Ver.</th>
              <th>Status</th>
              <th>Sentimento</th>
              <th>Categoria</th>
              <th>Ação</th>
              <th>Resumo IA</th>
              <th>Comentário Original</th>
              <th>Autor</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.length === 0 ? (
              <tr>
                <td colSpan={12} className="text-center py-5 text-muted">
                  Nenhum feedback encontrado.
                </td>
              </tr>
            ) : (
              feedbacks.map((item) => (
                <tr key={item.id}>
                  <td className="ps-3 text-muted">
                    {new Date(item.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="fw-bold text-primary">{item.marca}</td>
                  <td>{item.formato || '-'}</td>
                  <td>{item.tema || '-'}</td>
                  <td><Badge bg="light" text="dark" className="border">{item.versao}</Badge></td>
                  <td>
                    <Badge bg={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </td>
                  <td>{item.sentimento}</td>
                  <td>{formatCategory(item.categoria_topico)}</td>
                  <td>{item.categoria_acao}</td>
                  <td style={{ maxWidth: '200px' }} className="text-truncate" title={item.resumo_ia}>
                    {item.resumo_ia}
                  </td>
                  <td style={{ maxWidth: '200px' }} className="text-truncate text-muted fst-italic" title={item.comentario_original}>
                    "{item.comentario_original}"
                  </td>
                  <td>{item.autor || '-'}</td>
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