// Lógica da página de Fornecedores

(function () {
  // ── Elementos do DOM ─────────────────────────────────────────────────
  const btnNovoFornecedor = document.getElementById('btn-novo-fornecedor');
  const formSection = document.getElementById('form-fornecedor');
  const btnCancelar = document.getElementById('btn-cancelar-form');
  const form = document.getElementById('form-forn');
  const formTitle = document.getElementById('form-fornecedor__modo-titulo');
  const inputCnpj = document.getElementById('forn-cnpj');
  const searchInput = document.getElementById('filtro-fornecedores');
  const tableBody = document.getElementById('tabela-fornecedores-corpo');
  const btnStatusForm = document.getElementById('btn-status-fornecedor');
  let linhaEmEdicao = null;

  // ── Funções ──────────────────────────────────────────────────────────

  const toggleForm = (show = false) => {
    if (show) {
      formSection.hidden = false;
      btnNovoFornecedor.setAttribute('aria-expanded', 'true');
    } else {
      formSection.hidden = true;
      btnNovoFornecedor.setAttribute('aria-expanded', 'false');
      form.reset();
      linhaEmEdicao = null;
      btnStatusForm.hidden = true;
      formTitle.textContent = 'Novo Fornecedor';
      inputCnpj.readOnly = false; // Permite edição no novo cadastro
    }
  };

  const preencherFormularioParaEdicao = (row) => {
    linhaEmEdicao = row;
    formTitle.textContent = 'Editar Fornecedor';
    
    // Puxando dados básicos da tabela principal
    const nomeFantasia = row.cells[1].textContent;
    const cnpj = row.cells[2].textContent;
    const telefone = row.cells[3].textContent;

    // Configura botão Inativar/Ativar
    const statusBadge = row.cells[4].querySelector('.badge');
    const isAtivo = statusBadge.classList.contains('badge--ativo');
    if (isAtivo) {
      btnStatusForm.textContent = 'Inativar Fornecedor';
      btnStatusForm.className = 'btn-perigo';
    } else {
      btnStatusForm.textContent = 'Ativar Fornecedor';
      btnStatusForm.className = 'btn-primario';
    }
    btnStatusForm.hidden = false;

    document.getElementById('forn-fantasia').value = nomeFantasia;
    document.getElementById('forn-cnpj').value = cnpj;
    document.getElementById('forn-cnpj').readOnly = true; // RF-E01 (Único)
    document.getElementById('forn-telefone').value = telefone;

    // Puxando dados complementares da linha de detalhes (simulando retorno do BD)
    const detailsRow = row.nextElementSibling;
    if (detailsRow && detailsRow.classList.contains('linha-detalhes')) {
      const paragrafos = detailsRow.querySelectorAll('p');
      paragrafos.forEach(p => {
        const texto = p.textContent;
        if (texto.includes('Razão Social:')) document.getElementById('forn-razao').value = texto.replace('Razão Social:', '').trim();
        else if (texto.includes('Inscrição Est.:')) document.getElementById('forn-ie').value = texto.replace('Inscrição Est.:', '').trim();
        else if (texto.includes('E-mail de Pedidos:')) document.getElementById('forn-email').value = texto.replace('E-mail de Pedidos:', '').trim();
        else if (texto.includes('Endereço:')) document.getElementById('forn-endereco').value = texto.replace('Endereço:', '').trim();
        else if (texto.includes('Representante:')) {
          const repCompleto = texto.replace('Representante:', '').trim();
          const partes = repCompleto.split(' - ');
          document.getElementById('forn-rep-nome').value = partes[0] || '';
          
          // Pega o restante (telefone ou email) garantindo que, se tiver hífen no valor, não corte os dados
          partes.shift();
          document.getElementById('forn-rep-contato').value = partes.join(' - ') || '';
        }
      });
    }

    toggleForm(true);
    formSection.scrollIntoView({ behavior: 'smooth' });
  };

  const alternarStatusFornecedor = () => {
    if (!linhaEmEdicao) return;
    const statusBadge = linhaEmEdicao.cells[4].querySelector('.badge');
    const nomeFantasia = linhaEmEdicao.cells[1].textContent;
    const isAtivo = statusBadge.classList.contains('badge--ativo');

    if (isAtivo && confirm(`Tem certeza que deseja inativar o fornecedor ${nomeFantasia}?`)) {
      statusBadge.textContent = 'Inativo';
      statusBadge.className = 'badge badge--inativo';
      btnStatusForm.textContent = 'Ativar Fornecedor';
      btnStatusForm.className = 'btn-primario';
    } else if (!isAtivo) {
      statusBadge.textContent = 'Ativo';
      statusBadge.className = 'badge badge--ativo';
      btnStatusForm.textContent = 'Inativar Fornecedor';
      btnStatusForm.className = 'btn-perigo';
    }
  };

  // ── Eventos ──────────────────────────────────────────────────────────
  
  btnNovoFornecedor?.addEventListener('click', () => toggleForm(formSection.hidden));
  btnCancelar?.addEventListener('click', () => toggleForm(false));
  btnStatusForm?.addEventListener('click', alternarStatusFornecedor);

  // Submissão do formulário
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const nomeFantasia = document.getElementById('forn-fantasia').value.trim();
      const cnpj = document.getElementById('forn-cnpj').value.trim();
      const telefone = document.getElementById('forn-telefone').value.trim();
      
      if (linhaEmEdicao) {
          alert('Fornecedor atualizado com sucesso!');
      } else {
          mockFornecedores.unshift({
              fantasia: nomeFantasia, cnpj: cnpj, telefone: telefone, status: 'Ativo'
          });
          
          try {
            await fetch('/api/db', {
              method: 'POST',
              headers: window.getAuthHeaders(),
              body: JSON.stringify({ fornecedores: mockFornecedores })
            });
            alert('Fornecedor salvo no banco de dados!');
          } catch(err) {
            console.error(err);
          }
      }
      toggleForm(false);
      renderTabelaFornecedores();
    });
  }

  tableBody?.addEventListener('click', (e) => {
    const target = e.target;
    if (target.dataset.action === 'edit') {
      preencherFormularioParaEdicao(target.closest('tr'));
    } else if (target.dataset.action === 'expand') {
      const isExpanded = target.getAttribute('aria-expanded') === 'true';
      target.setAttribute('aria-expanded', !isExpanded);
      const detailsRow = target.closest('tr').nextElementSibling;
      if (detailsRow?.classList.contains('linha-detalhes')) detailsRow.hidden = isExpanded;
    }
  });

  searchInput?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const rows = tableBody.querySelectorAll('tr');
    for (let i = 0; i < rows.length; i += 2) {
      rows[i].style.display = (rows[i].cells[1].textContent.toLowerCase().includes(term) || rows[i].cells[2].textContent.toLowerCase().includes(term)) ? '' : 'none';
    }
  });

  // ── DADOS DO BACKEND (API) ───────────────────────────────────────
  let mockFornecedores = [];

  const carregarFornecedores = async () => {
    try {
      const resp = await fetch('/api/db');
      if (resp.ok) {
        const data = await resp.json();
        mockFornecedores = data.fornecedores || [];
        renderTabelaFornecedores();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const renderTabelaFornecedores = () => {
    if (!tableBody) return;
    tableBody.innerHTML = '';
    mockFornecedores.forEach(forn => {
      const isAtivo = forn.status === "Ativo";
      const trMain = document.createElement('tr');
      trMain.innerHTML = `
        <td style="text-align: center;"><button class="btn-expandir" data-action="expand" aria-expanded="false" aria-label="Ver detalhes">▼</button></td>
        <td>${escapeHtml(forn.fantasia)}</td>
        <td>${escapeHtml(forn.cnpj)}</td>
        <td>${escapeHtml(forn.telefone)}</td>
        <td><span class="badge ${isAtivo ? 'badge--ativo' : 'badge--inativo'}">${escapeHtml(forn.status)}</span></td>
        <td>
          <div class="forn-tabela__acoes">
            <button class="btn-secundario" data-action="edit" aria-label="Editar ${escapeHtml(forn.fantasia)}">Editar</button>
          </div>
        </td>
      `;
      const trDetails = document.createElement('tr');
      trDetails.className = 'linha-detalhes';
      trDetails.hidden = true;
      trDetails.innerHTML = `
        <td colspan="6">
          <div class="detalhes-conteudo">
            <p><strong>Razão Social:</strong> ${escapeHtml(forn.razao || '')}</p>
            <p><strong>Inscrição Est.:</strong> ${escapeHtml(forn.ie || '')}</p>
            <p><strong>E-mail de Pedidos:</strong> ${escapeHtml(forn.email || '')}</p>
            <p><strong>Endereço:</strong> ${escapeHtml(forn.endereco || '')}</p>
            <p><strong>Representante:</strong> ${escapeHtml(forn.repNome || '')} - ${escapeHtml(forn.repContato || '')}</p>
          </div>
        </td>
      `;
      tableBody.appendChild(trMain);
      tableBody.appendChild(trDetails);
    });
  };

  // Inicia o módulo
  carregarFornecedores();
})();