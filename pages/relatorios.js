// Lógica da página de Relatórios Gerenciais

(function () {
  // ── SELEÇÃO DE ELEMENTOS DOM ──────────────────────────────────────────
  const form = document.getElementById('form-relatorios');
  const selectTipo = document.getElementById('rel-tipo');
  const btnExportar = document.getElementById('btn-rel-exportar');
  
  const containerKpis = document.getElementById('rel-container-kpis');
  const containerTabela = document.getElementById('rel-container-tabela');
  const tituloTabela = document.getElementById('rel-titulo-impressao');
  
  const kpiEntradas = document.getElementById('kpi-entradas');
  const kpiSaidas = document.getElementById('kpi-saidas');
  const kpiSaldo = document.getElementById('kpi-saldo');
  const kpiTituloSaldo = document.getElementById('kpi-titulo-saldo');
  
  const thead = document.getElementById('rel-tabela-head');
  const tbody = document.getElementById('rel-tabela-corpo');

  // ── FUNÇÕES UTILITÁRIAS ──────────────────────────────────────────────
  const formatarMoeda = (valor) => `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;
  const formatarData = (dataIso) => {
    const date = new Date(dataIso);
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  // ── MOCK DATA (Simulando resposta JSON do Back-end em Python) ─────────
  const mockBackEnd = {
    vendas: {
      entradas: 0,
      saidas: 45, // Itens vendidos
      saldo: 1250.50, // R$
      dados: [
        { id: 'V-1001', data: '2023-10-01', cliente: 'João Silva', itens: 3, total: 150.00 },
        { id: 'V-1002', data: '2023-10-02', cliente: 'Maria Souza', itens: 1, total: 35.50 },
        { id: 'V-1003', data: '2023-10-02', cliente: 'Cliente Balcão', itens: 5, total: 200.00 },
        { id: 'V-1004', data: '2023-10-03', cliente: 'Carlos Pereira', itens: 2, total: 865.00 }
      ]
    },
    movimentacao: {
      entradas: 500, // Qtd produtos
      saidas: 120, // Qtd produtos
      saldo: 380, // Qtd Liquida
      dados: [
        { dataHora: '2023-10-01T10:30', produto: 'Paracetamol 750mg', tipo: 'ENTRADA', qtd: 300, motivo: 'Compra' },
        { dataHora: '2023-10-01T14:15', produto: 'Ibuprofeno 400mg', tipo: 'SAIDA', qtd: 20, motivo: 'Vencimento' },
        { dataHora: '2023-10-02T09:00', produto: 'Amoxicilina 500mg', tipo: 'ENTRADA', qtd: 200, motivo: 'Compra' },
        { dataHora: '2023-10-03T16:45', produto: 'Dipirona 1g', tipo: 'SAIDA', qtd: 100, motivo: 'Uso Interno' }
      ]
    },
    validade: {
      entradas: 4, // Lotes totais
      saidas: 1, // Lotes vencidos
      saldo: 3, // Lotes OK
      dados: [
        { produto: 'Paracetamol 750mg', lote: 'L-2023A', validade: '2023-10-15', qtd: 50, status: 'PROXIMO' },
        { produto: 'Ibuprofeno 400mg', lote: 'L-2022X', validade: '2023-09-30', qtd: 20, status: 'VENCIDO' },
        { produto: 'Dipirona 1g', lote: 'L-2024B', validade: '2024-12-01', qtd: 300, status: 'OK' },
        { produto: 'Vitamina C', lote: 'L-2023C', validade: '2023-11-10', qtd: 15, status: 'PROXIMO' }
      ]
    }
  };

  // ── LÓGICA DE RENDERIZAÇÃO (MODULAR) ─────────────────────────────────

  // Configurações de colunas e mapeamento de dados baseado no tipo de relatório
  const configsTabela = {
    vendas: {
      titulos: ['Data', 'Cód. Transação', 'Descrição', 'Tipo', 'Valor (R$)'],
      renderRow: (item) => {
        const isEntrada = item.total >= 0;
        return `
        <td>${formatarData(item.data)}</td>
        <td><strong>${item.id}</strong></td>
        <td>${item.cliente}</td>
        <td><span class="rel-badge ${isEntrada ? 'rel-badge--entrada' : 'rel-badge--saida'}">${isEntrada ? 'RECEITA' : 'DESPESA'}</span></td>
        <td style="font-weight: bold; color: ${isEntrada ? '#27ae60' : '#e74c3c'};">${formatarMoeda(Math.abs(item.total))}</td>
      `},
      kpiTitulos: ['Receitas (Entradas)', 'Despesas (Saídas)', 'Saldo Líquido'],
      formatSaldo: (v) => formatarMoeda(v)
    },
    movimentacao: {
      titulos: ['Data / Hora', 'Produto', 'Tipo', 'Quantidade', 'Motivo'],
      renderRow: (item) => {
        const [data, hora] = item.dataHora.split('T');
        const isEntrada = item.tipo === 'ENTRADA';
        const badgeClass = isEntrada ? 'rel-badge--entrada' : 'rel-badge--saida';
        const sinal = isEntrada ? '+' : '-';
        return `
          <td>${formatarData(data)} às ${hora}</td>
          <td>${item.produto}</td>
          <td><span class="rel-badge ${badgeClass}">${item.tipo}</span></td>
          <td style="font-weight: bold; color: ${isEntrada ? '#27ae60' : '#e74c3c'};">${sinal} ${item.qtd}</td>
          <td>${item.motivo}</td>
        `;
      },
      kpiTitulos: ['Qtd Entrada', 'Qtd Saída', 'Saldo Líquido (Und)'],
      formatSaldo: (v) => `${v} und`
    },
    validade: {
      titulos: ['Produto', 'Lote', 'Validade', 'Qtd Atual', 'Situação'],
      renderRow: (item) => {
        let badgeClass = 'rel-badge--neutro';
        let textoStatus = item.status;
        if (item.status === 'VENCIDO') badgeClass = 'rel-badge--saida';
        else if (item.status === 'PROXIMO') { badgeClass = 'rel-badge--alerta'; textoStatus = 'PRÓXIMO'; }
        else if (item.status === 'OK') { badgeClass = 'rel-badge--entrada'; }

        return `
          <td><strong>${item.produto}</strong></td>
          <td>${item.lote}</td>
          <td>${formatarData(item.validade)}</td>
          <td>${item.qtd} und</td>
          <td><span class="rel-badge ${badgeClass}">${textoStatus}</span></td>
        `;
      },
      kpiTitulos: ['Lotes Analisados', 'Lotes Vencidos', 'Lotes em Dia'],
      formatSaldo: (v) => `${v} lotes`
    }
  };

  const processarJSON = async (tipo, dataInicial, dataFinal) => {
    try {
        const resp = await fetch('/api/db');
        if (!resp.ok) throw new Error('Falha na API');
        const db = await resp.json();
        
        if (tipo === 'movimentacao') {
            const movs = db.movimentos || [];
            
            // Tratamento das datas para o filtro
            const dataIn = dataInicial ? new Date(dataInicial + 'T00:00:00') : new Date('2000-01-01');
            const dataOut = dataFinal ? new Date(dataFinal + 'T23:59:59') : new Date('2100-01-01');
            
            const filtrados = movs.filter(m => {
                const d = new Date(m.dataHora);
                return d >= dataIn && d <= dataOut;
            });
            
            let ent = 0, sai = 0;
            filtrados.forEach(m => {
                if(m.tipo === 'ENTRADA') ent += m.qtd;
                else sai += m.qtd;
            });
            
            return { entradas: ent, saidas: sai, saldo: ent - sai, dados: filtrados };
        }
        
        if (tipo === 'vendas') {
            const vendas = db.vendas || [];
            
            // Tratamento das datas para o filtro
            const dataIn = dataInicial ? new Date(dataInicial + 'T00:00:00') : new Date('2000-01-01');
            const dataOut = dataFinal ? new Date(dataFinal + 'T23:59:59') : new Date('2100-01-01');
            
            const filtrados = vendas.filter(v => {
                const d = new Date(v.data + 'T00:00:00');
                return d >= dataIn && d <= dataOut;
            });
            
            let receitas = 0, despesas = 0, saldo = 0;
            filtrados.forEach(v => {
                if (v.total >= 0) {
                    receitas += v.total;
                } else {
                    despesas += Math.abs(v.total);
                }
                saldo += v.total;
            });
            
            return { entradas: formatarMoeda(receitas), saidas: formatarMoeda(despesas), saldo: saldo, dados: filtrados };
        }
        
        // Retorna mock para Validade por enquanto
        return mockBackEnd[tipo];
    } catch (error) {
        console.error("Erro ao carregar do banco:", error);
        return mockBackEnd[tipo];
    }
  };

  const renderizarRelatorio = async (e) => {
    e.preventDefault();
    const tipo = selectTipo.value;
    const dInicio = document.getElementById('rel-data-inicio').value;
    const dFim = document.getElementById('rel-data-fim').value;
    const btnSubmit = document.getElementById('btn-gerar-relatorio');

    // UX de carregamento
    btnSubmit.textContent = 'Gerando...';
    btnSubmit.disabled = true;

    try {
      const dadosJSON = await processarJSON(tipo, dInicio, dFim);
      const config = configsTabela[tipo];

      // Atualiza KPIs
      document.querySelector('.rel-kpi-card--entrada .rel-kpi__titulo').textContent = config.kpiTitulos[0];
      document.querySelector('.rel-kpi-card--saida .rel-kpi__titulo').textContent = config.kpiTitulos[1];
      kpiTituloSaldo.textContent = config.kpiTitulos[2];

      kpiEntradas.textContent = config.kpiTitulos[0] === 'N/A' ? '-' : dadosJSON.entradas;
      kpiSaidas.textContent = dadosJSON.saidas;
      kpiSaldo.textContent = config.formatSaldo(dadosJSON.saldo);

      // Atualiza Cabeçalho da Tabela
      thead.innerHTML = `<tr>${config.titulos.map(t => `<th>${t}</th>`).join('')}</tr>`;
      
      // Atualiza Corpo da Tabela
      tbody.innerHTML = dadosJSON.dados.map(item => `<tr>${config.renderRow(item)}</tr>`).join('');

      // Mostra as áreas escondidas e atualiza o título para a impressão
      tituloTabela.textContent = `Relatório de ${selectTipo.options[selectTipo.selectedIndex].text} (${formatarData(dInicio)} a ${formatarData(dFim)})`;
      containerKpis.hidden = false;
      containerTabela.hidden = false;
      btnExportar.disabled = false;

    } catch (error) {
      alert('Erro ao gerar o relatório. Tente novamente.');
    } finally {
      btnSubmit.textContent = 'Gerar Relatório';
      btnSubmit.disabled = false;
    }
  };

  // ── EVENT LISTENERS ──────────────────────────────────────────────────
  form?.addEventListener('submit', renderizarRelatorio);
  
  // Aciona a impressão formatada nativa pelo CSS @media print
  btnExportar?.addEventListener('click', () => window.print());

  // Auto-gerar relatório de Vendas dos últimos 30 dias ao abrir a tela
  const btnSubmit = document.getElementById('btn-gerar-relatorio');
  if (btnSubmit) {
      const dFim = new Date();
      const dInicio = new Date();
      dInicio.setDate(dFim.getDate() - 30);
      
      document.getElementById('rel-data-inicio').value = dInicio.toISOString().split('T')[0];
      document.getElementById('rel-data-fim').value = dFim.toISOString().split('T')[0];
      
      // Pequeno atraso para dar tempo de o DOM finalizar
      setTimeout(() => btnSubmit.click(), 50);
  }
})();