import http.server
import socketserver
import json
import os
import hashlib
import secrets
import copy

PORT = 8080
DATA_DIR = 'data'
DB_FILE = os.path.join(DATA_DIR, 'database.json')

# Armazena tokens de sessão válidos (em memória — reiniciar o servidor invalida todas as sessões)
sessoes_ativas = {}


def hash_senha(senha):
    """Gera hash SHA-256 da senha para comparação segura."""
    return hashlib.sha256(senha.encode('utf-8')).hexdigest()


def carregar_db():
    """Carrega o banco de dados JSON do disco."""
    if os.path.exists(DB_FILE):
        with open(DB_FILE, 'r', encoding='utf-8') as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return {}
    return {}


def salvar_db(db):
    """Salva o banco de dados JSON no disco."""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    with open(DB_FILE, 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2, ensure_ascii=False)


def filtrar_dados_sensiveis(db):
    """Remove campos de senha antes de enviar dados ao cliente."""
    db_seguro = copy.deepcopy(db)
    if 'funcionarios' in db_seguro:
        for func in db_seguro['funcionarios']:
            func.pop('senha', None)
    return db_seguro


class FarmaciaHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Desativa o cache globalmente para o navegador sempre pegar a última versão do JS e CSS
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def _enviar_json(self, status, dados):
        """Envia uma resposta JSON formatada."""
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(dados, ensure_ascii=False).encode('utf-8'))

    def _ler_body(self):
        """Lê e parseia o corpo JSON da requisição."""
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length == 0:
            return {}
        post_data = self.rfile.read(content_length)
        try:
            return json.loads(post_data.decode('utf-8'))
        except (json.JSONDecodeError, UnicodeDecodeError):
            return {}

    def _validar_sessao(self):
        """Verifica se o header X-Auth-Token contém um token de sessão válido."""
        token = self.headers.get('X-Auth-Token', '')
        return token in sessoes_ativas

    def do_GET(self):
        if self.path == '/api/db':
            db = carregar_db()
            db_seguro = filtrar_dados_sensiveis(db)
            self._enviar_json(200, db_seguro)
            return

        return super().do_GET()

    def do_POST(self):
        # ── Endpoint de Autenticação ────────────────────────────────────
        if self.path == '/api/auth':
            dados = self._ler_body()
            usuario = dados.get('usuario', '').strip().lower()
            senha = dados.get('senha', '').strip()

            if not usuario or not senha:
                self._enviar_json(400, {"ok": False, "erro": "Usuário e senha são obrigatórios."})
                return

            db = carregar_db()
            funcionarios = db.get('funcionarios', [])

            # Busca o funcionário pelo login
            senha_hash = hash_senha(senha)
            func_valido = None
            for f in funcionarios:
                if f.get('login', '').lower() == usuario and f.get('senha') == senha_hash and f.get('status') == 'Ativo':
                    func_valido = f
                    break

            if func_valido:
                # Gera token de sessão seguro
                token = secrets.token_hex(32)
                sessoes_ativas[token] = {
                    'login': func_valido['login'],
                    'nome': func_valido['nome'],
                    'perfil': func_valido.get('perfil', 'atendente')
                }
                nome_display = func_valido['nome'].split(' ')[0].upper()
                self._enviar_json(200, {"ok": True, "nome": nome_display, "token": token})
            else:
                self._enviar_json(401, {"ok": False, "erro": "Usuário ou senha incorretos."})
            return

        # ── Endpoint de Gravação no Banco ───────────────────────────────
        if self.path == '/api/db':
            # Exige token de sessão válido para gravação
            if not self._validar_sessao():
                self._enviar_json(403, {"status": "erro", "mensagem": "Sessão inválida. Faça login novamente."})
                return

            new_data = self._ler_body()
            db = carregar_db()

            # Merge das chaves (ex: atualiza só "clientes" ou só "funcionarios")
            db.update(new_data)
            salvar_db(db)

            self._enviar_json(200, {"status": "sucesso"})
            return

        # ── Endpoint de Logout ──────────────────────────────────────────
        if self.path == '/api/logout':
            token = self.headers.get('X-Auth-Token', '')
            sessoes_ativas.pop(token, None)
            self._enviar_json(200, {"status": "deslogado"})
            return

        self.send_response(404)
        self.end_headers()


if __name__ == "__main__":
    # Permite reutilizar a porta se reiniciar rápido
    socketserver.TCPServer.allow_reuse_address = True

    with socketserver.TCPServer(("", PORT), FarmaciaHandler) as httpd:
        print(f"🚀 Servidor da Farmácia rodando na porta {PORT}")
        print(f"👉 Acesse: http://localhost:{PORT}")
        print("Pressione Ctrl+C para finalizar.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor finalizado.")
