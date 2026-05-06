// ── Controle do formulário de Funcionários ────────────────────

(function () {
  const btnNovo      = document.getElementById('btn-novo-funcionario');
  const formSection  = document.getElementById('form-funcionario');
  const btnCancelar  = document.getElementById('btn-cancelar-form');
  const form         = document.getElementById('form-func');
  const tituloModo   = document.getElementById('form-funcionario__modo-titulo');
  const btnStatusForm = document.getElementById('btn-status-func');
  let linhaEmEdicao  = null;

  // Abre/fecha o formulário
  function abrirFormulario(modoEdicao = false) {
    formSection.hidden = false;
    btnNovo.setAttribute('aria-expanded', 'true');
    tituloModo.textContent = modoEdicao ? 'Editar Funcionário' : 'Novo Funcionário';

    // Campos de senha só aparecem no cadastro novo
    const grupoSenha = document.getElementById('grupo-senha');
    const grupoConfirma = document.getElementById('grupo-confirma-senha');
    grupoSenha.hidden = modoEdicao;
    grupoConfirma.hidden = modoEdicao;

    formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    if (modoEdicao && linhaEmEdicao) {
      const statusBadge = linhaEmEdicao.cells[5].querySelector('.badge'); // Busca diretamente na coluna de Status
      const isAtivo = statusBadge.classList.contains('badge--ativo');
      if (isAtivo) {
        btnStatusForm.textContent = 'Inativar Funcionário';
        btnStatusForm.className = 'btn-perigo';
      } else {
        btnStatusForm.textContent = 'Ativar Funcionário';
        btnStatusForm.className = 'btn-primario';
      }
      btnStatusForm.hidden = false;
    }
  }

  function fecharFormulario() {
    formSection.hidden = true;
    btnNovo.setAttribute('aria-expanded', 'false');
    form.reset();
    linhaEmEdicao = null;
    btnStatusForm.hidden = true;
  }

  btnNovo.addEventListener('click', () => abrirFormulario(false));
  btnCancelar.addEventListener('click', fecharFormulario);

  // Delegação de eventos da tabela (Expandir e Editar)
  const tableBody = document.getElementById('tabela-funcionarios-corpo');
  if (tableBody) {
    tableBody.addEventListener('click', (e) => {
      const target = e.target;
      const action = target.dataset.action;
      
      if (action === 'edit') {
        linhaEmEdicao = target.closest('tr');
        
        // Simulando preenchimento: pega o Nome, CPF e Cargo da tabela
        document.getElementById('func-nome').value = linhaEmEdicao.cells[1].textContent;
        document.getElementById('func-cpf').value = linhaEmEdicao.cells[2].textContent;
        document.getElementById('func-cargo').value = linhaEmEdicao.cells[3].textContent;
        
        abrirFormulario(true);
      } else if (action === 'expand') {
        const isExpanded = target.getAttribute('aria-expanded') === 'true';
        target.setAttribute('aria-expanded', !isExpanded);
        const mainRow = target.closest('tr');
        const detailsRow = mainRow.nextElementSibling;
        if (detailsRow && detailsRow.classList.contains('linha-detalhes')) {
          detailsRow.hidden = isExpanded;
        }
      }
    });
  }

  // Alterna o status do funcionário pelo botão no formulário
  btnStatusForm.addEventListener('click', () => {
    if (!linhaEmEdicao) return;
    const statusBadge = linhaEmEdicao.cells[5].querySelector('.badge'); // Busca diretamente na coluna de Status
    const isAtivo = statusBadge.classList.contains('badge--ativo');
    
    if (isAtivo && confirm('Tem certeza que deseja inativar este funcionário?')) {
      statusBadge.textContent = 'Inativo';
      statusBadge.className = 'badge badge--inativo';
      btnStatusForm.textContent = 'Ativar Funcionário';
      btnStatusForm.className = 'btn-primario';
    } else if (!isAtivo) {
      statusBadge.textContent = 'Ativo';
      statusBadge.className = 'badge badge--ativo';
      btnStatusForm.textContent = 'Inativar Funcionário';
      btnStatusForm.className = 'btn-perigo';
    }
  });

  // Submissão do formulário
  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const nome  = document.getElementById('func-nome').value.trim();
    const cpf   = document.getElementById('func-cpf').value.trim();
    const cargo = document.getElementById('func-cargo').value.trim();
    const telefone = document.getElementById('func-telefone').value.trim();
    const perfil = document.getElementById('func-perfil').value;
    const login = document.getElementById('func-login').value.trim();
    const senha = document.getElementById('func-senha').value;
    const confirma = document.getElementById('func-confirma-senha').value;

    if (!nome || !cpf || !login) {
      alert('Nome, CPF e Login são obrigatórios.');
      return;
    }

    const regexCpf = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!regexCpf.test(cpf)) {
      alert('CPF inválido. Use o formato 000.000.000-00.');
      return;
    }

    if (!document.getElementById('grupo-senha').hidden) {
      if (senha.length < 8) {
        alert('A senha deve ter pelo menos 8 caracteres.');
        return;
      }
      if (senha !== confirma) {
        alert('As senhas não coincidem.');
        return;
      }
    }

    if (linhaEmEdicao) {
        alert('Funcionário atualizado com sucesso!');
        fecharFormulario();
        return;
    }

    // Grava no Back-end via API
    mockFuncionarios.unshift({
        nome, cpf, cargo, perfil, status: 'Ativo', login, telefone, senha
    });
    
    try {
      await fetch('/api/db', {
        method: 'POST',
        headers: window.getAuthHeaders(),
        body: JSON.stringify({ funcionarios: mockFuncionarios })
      });
      alert('Funcionário cadastrado com sucesso e salvo no banco de dados!');
    } catch (e) {
      alert('Erro ao salvar no banco de dados.');
      console.error(e);
    }

    fecharFormulario();
    renderTabelaFuncionarios();
  });

  // Máscaras
  document.getElementById('func-cpf').addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 9)      v = v.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
    else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    else if (v.length > 3) v = v.replace(/(\d{3})(\d+)/, '$1.$2');
    e.target.value = v;
  });

  document.getElementById('func-telefone').addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 10)     v = v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    else if (v.length > 6) v = v.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
    else if (v.length > 2) v = v.replace(/(\d{2})(\d+)/, '($1) $2');
    e.target.value = v;
  });

  // ── DADOS DO BACKEND (API) ──────────────────────
  let mockFuncionarios = [];

  const carregarFuncionarios = async () => {
    try {
      const resp = await fetch('/api/db');
      if (resp.ok) {
        const data = await resp.json();
        mockFuncionarios = data.funcionarios || [];
        renderTabelaFuncionarios();
      }
    } catch (e) {
      console.error("Erro ao carregar dados do backend", e);
    }
  };

  const renderTabelaFuncionarios = () => {
    const tBody = document.getElementById('tabela-funcionarios-corpo');
    if (!tBody) return;
    tBody.innerHTML = '';
    mockFuncionarios.forEach(func => {
      const isAtivo = func.status === "Ativo";
      let classBadge = 'badge--atendente';
      let nomePerfil = 'Atendente';
      if(func.perfil === 'administrador') { classBadge = 'badge--ativo'; nomePerfil = 'Administrador'; }
      else if (func.perfil === 'farmaceutico') { classBadge = 'badge--farmac'; nomePerfil = 'Farmacêutico'; }

      const trMain = document.createElement('tr');
      trMain.innerHTML = `
        <td style="text-align: center;"><button class="btn-expandir" data-action="expand" aria-expanded="false" aria-label="Ver detalhes">▼</button></td>
        <td>${escapeHtml(func.nome)}</td>
        <td>${escapeHtml(func.cpf)}</td>
        <td>${escapeHtml(func.cargo)}</td>
        <td><span class="badge ${classBadge}">${escapeHtml(nomePerfil)}</span></td>
        <td><span class="badge ${isAtivo ? 'badge--ativo' : 'badge--inativo'}">${escapeHtml(func.status)}</span></td>
        <td>
          <div class="func-tabela__acoes">
            <button class="btn-secundario" data-action="edit" aria-label="Editar ${escapeHtml(func.nome)}">Editar</button>
          </div>
        </td>
      `;
      const trDetails = document.createElement('tr');
      trDetails.className = 'linha-detalhes';
      trDetails.hidden = true;
      trDetails.innerHTML = `
        <td colspan="7">
          <div class="detalhes-conteudo">
            <p><strong>Login:</strong> ${escapeHtml(func.login)}</p>
            <p><strong>Telefone:</strong> ${escapeHtml(func.telefone)}</p>
          </div>
        </td>
      `;
      tBody.appendChild(trMain);
      tBody.appendChild(trDetails);
    });
  };

  // Carrega ao iniciar o script
  carregarFuncionarios();
})();