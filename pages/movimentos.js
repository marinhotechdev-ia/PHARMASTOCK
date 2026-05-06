// Lógica da página de Movimentação de Estoque

(function () {
  const form = document.getElementById('form-movimento');
  const inputQtd = document.getElementById('mov-qtd');
  const tbodyHistorico = document.getElementById('tabela-historico-corpo');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Coleta os dados do formulário
    const produtoStr = document.getElementById('mov-produto').value.trim();
    const tipo = document.getElementById('mov-tipo').value;
    const motivo = document.getElementById('mov-motivo').value;
    const lote = document.getElementById('mov-lote').value.trim();
    const validade = document.getElementById('mov-validade').value;
    const qtd = parseInt(inputQtd.value, 10);

    // 2. Validação simples de Quantidade (não permitir valores negativos ou zero)
    if (qtd <= 0 || isNaN(qtd)) {
      alert('A quantidade deve ser um número maior que zero.');
      inputQtd.focus();
      return;
    }

    if (!produtoStr) {
      alert('Selecione ou digite um produto válido.');
      return;
    }

    // Formatação de dados para envio ao Backend (Python)
    const payload = {
      produto: produtoStr,
      tipo_movimento: tipo,
      motivo: motivo,
      lote: lote,
      validade: validade,
      quantidade: qtd,
      data_hora: new Date().toISOString()
    };

    try {
      // Simulação de chamada Fetch para o Backend Python
      /*
      const response = await fetch('/api/estoque/movimentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Falha ao registrar movimentação.');
      const data = await response.json();
      */

      // 3. Simulação de sucesso (atualiza a UI dinamicamente para demonstração)
      alert('Movimentação registrada com sucesso!');

      // Renderizar a nova linha no topo da tabela
      const dataFormatada = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
      const isEntrada = tipo === 'ENTRADA';
      const qtdDisplay = isEntrada ? `+ ${qtd}` : `- ${qtd}`;
      const qtdColor = isEntrada ? '#1e8449' : '#c0392b';
      const badgeClass = isEntrada ? 'badge--entrada' : 'badge--saida';
      const textoBadge = isEntrada ? 'Entrada' : 'Saída';

      const novaLinha = document.createElement('tr');
      novaLinha.innerHTML = `
        <td>${dataFormatada}</td>
        <td>${produtoStr.split(' - ')[0]}</td> <!-- Pega só o nome antes do EAN -->
        <td><span class="badge ${badgeClass}">${textoBadge}</span></td>
        <td style="font-weight: bold; color: ${qtdColor};">${qtdDisplay}</td>
        <td>${lote}</td>
        <td>Admin Atual</td>
      `;
      tbodyHistorico.prepend(novaLinha);
      form.reset(); // Limpa o formulário
    } catch (error) {
      console.error(error);
      alert('Ocorreu um erro ao comunicar com o servidor.');
    }
  });
})();