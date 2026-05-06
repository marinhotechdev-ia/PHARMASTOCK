// Lógica da página de Configurações do Sistema

(function () {
  const form = document.getElementById('form-configuracoes');
  const btnSalvar = document.getElementById('btn-salvar-config');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Extrai os valores do formulário e converte para os tipos corretos
    const avisoVencimentoDias = parseInt(document.getElementById('config-aviso-vencimento').value, 10);
    const estoqueMinimoGlobal = parseFloat(document.getElementById('config-estoque-minimo').value);

    // 2. Prepara o objeto JSON para envio ao Backend (Python)
    const payloadConfiguracoes = {
      regras_alerta: {
        dias_antecedencia_vencimento: avisoVencimentoDias,
        percentual_estoque_minimo: estoqueMinimoGlobal
      },
      atualizado_em: new Date().toISOString()
    };

    // Log da estrutura do JSON no console para fins de desenvolvimento
    console.log("Enviando JSON para a API (Python):", JSON.stringify(payloadConfiguracoes, null, 2));

    // 3. Simula a requisição via fetch
    try {
      // await fetch('/api/configuracoes', { method: 'PUT', body: JSON.stringify(payloadConfiguracoes), headers: { 'Content-Type': 'application/json' }});
      
      // 4. Feedback Visual na Interface
      const textoOriginal = btnSalvar.innerHTML;
      btnSalvar.classList.add('btn-primario--sucesso');
      btnSalvar.innerHTML = '<span aria-hidden="true">✅</span> Preferências Salvas!';
      
      setTimeout(() => {
        btnSalvar.classList.remove('btn-primario--sucesso');
        btnSalvar.innerHTML = textoOriginal;
      }, 3000);
    } catch (error) {
      alert('Erro ao salvar as configurações.');
    }
  });
})();