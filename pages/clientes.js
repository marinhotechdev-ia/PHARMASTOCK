// Lógica da página de Clientes

(function () {
  // ── Elementos do DOM ─────────────────────────────────────────────────
  const btnNovoCliente = document.getElementById('btn-novo-cliente');
  const formSection = document.getElementById('form-cliente');
  const btnCancelar = document.getElementById('btn-cancelar-form');
  const form = document.getElementById('form-cli');
  const formTitle = document.getElementById('form-cliente__modo-titulo');
  const inputCpf = document.getElementById('cli-cpf');
  const searchInput = document.getElementById('filtro-clientes');
  const tableBody = document.getElementById('tabela-clientes-corpo');
  const btnStatusForm = document.getElementById('btn-status-cliente');
  let linhaEmEdicao = null; // Armazena a linha que está sendo editada

  // ── Funções ──────────────────────────────────────────────────────────

  /** Mostra ou esconde o formulário de cadastro/edição */
  const toggleForm = (show = false) => {
    if (show) {
      formSection.hidden = false;
      btnNovoCliente.setAttribute('aria-expanded', 'true');
    } else {
      formSection.hidden = true;
      btnNovoCliente.setAttribute('aria-expanded', 'false');
      form.reset();
      linhaEmEdicao = null;
      btnStatusForm.hidden = true;
      formTitle.textContent = 'Novo Cliente';
      inputCpf.readOnly = false; // Garante que o CPF seja editável para novos clientes
    }
  };

  /** Preenche o formulário para edição (simulação) */
  const preencherFormularioParaEdicao = (row) => {
    linhaEmEdicao = row;
    formTitle.textContent = 'Editar Cliente';
    // Em uma aplicação real, os dados viriam do backend. Aqui, usamos dados da tabela.
    const nome = row.cells[1].textContent; // Mudou para 1 devido à nova coluna do botão ▼
    const cpf = row.cells[2].textContent;
    const telefone = row.cells[3].textContent;

    // Configura o botão de Inativar/Ativar no formulário
    const statusBadge = row.querySelector('.badge');
    const isAtivo = statusBadge.classList.contains('badge--ativo');
    if (isAtivo) {
      btnStatusForm.textContent = 'Inativar Cliente';
      btnStatusForm.className = 'btn-perigo';
    } else {
      btnStatusForm.textContent = 'Ativar Cliente';
      btnStatusForm.className = 'btn-primario';
    }
    btnStatusForm.hidden = false;

    document.getElementById('cli-nome').value = nome;
    document.getElementById('cli-cpf').value = cpf;
    document.getElementById('cli-cpf').readOnly = true; // RF-C02: CPF não pode ser alterado
    document.getElementById('cli-telefone').value = telefone;
    // Outros campos seriam preenchidos aqui

    toggleForm(true);
    formSection.scrollIntoView({ behavior: 'smooth' });
  };

  /** Alterna o status do cliente diretamente pelo botão dentro do formulário */
  const alternarStatusCliente = () => {
    if (!linhaEmEdicao) return;

    const statusBadge = linhaEmEdicao.querySelector('.badge');
    const clientName = linhaEmEdicao.cells[1].textContent;
    const isAtivo = statusBadge.classList.contains('badge--ativo');

    if (isAtivo) {
      if (confirm(`Tem certeza que deseja inativar o cliente ${clientName}?`)) {
        statusBadge.textContent = 'Inativo';
        statusBadge.className = 'badge badge--inativo';
        btnStatusForm.textContent = 'Ativar Cliente';
        btnStatusForm.className = 'btn-primario';
      }
    } else {
      statusBadge.textContent = 'Ativo';
      statusBadge.className = 'badge badge--ativo';
      btnStatusForm.textContent = 'Inativar Cliente';
      btnStatusForm.className = 'btn-perigo';
    }
  };

  /** Vincula os eventos de clique e input aos elementos da página. */
  const vincularEventos = () => {
    // Botão para abrir o formulário de novo cliente
    if (btnNovoCliente) {
      btnNovoCliente.addEventListener('click', () => toggleForm(formSection.hidden));
    }

    // Botão para cancelar e fechar o formulário
    if (btnCancelar) {
      btnCancelar.addEventListener('click', () => toggleForm(false));
    }

    // Botão de alterar status dentro do formulário
    if (btnStatusForm) {
      btnStatusForm.addEventListener('click', alternarStatusCliente);
    }

    // Submissão do formulário
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nome = document.getElementById('cli-nome').value.trim();
        const cpf = document.getElementById('cli-cpf').value.trim();
        const telefone = document.getElementById('cli-telefone').value.trim();
        const email = document.getElementById('cli-email').value.trim();
        const nascimento = document.getElementById('cli-nascimento').value.trim();
        const endereco = document.getElementById('cli-endereco').value.trim();
        const uso = document.getElementById('cli-uso').value.trim() || 'Nenhum';
        
        if (linhaEmEdicao) {
            alert('Cliente atualizado com sucesso!');
        } else {
            mockClientes.unshift({
                nome, cpf, telefone, email, nascimento, endereco, uso, status: 'Ativo'
            });
            
            try {
              await fetch('/api/db', {
                method: 'POST',
                headers: window.getAuthHeaders(),
                body: JSON.stringify({ clientes: mockClientes })
              });
              alert('Cliente salvo no banco de dados!');
            } catch(err) {
              console.error(err);
            }
        }
        toggleForm(false);
        renderTabelaClientes();
      });
    }

    // Delegação de eventos na tabela para botões de Ação
    if (tableBody) {
      tableBody.addEventListener('click', (e) => {
        const target = e.target;
        const action = target.dataset.action;

        if (action === 'edit') { // RF-C02
          preencherFormularioParaEdicao(target.closest('tr'));
        } else if (action === 'expand') { // Alterna a visibilidade da linha de detalhes
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

    // RF-C03: Filtro de busca por Nome ou CPF
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = tableBody.querySelectorAll('tr');

        for (let i = 0; i < rows.length; i += 2) { // Pula de 2 em 2 (linha principal + detalhes)
          const mainRow = rows[i];
          const name = mainRow.cells[1].textContent.toLowerCase();
          const cpf = mainRow.cells[2].textContent.toLowerCase();
          const isVisible = name.includes(searchTerm) || cpf.includes(searchTerm);
          mainRow.style.display = isVisible ? '' : 'none';
        }
      });
    }
  };

  // ── DADOS DO BACKEND (API) ───────────────────────────────────────
  let mockClientes = [];

  const carregarClientes = async () => {
    try {
      const resp = await fetch('/api/db');
      if (resp.ok) {
        const data = await resp.json();
        mockClientes = data.clientes || [];
        renderTabelaClientes();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const renderTabelaClientes = () => {
    if (!tableBody) return;
    tableBody.innerHTML = '';
    mockClientes.forEach(cli => {
      const isAtivo = cli.status === "Ativo";
      const trMain = document.createElement('tr');
      trMain.innerHTML = `
        <td style="text-align: center;"><button class="btn-expandir" data-action="expand" aria-expanded="false" aria-label="Ver detalhes">▼</button></td>
        <td>${escapeHtml(cli.nome)}</td>
        <td>${escapeHtml(cli.cpf)}</td>
        <td>${escapeHtml(cli.telefone)}</td>
        <td><span class="badge ${isAtivo ? 'badge--ativo' : 'badge--inativo'}">${escapeHtml(cli.status)}</span></td>
        <td>
          <div class="cli-tabela__acoes">
            <button class="btn-secundario" data-action="edit" aria-label="Editar ${escapeHtml(cli.nome)}">Editar</button>
          </div>
        </td>
      `;
      const trDetails = document.createElement('tr');
      trDetails.className = 'linha-detalhes';
      trDetails.hidden = true;
      trDetails.innerHTML = `
        <td colspan="6">
          <div class="detalhes-conteudo">
            <p><strong>E-mail:</strong> ${escapeHtml(cli.email)}</p>
            <p><strong>Data de Nasc:</strong> ${escapeHtml(cli.nascimento)}</p>
            <p><strong>Endereço:</strong> ${escapeHtml(cli.endereco)}</p>
            <p><strong>Uso Contínuo:</strong> ${escapeHtml(cli.uso)}</p>
          </div>
        </td>
      `;
      tableBody.appendChild(trMain);
      tableBody.appendChild(trDetails);
    });
  };

  // Inicia o módulo
  vincularEventos();
  carregarClientes();
})();