// Sidebar HTML template - inject into pages
function renderSidebar() {
  const user = getUser() || {};
  return `
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-logo">🔬</div>
      <div class="sidebar-title">
        <h2>LabSystem</h2>
        <span>Análises Clínicas</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <span class="nav-section-title">Principal</span>
      <div class="nav-item" data-page="dashboard">
        <span class="nav-item-icon">📊</span>
        <span>Dashboard</span>
      </div>

      <span class="nav-section-title">Atendimento</span>
      <div class="nav-item" data-page="requisicoes">
        <span class="nav-item-icon">📋</span>
        <span>Requisições</span>
      </div>
      <div class="nav-item" data-page="pacientes">
        <span class="nav-item-icon">👥</span>
        <span>Pacientes</span>
      </div>
      <div class="nav-item" data-page="laudos">
        <span class="nav-item-icon">📄</span>
        <span>Laudos</span>
      </div>

      <span class="nav-section-title">Configuração</span>
      <div class="nav-item" data-page="exames">
        <span class="nav-item-icon">🧪</span>
        <span>Catálogo de Exames</span>
      </div>
      <div class="nav-item" data-page="profissionais">
        <span class="nav-item-icon">👨‍⚕️</span>
        <span>Profissionais</span>
      </div>
      <div class="nav-item" data-page="convenios">
        <span class="nav-item-icon">🏥</span>
        <span>Convênios</span>
      </div>

      <span class="nav-section-title">Gestão</span>
      <div class="nav-item" data-page="relatorios">
        <span class="nav-item-icon">📈</span>
        <span>Relatórios</span>
      </div>
      <div class="nav-item" data-page="usuarios" data-role="admin">
        <span class="nav-item-icon">🔑</span>
        <span>Usuários</span>
      </div>
      <div class="nav-item" data-page="lgpd">
        <span class="nav-item-icon">🛡️</span>
        <span>LGPD & Privacidade</span>
      </div>
    </nav>

    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar" id="userAvatar">A</div>
        <div class="user-details">
          <div class="user-name" id="userName">Usuário</div>
          <div class="user-role" id="userRole">Papel</div>
        </div>
        <button class="btn-logout" onclick="logout()" title="Sair">🚪</button>
      </div>
    </div>
  </aside>`;
}

function renderTopbar(title, subtitle = '') {
  return `
  <header class="topbar">
    <div class="topbar-left">
      <div>
        <div class="topbar-title">${title}</div>
        ${subtitle ? `<div class="topbar-subtitle">${subtitle}</div>` : ''}
      </div>
    </div>
    <div class="topbar-right">
      <div class="topbar-time" id="topbarTime"></div>
      <span style="font-size:0.85rem; color:var(--text-secondary);">Olá, <strong id="topbarUser"></strong></span>
    </div>
  </header>`;
}
