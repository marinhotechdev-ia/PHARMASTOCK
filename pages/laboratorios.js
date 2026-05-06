// Lógica da página de Laboratórios

(function () {
  // ── Elementos do DOM ─────────────────────────────────────────────────
  const btnNovoLaboratorio = document.getElementById('btn-novo-laboratorio');
  const formSection = document.getElementById('form-laboratorio');
  const btnCancelar = document.getElementById('btn-cancelar-form');
  const form = document.getElementById('form-lab');
  const formTitle = document.getElementById('form-laboratorio__modo-titulo');
  const searchInput = document.getElementById('filtro-laboratorios');
  const tableBody = document.getElementById('tabela-laboratorios-corpo');
  const btnRemoverForm = document.getElementById('btn-remover-lab');
  let linhaEmEdicao = null;

  // ── Funções ──────────────────────────────────────────────────────────

  const toggleForm = (show = false) => {
    if (show) {
      formSection.hidden = false;
      btnNovoLaboratorio.setAttribute('aria-expanded', 'true');
    } else {
      formSection.hidden = true;
      btnNovoLaboratorio.setAttribute('aria-expanded', 'false');
      form.reset();
      linhaEmEdicao = null;
      btnRemoverForm.hidden = true;
      formTitle.textContent = 'Novo Laboratório';
    }
  };

  const preencherFormularioParaEdicao = (row) => {
    linhaEmEdicao = row;
    formTitle.textContent = 'Editar Laboratório';
    btnRemoverForm.hidden = false;
    
    document.getElementById('lab-nome').value = row.cells[1].textContent;
    document.getElementById('lab-cnpj').value = row.cells[2].textContent;

    toggleForm(true);
    formSection.scrollIntoView({ behavior: 'smooth' });
  };

  const removerLaboratorio = () => {
    if (!linhaEmEdicao) return;
    const nomeLab = linhaEmEdicao.cells[1].textContent;
    
    // RF-L03: Validação (simulação) de produtos vinculados pela área de detalhes
    const detailsRow = linhaEmEdicao.nextElementSibling;
    const textoDetalhes = detailsRow ? detailsRow.textContent : '';

    if (textoDetalhes.includes('Nenhum produto vinculado')) {
      if (confirm(`Tem certeza que deseja EXCLUIR o laboratório ${nomeLab}?\nEsta ação não pode ser desfeita.`)) {
        alert('Laboratório removido com sucesso!');
        toggleForm(false);
        // Em uma aplicação real, a API excluiria e a linha seria removida da tabela.
      }
    } else {
      alert(`Atenção: Não é possível remover o laboratório ${nomeLab} pois existem produtos em estoque vinculados a ele.\n\nRemova os produtos primeiro ou marque o laboratório como inativo.`);
    }
  };

  // ── Eventos ──────────────────────────────────────────────────────────
  
  btnNovoLaboratorio?.addEventListener('click', () => toggleForm(formSection.hidden));
  btnCancelar?.addEventListener('click', () => toggleForm(false));
  btnRemoverForm?.addEventListener('click', removerLaboratorio);

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const nomeFantasia = document.getElementById('lab-nome')?.value.trim();
      const cnpj = document.getElementById('lab-cnpj')?.value.trim();
      
      if (linhaEmEdicao) {
          alert('Laboratório atualizado com sucesso!');
      } else {
          mockLaboratorios.unshift({
              nome: nomeFantasia, cnpj: cnpj, vinculados: 'Nenhum produto vinculado.'
          });
          
          try {
            await fetch('/api/db', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ laboratorios: mockLaboratorios })
            });
            alert('Laboratório salvo no banco de dados!');
          } catch(err) {
            console.error(err);
          }
      }
      toggleForm(false);
      renderTabelaLaboratorios();
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
  let mockLaboratorios = [];

  const carregarLaboratorios = async () => {
    try {
      const resp = await fetch('/api/db');
      if (resp.ok) {
        const data = await resp.json();
        mockLaboratorios = data.laboratorios || [];
        renderTabelaLaboratorios();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const renderTabelaLaboratorios = () => {
    if (!tableBody) return;
    tableBody.innerHTML = '';
    mockLaboratorios.forEach(lab => {
      const trMain = document.createElement('tr');
      trMain.innerHTML = `
        <td style="text-align: center;"><button class="btn-expandir" data-action="expand" aria-expanded="false" aria-label="Ver detalhes">▼</button></td>
        <td>${lab.nome}</td>
        <td>${lab.cnpj}</td>
        <td>
          <div class="lab-tabela__acoes">
            <button class="btn-secundario" data-action="edit" aria-label="Editar ${lab.nome}">Editar</button>
          </div>
        </td>
      `;
      const trDetails = document.createElement('tr');
      trDetails.className = 'linha-detalhes';
      trDetails.hidden = true;
      trDetails.innerHTML = `
        <td colspan="4">
          <div class="detalhes-conteudo">
            <p><strong>Produtos Vinculados:</strong> ${lab.vinculados}</p>
          </div>
        </td>
      `;
      tableBody.appendChild(trMain);
      tableBody.appendChild(trDetails);
    });
  };

  carregarLaboratorios();
})();