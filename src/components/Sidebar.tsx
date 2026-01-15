import { Nav } from 'react-bootstrap';
import { FaHome, FaTable, FaChartPie, FaCog, FaVideo } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark" style={{ width: '250px', minHeight: '100vh', position: 'fixed', left: 0, top: 0 }}>
      <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
        <FaVideo className="me-2 fs-4 text-primary" />
        <span className="fs-4 fw-bold">Frame.io Dash</span>
      </a>
      <hr />
      <Nav variant="pills" className="flex-column mb-auto">
        <Nav.Item>
          <Nav.Link href="#" active className="d-flex align-items-center mb-2">
            <FaHome className="me-2" /> Visão Geral
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link href="#" className="text-white d-flex align-items-center mb-2">
            <FaTable className="me-2" /> Feedbacks
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link href="#" className="text-white d-flex align-items-center mb-2">
            <FaChartPie className="me-2" /> Relatórios
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link href="#" className="text-white d-flex align-items-center mb-2">
            <FaCog className="me-2" /> Configurações
          </Nav.Link>
        </Nav.Item>
      </Nav>
      <hr />
      <div className="dropdown">
        <a href="#" className="d-flex align-items-center text-white text-decoration-none">
          <img src="https://github.com/mdo.png" alt="" width="32" height="32" className="rounded-circle me-2" />
          <strong>Admin</strong>
        </a>
      </div>
    </div>
  );
};

export default Sidebar;