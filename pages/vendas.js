// Lógica da página de PDV / Vendas

(function () {
  // ── ESTADO DO APLICATIVO ─────────────────────────────────────────────
  let carrinho = [];
  let descontoValor = 0;
  let descontoTipo = 'R$'; // 'R$' ou '%'
  let ultimaVendaImpressao = null; // Armazena dados para a reimpressão

  // Mock de Banco de Dados de Produtos (Simulação)
  const produtosDB = {
    '7891000200030': { ean: '7891000200030', nome: 'Paracetamol 750mg', preco: 12.50 },
    '7891000200041': { ean: '7891000200041', nome: 'Amoxicilina 500mg', preco: 25.00 },
    '7891000200052': { ean: '7891000200052', nome: 'Ibuprofeno 400mg',  preco: 18.90 },
    '7891000200063': { ean: '7891000200063', nome: 'Dipirona 1g',       preco: 8.50 },
    '7891000200074': { ean: '7891000200074', nome: 'Vitamina C 1g',     preco: 15.00 }
  };

  // ── SELEÇÃO DE ELEMENTOS DOM ─────────────────────────────────────────
  const inputBusca = document.getElementById('pdv-busca');
  const tbodyCarrinho = document.getElementById('pdv-carrinho-corpo');
  const elSubtotal = document.getElementById('pdv-subtotal');
  const elTotal = document.getElementById('pdv-total');
  const inputDescValor = document.getElementById('pdv-desconto-valor');
  const selectDescTipo = document.getElementById('pdv-desconto-tipo');
  const btnFinalizar = document.getElementById('btn-pdv-finalizar');
  const btnCancelar = document.getElementById('btn-pdv-cancelar');
  const btnImprimir = document.getElementById('btn-pdv-imprimir');
  const inputCpf = document.getElementById('pdv-cpf');

  // Formatação Monetária
  const formatarMoeda = (valor) => `R$ ${valor.toFixed(2).replace('.', ',')}`;

  // ── LÓGICA PRINCIPAL ─────────────────────────────────────────────────

  /** Atualiza os totais calculados (Subtotal, Desconto e Total) */
  const atualizarTotais = () => {
    const subtotal = carrinho.reduce((acc, item) => acc + (item.preco * item.qtd), 0);
    
    let totalComDesconto = subtotal;
    if (descontoValor > 0) {
      if (descontoTipo === 'R$') {
        totalComDesconto -= descontoValor;
      } else if (descontoTipo === '%') {
        totalComDesconto -= (subtotal * (descontoValor / 100));
      }
    }

    // Evita total negativo
    totalComDesconto = Math.max(0, totalComDesconto);

    elSubtotal.textContent = formatarMoeda(subtotal);
    elTotal.textContent = formatarMoeda(totalComDesconto);

    // Desabilita botões se o carrinho estiver vazio
    const carrinhoVazio = carrinho.length === 0;
    btnFinalizar.disabled = carrinhoVazio;
  };

  /** Renderiza as linhas da tabela do carrinho */
  const renderizarCarrinho = () => {
    tbodyCarrinho.innerHTML = '';

    if (carrinho.length === 0) {
      tbodyCarrinho.innerHTML = `
        <tr id="pdv-carrinho-vazio">
          <td colspan="5" style="text-align: center; color: #888; padding: 40px 0;">
            Nenhum item adicionado à venda.
          </td>
        </tr>
      `;
      atualizarTotais();
      return;
    }

    carrinho.forEach((item, index) => {
      const subtotalItem = item.preco * item.qtd;
      const tr = document.createElement('tr');
      
      tr.innerHTML = `
        <td>
          <strong>${item.nome}</strong><br>
          <small style="color: #888; font-size: 0.85rem;">${item.ean}</small>
        </td>
        <td style="text-align: center;">
          <input type="number" class="pdv-input-qtd" data-index="${index}" value="${item.qtd}" min="1">
        </td>
        <td style="text-align: right;">${formatarMoeda(item.preco)}</td>
        <td style="text-align: right; font-weight: bold; color: #0077b6;">${formatarMoeda(subtotalItem)}</td>
        <td style="text-align: center;">
          <button class="btn-remover-item" data-index="${index}" title="Remover Item">✖</button>
        </td>
      `;
      tbodyCarrinho.appendChild(tr);
    });

    atualizarTotais();
  };

  /** Adiciona um item ao carrinho a partir da busca */
  const adicionarItem = (termoBusca) => {
    if (!termoBusca) return;

    // Simula a busca no banco de dados por EAN. (Na prática, faria busca por nome tbm)
    const produto = produtosDB[termoBusca] || Object.values(produtosDB).find(p => p.nome.toLowerCase().includes(termoBusca.toLowerCase()));

    if (produto) {
      // Verifica se já existe no carrinho para somar +1
      const indexExistente = carrinho.findIndex(i => i.ean === produto.ean);
      if (indexExistente >= 0) {
        carrinho[indexExistente].qtd += 1;
      } else {
        carrinho.push({ ...produto, qtd: 1 });
      }
      
      inputBusca.value = ''; // Limpa o campo
      renderizarCarrinho();
      
      // Mantém o foco para o próximo bipe de EAN
      inputBusca.focus();
    } else {
      alert('Produto não encontrado!');
      inputBusca.select();
    }
  };

  /** Prepara o DOM invisível e aciona a impressão da impressora térmica */
  const gerarComprovante = (dadosVenda) => {
    const dataHora = new Date().toLocaleString('pt-BR');
    document.getElementById('recibo-data').textContent = dataHora;
    
    const containerItens = document.getElementById('recibo-itens');
    containerItens.innerHTML = '';

    dadosVenda.itens.forEach(item => {
      containerItens.innerHTML += `
        <div class="recibo-item-linha">
          <span>${item.qtd}x ${item.nome}</span>
          <span>${formatarMoeda(item.preco * item.qtd)}</span>
        </div>
      `;
    });

    document.getElementById('recibo-subtotal').textContent = formatarMoeda(dadosVenda.subtotal);
    document.getElementById('recibo-desconto').textContent = formatarMoeda(dadosVenda.descontoAplicado);
    document.getElementById('recibo-total').textContent = formatarMoeda(dadosVenda.total);

    // Aciona a impressão nativa do navegador
    window.print();
  };

  // ── EVENT LISTENERS ──────────────────────────────────────────────────

  // Campo de Busca (Adiciona ao apertar Enter)
  inputBusca?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      adicionarItem(inputBusca.value.trim());
    }
  });

  // Event Delegation para Botões de Remover e Input de Quantidade na Tabela
  tbodyCarrinho?.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-remover-item')) {
      const index = parseInt(e.target.dataset.index, 10);
      carrinho.splice(index, 1);
      renderizarCarrinho();
      inputBusca.focus();
    }
  });

  tbodyCarrinho?.addEventListener('change', (e) => {
    if (e.target.classList.contains('pdv-input-qtd')) {
      const index = parseInt(e.target.dataset.index, 10);
      const novaQtd = parseInt(e.target.value, 10);
      if (novaQtd > 0) {
        carrinho[index].qtd = novaQtd;
      } else {
        e.target.value = carrinho[index].qtd; // Reverte se for inválido
      }
      atualizarTotais();
    }
  });

  // Controles de Desconto
  inputDescValor?.addEventListener('input', (e) => {
    descontoValor = parseFloat(e.target.value) || 0;
    atualizarTotais();
  });

  selectDescTipo?.addEventListener('change', (e) => {
    descontoTipo = e.target.value;
    atualizarTotais();
  });

  // Botões de Ação
  btnCancelar?.addEventListener('click', () => {
    if (carrinho.length > 0 && confirm('Deseja realmente cancelar a venda atual?')) {
      carrinho = [];
      inputDescValor.value = '';
      descontoValor = 0;
      inputCpf.value = '';
      renderizarCarrinho();
      btnImprimir.disabled = true;
      inputBusca.focus();
    }
  });

  // Atalhos de Teclado Globais (F2 = Finalizar, ESC = Cancelar)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F2') {
      e.preventDefault();
      if (!btnFinalizar.disabled) btnFinalizar.click();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      btnCancelar.click();
    }
  });

  btnFinalizar?.addEventListener('click', () => {
    // Salva os dados para o recibo antes de limpar
    const subtotal = carrinho.reduce((acc, item) => acc + (item.preco * item.qtd), 0);
    const totalStr = elTotal.textContent.replace('R$ ', '').replace(',', '.');
    const total = parseFloat(totalStr);
    
    ultimaVendaImpressao = {
      itens: [...carrinho],
      subtotal: subtotal,
      descontoAplicado: subtotal - total,
      total: total,
      cpf: inputCpf.value
    };

    alert(`Venda finalizada com sucesso!\nTotal pago: ${formatarMoeda(total)}`);
    
    // Habilita a reimpressão da última venda
    btnImprimir.disabled = false;

    // Limpa a tela para a próxima venda
    carrinho = [];
    inputDescValor.value = '';
    descontoValor = 0;
    inputCpf.value = '';
    renderizarCarrinho();
    inputBusca.focus();
  });

  btnImprimir?.addEventListener('click', () => {
    if (ultimaVendaImpressao) {
      gerarComprovante(ultimaVendaImpressao);
    }
  });

  // Inicialização
  renderizarCarrinho();
})();