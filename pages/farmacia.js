// Lógica da página de Dados da Farmácia e Parâmetros do Sistema

(function () {
  const form = document.getElementById('form-farmacia');
  const inputCnpj = document.getElementById('farm-cnpj');
  const inputTelefone = document.getElementById('farm-telefone');

  // Máscara para CNPJ
  inputCnpj?.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 14);
    if (v.length > 12) v = v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d+)/, '$1.$2.$3/$4-$5');
    else if (v.length > 8) v = v.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');
    else if (v.length > 5) v = v.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
    else if (v.length > 2) v = v.replace(/(\d{2})(\d+)/, '$1.$2');
    e.target.value = v;
  });

  // Máscara para Telefone
  inputTelefone?.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 10)     v = v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    else if (v.length > 6) v = v.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
    else if (v.length > 2) v = v.replace(/(\d{2})(\d+)/, '($1) $2');
    e.target.value = v;
  });

  // Simulação de carregamento dos dados da unidade
  const carregarDados = () => {
    // Em um sistema real, aqui haveria um fetch para a API buscando os dados cadastrados.
    if (document.getElementById('farm-razao')) document.getElementById('farm-razao').value = 'Farmácia PharmaStock Saúde LTDA';
    if (document.getElementById('farm-fantasia')) document.getElementById('farm-fantasia').value = 'PharmaStock';
    if (document.getElementById('farm-cnpj')) document.getElementById('farm-cnpj').value = '12.345.678/0001-90';
    if (document.getElementById('farm-ie')) document.getElementById('farm-ie').value = '123.456.789.111';
    if (document.getElementById('farm-telefone')) document.getElementById('farm-telefone').value = '(11) 98765-4321';
    if (document.getElementById('farm-endereco')) document.getElementById('farm-endereco').value = 'Rua das Flores, 123, Centro, São Paulo - SP';
  };

  // Submissão do formulário (RF-U01, RF-U02)
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const razao = document.getElementById('farm-razao').value;
    alert(`Dados da unidade "${razao}" atualizados com sucesso!`);
  });

  // Inicializa o formulário com dados pré-existentes
  carregarDados();
})();