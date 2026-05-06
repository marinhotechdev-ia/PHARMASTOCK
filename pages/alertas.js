// Lógica da página de Alertas de Inventário

(function() {
  // ── DADOS MOCKADOS E DATA ATUAL ────────────────────────────────────────
  const hoje = new Date();
  
  // Função auxiliar para adicionar dias a uma data simulada
  const addDias = (data, dias) => {
    const novaData = new Date(data);
    novaData.setDate(novaData.getDate() + dias);
    return novaData;
  };

  const mockInventario = [
    { id: 1, nome: "Aspirina 500mg", lote: "L-1029", validade: addDias(hoje, -5).toISOString().split('T')[0], qtdAtual: 50, qtdMinima: 20 }, // Vencido
    { id: 2, nome: "Dipirona 1g", lote: "L-2044", validade: addDias(hoje, 15).toISOString().split('T')[0], qtdAtual: 120, qtdMinima: 30 }, // Vencendo
    { id: 3, nome: "Paracetamol 750mg", lote: "L-3011", validade: addDias(hoje, 180).toISOString().split('T')[0], qtdAtual: 10, qtdMinima: 50 }, // Estoque Baixo
    { id: 4, nome: "Vitamina C", lote: "L-4099", validade: addDias(hoje, 5).toISOString().split('T')[0], qtdAtual: 8, qtdMinima: 20 }, // Vencendo + Estoque Baixo
    { id: 5, nome: "Ibuprofeno 400mg", lote: "L-5012", validade: addDias(hoje, 200).toISOString().split('T')[0], qtdAtual: 150, qtdMinima: 20 }, // OK (não aparece nos alertas)
  ];

  // ── SELETORES DOM ──────────────────────────────────────────────────────
  const gridVencimentos = document.getElementById('grid-vencimentos');
  const gridEstoque = document.getElementById('grid-estoque');
  const painelVencimentos = document.getElementById('painel-vencimentos');
  const painelEstoque = document.getElementById('painel-estoque');
  const btnFiltros = document.querySelectorAll('.alrt-btn-filtro');

  // ── LÓGICA E PROCESSAMENTO ─────────────────────────────────────────────
  const processarAlertas = () => {
    const vencidos = [];
    const proximos = [];
    const estoqueBaixo = [];

    mockInventario.forEach(item => {
      const dataValidade = new Date(item.validade);
      // Remove a hora para garantir precisão apenas nos dias
      hoje.setHours(0,0,0,0);
      dataValidade.setHours(0,0,0,0);
      
      const diffTempo = dataValidade - hoje;
      const diffDias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));

      // Regra de Validade
      if (diffDias < 0) {
        vencidos.push(item);
      } else if (diffDias <= 30) {
        proximos.push(item);
      }

      // Regra de Estoque Mínimo
      if (item.qtdAtual <= item.qtdMinima) {
        estoqueBaixo.push(item);
      }
    });

    return { vencidos, proximos, estoqueBaixo };
  };

  const formatarData = (dataIso) => {
    const [ano, mes, dia] = dataIso.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  // ── RENDERIZAÇÃO DE HTML (CARDS) ───────────────────────────────────────
  const criarCardHTML = (item, tipo) => {
    const configuracoes = {
      'vencido': { border: 'alrt-card--vencido', badge: 'alrt-badge--vencido', texto: 'Vencido' },
      'proximo': { border: 'alrt-card--proximo', badge: 'alrt-badge--proximo', texto: 'Vence em breve' },
      'estoque': { border: 'alrt-card--estoque', badge: 'alrt-badge--estoque', texto: 'Estoque Baixo' }
    };
    
    const conf = configuracoes[tipo];
    const corQtd = tipo === 'estoque' ? '#c0392b' : '#333';

    return `
      <div class="alrt-card ${conf.border}">
        <div class="alrt-card__header">
          <h3 class="alrt-card__titulo">${item.nome}</h3>
          <span class="alrt-card__badge ${conf.badge}">${conf.texto}</span>
        </div>
        <div class="alrt-card__info">
          <span>Lote: <strong class="card-lote">${item.lote}</strong></span>
          <span>Validade: <strong>${formatarData(item.validade)}</strong></span>
          <span>Qtd Atual: <strong style="color: ${corQtd}">${item.qtdAtual}</strong> (Mín: ${item.qtdMinima})</span>
        </div>
        <div class="alrt-card__acoes">
          <button class="alrt-btn-acao">
            <span aria-hidden="true">📦</span> Ir para Movimentação
          </button>
        </div>
      </div>
    `;
  };

  const renderizarTelas = (filtro = 'todos') => {
    const { vencidos, proximos, estoqueBaixo } = processarAlertas();
    
    gridVencimentos.innerHTML = '';
    gridEstoque.innerHTML = '';

    let renderizouVencimento = false;
    let renderizouEstoque = false;

    // Renderiza Cards Vencidos/Próximos
    if (['todos', 'vencidos', 'proximos'].includes(filtro)) {
      if (['todos', 'vencidos'].includes(filtro)) vencidos.forEach(i => { gridVencimentos.innerHTML += criarCardHTML(i, 'vencido'); renderizouVencimento = true; });
      if (['todos', 'proximos'].includes(filtro)) proximos.forEach(i => { gridVencimentos.innerHTML += criarCardHTML(i, 'proximo'); renderizouVencimento = true; });
    }

    // Renderiza Cards Estoque Crítico
    if (['todos', 'estoque'].includes(filtro)) {
      estoqueBaixo.forEach(i => { gridEstoque.innerHTML += criarCardHTML(i, 'estoque'); renderizouEstoque = true; });
    }

    // Mensagens de "Tudo OK"
    if (!renderizouVencimento && ['todos', 'vencidos', 'proximos'].includes(filtro)) gridVencimentos.innerHTML = '<p style="color: #777;">Nenhum item pendente nesta categoria.</p>';
    if (!renderizouEstoque && ['todos', 'estoque'].includes(filtro)) gridEstoque.innerHTML = '<p style="color: #777;">Estoque em níveis adequados.</p>';

    // Controle de visibilidade das sessões inteiras
    painelVencimentos.style.display = (filtro === 'estoque') ? 'none' : 'block';
    painelEstoque.style.display = (filtro === 'vencidos' || filtro === 'proximos') ? 'none' : 'block';
  };

  // ── EVENT LISTENERS ────────────────────────────────────────────────────
  btnFiltros.forEach(btn => {
    btn.addEventListener('click', (e) => {
      btnFiltros.forEach(b => b.classList.remove('alrt-btn-filtro--ativo'));
      e.target.classList.add('alrt-btn-filtro--ativo');
      renderizarTelas(e.target.dataset.filtro);
    });
  });

  // Event Delegation para os botões de Ação gerados via JS dinamicamente
  document.getElementById('painel-vencimentos').addEventListener('click', (e) => { if (e.target.closest('.alrt-btn-acao')) alert(`Indo para tela de baixa/movimentação.\nProduto: ${e.target.closest('.alrt-card').querySelector('.alrt-card__titulo').textContent}\nLote: ${e.target.closest('.alrt-card').querySelector('.card-lote').textContent}`); });
  document.getElementById('painel-estoque').addEventListener('click', (e) => { if (e.target.closest('.alrt-btn-acao')) alert(`Indo para tela de repor/movimentação.\nProduto: ${e.target.closest('.alrt-card').querySelector('.alrt-card__titulo').textContent}\nLote: ${e.target.closest('.alrt-card').querySelector('.card-lote').textContent}`); });

  // Init
  renderizarTelas('todos');
})();