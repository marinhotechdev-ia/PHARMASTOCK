// =============================================================
// ROTEADOR — SPA manual
//
// Como funciona:
//   Cada item do menu tem um atributo data-pagina="nome".
//   Ao clicar, o roteador faz fetch("pages/nome.html") e injeta
//   o resultado dentro da <section class="conteudo-principal__area">.
//
// Estrutura de arquivos esperada:
//   menu.html         ← este esqueleto (sempre presente)
//   script.js         ← este arquivo
//   menu_style.css
//   pages/
//     clientes.html
//     funcionarios.html
//     fornecedores.html
//     laboratorios.html
//     farmacia.html
//     estoque.html
//     movimentos.html
//     vendas.html
//     alertas.html
//     relatorios.html
//     configuracoes.html
// =============================================================
// ROTEADOR, AUTENTICAÇÃO E SEGURANÇA
// =============================================================

// Verifica se o usuário passou pela tela de login, caso contrário bloqueia acesso direto
if (sessionStorage.getItem('farmacia_auth') !== 'true' || !sessionStorage.getItem('farmacia_token')) {
  window.location.replace('index.html');
}

// ── Função global de sanitização contra XSS ───────────────────
// Deve ser usada em todo innerHTML que injeta dados do banco.
window.escapeHtml = function(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// ── Helper global para obter headers de autenticação ──────────
window.getAuthHeaders = function() {
  return {
    'Content-Type': 'application/json',
    'X-Auth-Token': sessionStorage.getItem('farmacia_token') || ''
  };
};

document.addEventListener('DOMContentLoaded', () => {

  // Atualiza o nome do usuário no cabeçalho
  const elNomeUsuario = document.querySelector('.cabecalho__usuario-nome');
  if (elNomeUsuario) {
    const nm = sessionStorage.getItem('farmacia_user_nome');
    if (nm) elNomeUsuario.textContent = `OLÁ ${nm}!`;
  }

  // ── Elementos principais ──────────────────────────────────────
  const areaConteudo = document.querySelector('.conteudo-principal__area');
  const btnCadastros = document.querySelector('[aria-controls="submenu-cadastros"]');
  const submenuCadastros = document.getElementById('submenu-cadastros');

  // ── Roteador: carrega um arquivo HTML dentro da área ──────────
  async function carregarPagina(nomePagina) {
    try {
      const resposta = await fetch(`pages/${nomePagina}.html`);

      if (!resposta.ok) {
        throw new Error(`Página "${nomePagina}" não encontrada (${resposta.status})`);
      }

      const html = await resposta.text();
      areaConteudo.innerHTML = html;

      // Re-executa os scripts injetados dinamicamente (necessário para SPA)
      const scripts = areaConteudo.querySelectorAll('script');
      scripts.forEach(scriptAntigo => {
        const scriptNovo = document.createElement('script');
        Array.from(scriptAntigo.attributes).forEach(attr => {
            if (attr.name !== 'src') {
                scriptNovo.setAttribute(attr.name, attr.value);
            }
        });
        if (scriptAntigo.src) {
            // Evita cache forte do navegador adicionando timestamp
            const rawSrc = scriptAntigo.getAttribute('src');
            scriptNovo.src = rawSrc.split('?')[0] + '?v=' + new Date().getTime();
        }
        scriptNovo.textContent = scriptAntigo.textContent;
        scriptAntigo.parentNode.replaceChild(scriptNovo, scriptAntigo);
      });

    } catch (erro) {
      // Mostra mensagem amigável dentro da área em vez de travar tudo
      areaConteudo.innerHTML = `
        <div style="padding: 2rem; color: #c0392b;">
          <strong>Erro ao carregar a página:</strong> ${erro.message}
        </div>
      `;
      console.error(erro);
    }
  }

  // ── Marca o botão/link ativo visualmente ─────────────────────
  function marcarAtivo(elementoClicado) {
    // Remove --ativo de todos os botões do menu
    document.querySelectorAll('.menu-lateral__btn').forEach(btn => {
      btn.classList.remove('menu-lateral__btn--ativo');
    });
    // Remove --ativo de todos os links do submenu
    document.querySelectorAll('.submenu__link').forEach(link => {
      link.classList.remove('submenu__link--ativo');
    });

    // Adiciona --ativo no elemento clicado
    if (elementoClicado.classList.contains('menu-lateral__btn')) {
      elementoClicado.classList.add('menu-lateral__btn--ativo');
    } else if (elementoClicado.classList.contains('submenu__link')) {
      elementoClicado.classList.add('submenu__link--ativo');
    }
  }

  // ── Submenu de Cadastros (toggle) ────────────────────────────
  if (btnCadastros && submenuCadastros) {
    btnCadastros.addEventListener('click', () => {
      const estaAberto = submenuCadastros.classList.toggle('visivel');
      btnCadastros.setAttribute('aria-expanded', estaAberto);
      marcarAtivo(btnCadastros);
    });
  }

  // ── Links do submenu (Clientes, Funcionários, etc.) ───────────
  document.querySelectorAll('.submenu__link[data-pagina]').forEach(link => {
    link.addEventListener('click', (evento) => {
      evento.preventDefault(); // evita o # ir pro topo da página
      const pagina = link.dataset.pagina;
      marcarAtivo(link);
      carregarPagina(pagina);
    });
  });

  // ── Botões diretos do menu (Estoque, Vendas, etc.) ───────────
  document.querySelectorAll('.menu-lateral__btn[data-pagina]').forEach(btn => {
    btn.addEventListener('click', () => {
      // Fecha o submenu de cadastros se estiver aberto
      submenuCadastros?.classList.remove('visivel');
      btnCadastros?.setAttribute('aria-expanded', 'false');

      const pagina = btn.dataset.pagina;
      marcarAtivo(btn);
      carregarPagina(pagina);
    });
  });

  // ── Menu Dropdown do Perfil ──────────────────────────────────
  const btnPerfil = document.getElementById('btn-perfil');
  const dropdownPerfil = document.getElementById('perfil-dropdown');

  if (btnPerfil && dropdownPerfil) {
    // Abre/fecha ao clicar no avatar
    btnPerfil.addEventListener('click', (e) => {
      e.stopPropagation();
      const estaOculto = dropdownPerfil.hidden;
      dropdownPerfil.hidden = !estaOculto;
      btnPerfil.setAttribute('aria-expanded', estaOculto);
    });

    // Fecha ao clicar fora do dropdown
    document.addEventListener('click', (e) => {
      if (!dropdownPerfil.hidden && !e.target.closest('#perfil-container')) {
        dropdownPerfil.hidden = true;
        btnPerfil.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ── Botão de Logoff (Sair) ───────────────────────────────────
  const btnLogoff = document.getElementById('btn-logoff');
  if (btnLogoff) {
    btnLogoff.addEventListener('click', async () => {
      // Invalida o token no servidor
      try {
        await fetch('/api/logout', {
          method: 'POST',
          headers: window.getAuthHeaders()
        });
      } catch (e) {
        // Ignora erro de rede no logout
      }
      sessionStorage.removeItem('farmacia_auth');
      sessionStorage.removeItem('farmacia_user_nome');
      sessionStorage.removeItem('farmacia_token');
      window.location.replace('index.html');
    });
  }

  // ── Carregar uma página inicial por padrão ───────────────────
  const btnInicial = document.querySelector('.menu-lateral__btn[data-pagina="relatorios"]');
  if (btnInicial) {
    btnInicial.click(); // Simula o clique para marcar como ativo e carregar a página
  }

});