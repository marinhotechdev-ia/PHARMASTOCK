// Lógica da página de Gestão de Estoque / Produtos

(function () {
  // ── Seleção de Elementos DOM ──────────────────────────────────────────
  const btnNovoProduto = document.getElementById('btn-novo-produto');
  const formSection = document.getElementById('form-produto-section');
  const btnCancelar = document.getElementById('btn-cancelar-form');
  const form = document.getElementById('form-prod');
  const formTitle = document.getElementById('form-produto__modo-titulo');
  const btnStatusForm = document.getElementById('btn-status-produto');
  const tableBody = document.getElementById('tabela-produtos-corpo');
  
  // Filtros (RF-P04)
  const inputFiltroNome = document.getElementById('filtro-nome');
  const selectFiltroCat = document.getElementById('filtro-categoria');
  const selectFiltroLab = document.getElementById('filtro-lab');

  let linhaEmEdicao = null;

  // ── Funções de Interface ─────────────────────────────────────────────

  const toggleForm = (show = false) => {
    formSection.hidden = !show;
    btnNovoProduto.setAttribute('aria-expanded', show);
    
    if (!show) {
      form.reset();
      linhaEmEdicao = null;
      btnStatusForm.hidden = true;
      formTitle.textContent = 'Novo Produto';
    }
  };

  // RF-P03: Edição de Produto (Carregar dados no form)
  const preencherFormularioParaEdicao = (row) => {
    linhaEmEdicao = row;
    formTitle.textContent = 'Editar Produto';

    // Pega informações cruas da tabela para o form simulado
    const prodEanCell = row.cells[0];
    const nome = prodEanCell.querySelector('strong').textContent;
    const ean = prodEanCell.querySelector('small').textContent;
    const categoria = row.cells[1].textContent;
    const lab = row.cells[2].textContent;
    const unidade = row.cells[3].textContent;
    const preco = row.cells[4].textContent;
    const estqMinRaw = row.cells[5].textContent.split('/')[1].trim(); // Pega a parte depois da '/'

    // Preenche Form
    document.getElementById('prod-nome').value = nome;
    document.getElementById('prod-ean').value = ean;
    document.getElementById('prod-categoria').value = categoria;
    document.getElementById('prod-laboratorio').value = lab;
    document.getElementById('prod-unidade').value = unidade;
    document.getElementById('prod-preco').value = preco;
    document.getElementById('prod-minimo').value = estqMinRaw;

    // RF-P06: Exibe botão de inativar com o status atual
    const statusBadge = row.cells[6].querySelector('.badge');
    const isAtivo = statusBadge.classList.contains('badge--ativo');
    btnStatusForm.textContent = isAtivo ? 'Inativar Produto' : 'Ativar Produto';
    btnStatusForm.className = isAtivo ? 'btn-perigo' : 'btn-primario';
    btnStatusForm.hidden = false;

    toggleForm(true);
    formSection.scrollIntoView({ behavior: 'smooth' });
  };

  // RF-P06: Alternar status inativo/ativo (Soft Delete)
  const alternarStatusProduto = () => {
    if (!linhaEmEdicao) return;
    const statusBadge = linhaEmEdicao.cells[6].querySelector('.badge');
    const isAtivo = statusBadge.classList.contains('badge--ativo');

    if (isAtivo) {
      if (confirm('Deseja realmente INATIVAR este produto do catálogo?')) {
        statusBadge.textContent = 'Inativo';
        statusBadge.className = 'badge badge--inativo';
        btnStatusForm.textContent = 'Ativar Produto';
        btnStatusForm.className = 'btn-primario';
      }
    } else {
      statusBadge.textContent = 'Ativo';
      statusBadge.className = 'badge badge--ativo';
      btnStatusForm.textContent = 'Inativar Produto';
      btnStatusForm.className = 'btn-perigo';
    }
  };

  // RF-P04: Filtro de Busca Integrado
  const aplicarFiltros = () => {
    const tNome = inputFiltroNome.value.toLowerCase();
    const tCat = selectFiltroCat.value.toLowerCase();
    const tLab = selectFiltroLab.value.toLowerCase();

    Array.from(tableBody.querySelectorAll('tr')).forEach(row => {
      const textoNome = row.cells[0].textContent.toLowerCase();
      const catReal = row.dataset.categoria.toLowerCase();
      const labReal = row.dataset.lab.toLowerCase();

      const bateNome = !tNome || textoNome.includes(tNome);
      const bateCat = !tCat || catReal === tCat;
      const bateLab = !tLab || labReal === tLab;

      row.style.display = (bateNome && bateCat && bateLab) ? '' : 'none';
    });
  };

  // ── Bind Eventos ───────────────────────────────────────────────
  const vincularEventos = () => {
    btnNovoProduto?.addEventListener('click', () => toggleForm(formSection.hidden));
    btnCancelar?.addEventListener('click', () => toggleForm(false));
    btnStatusForm?.addEventListener('click', alternarStatusProduto);
    
    // Submissão do formulário
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nome = document.getElementById('prod-nome').value.trim();
        const ean = document.getElementById('prod-ean').value.trim();
        const categoria = document.getElementById('prod-categoria').value;
        const lab = document.getElementById('prod-laboratorio').value;
        const und = document.getElementById('prod-unidade').value;
        const preco = document.getElementById('prod-preco').value.trim();
        const min = parseInt(document.getElementById('prod-minimo').value) || 0;
        
        let status = 'Ativo';

        if (linhaEmEdicao) {
            alert('Produto atualizado com sucesso!');
        } else {
            mockEstoque.unshift({
                nome, ean, categoria, lab, und, preco, atual: 0, min, status
            });
            
            try {
              await fetch('/api/db', {
                method: 'POST',
                headers: window.getAuthHeaders(),
                body: JSON.stringify({ estoque: mockEstoque })
              });
              alert('Produto salvo no banco de dados!');
            } catch(err) {
              console.error(err);
            }
        }
        toggleForm(false);
        renderTabelaEstoque();
      });
    }

    tableBody?.addEventListener('click', (e) => { if (e.target.dataset.action === 'edit') preencherFormularioParaEdicao(e.target.closest('tr')); });
    [inputFiltroNome, selectFiltroCat, selectFiltroLab].forEach(el => el?.addEventListener('input', aplicarFiltros));
  };

  // ── DADOS DO BACKEND (API) ───────────────────────────────────────
  let mockEstoque = [];

  const carregarEstoque = async () => {
    try {
      const resp = await fetch('/api/db');
      if (resp.ok) {
        const data = await resp.json();
        mockEstoque = data.estoque || [];
        renderTabelaEstoque();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const renderTabelaEstoque = () => {
    if (!tableBody) return;
    tableBody.innerHTML = '';
    mockEstoque.forEach(prod => {
      const isAtivo = prod.status === "Ativo";
      const trMain = document.createElement('tr');
      trMain.dataset.categoria = prod.categoria;
      trMain.dataset.lab = prod.lab;
      const qtEstoque = (prod.atual || 0) <= prod.min ? `<span style="color: #c0392b; font-weight: bold;">${prod.atual || 0}</span>` : `<span style="color: #1e8449; font-weight: bold;">${prod.atual || 0}</span>`;

      trMain.innerHTML = `
        <td>
          <strong>${escapeHtml(prod.nome)}</strong><br>
          <small style="color: #666;">${escapeHtml(prod.ean)}</small>
        </td>
        <td>${escapeHtml(prod.categoria)}</td>
        <td>${escapeHtml(prod.lab)}</td>
        <td>${escapeHtml(prod.und)}</td>
        <td>${escapeHtml(prod.preco)}</td>
        <td>${qtEstoque} / ${prod.min}</td>
        <td><span class="badge ${isAtivo ? 'badge--ativo' : 'badge--inativo'}">${escapeHtml(prod.status)}</span></td>
        <td>
          <div class="estq-tabela__acoes">
            <button class="btn-secundario" data-action="edit" style="padding: 4px 10px; font-size: 0.8rem;">Editar</button>
          </div>
        </td>
      `;
      tableBody.appendChild(trMain);
    });
  };

  // Inicia o módulo
  vincularEventos();
  carregarEstoque();
})();