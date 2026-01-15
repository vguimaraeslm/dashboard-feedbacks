import React from 'react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="d-flex">
      {/* Sidebar Fixa */}
      <Sidebar />
      
      {/* Área de Conteúdo (empurrada para a direita) */}
      <div className="flex-grow-1 bg-light" style={{ marginLeft: '250px', minHeight: '100vh' }}>
        {/* Topbar Simples */}
        <header className="bg-white shadow-sm py-3 px-4 d-flex justify-content-between align-items-center">
          <h5 className="m-0 text-muted">Dashboard / Feedbacks</h5>
          <button className="btn btn-outline-primary btn-sm">Atualizar Dados</button>
        </header>

        {/* Conteúdo da Página */}
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;