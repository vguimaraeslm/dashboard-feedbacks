import React from 'react';
import { Nav } from 'react-bootstrap';
import { FaChartLine, FaTable, FaVideo, FaCog, FaChartPie } from 'react-icons/fa';

// Aqui definimos que o Sidebar aceita receber qual página está ativa
interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: <FaChartLine className="me-2" /> },
    { id: 'analytics', label: 'Performance', icon: <FaChartPie className="me-2" /> },
    { id: 'feedbacks', label: 'Base de Dados', icon: <FaTable className="me-2" /> },
    { id: 'settings', label: 'Configurações', icon: <FaCog className="me-2" /> },
  ];

  return (
    <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark" style={{ width: '250px', minHeight: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 1000 }}>
      <a href="#" className="d-flex align-items-center mb-4 mb-md-0 me-md-auto text-white text-decoration-none">
        <div className="bg-primary rounded p-1 me-2">
            <FaVideo className="text-white" />
        </div>
        <span className="fs-5 fw-bold">Frame.io Dash</span>
      </a>
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
      <hr className="border-secondary" />
      <div className="dropdown">
        <div className="d-flex align-items-center text-white text-decoration-none px-2">
          <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: 32, height: 32}}>
            <strong>AD</strong>
          </div>
          <small>Admin User</small>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;