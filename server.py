import http.server
import socketserver
import json
import os

PORT = 8080
DATA_DIR = 'data'
DB_FILE = os.path.join(DATA_DIR, 'database.json')

class FarmaciaHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Desativa o cache globalmente para o navegador sempre pegar a última versão do JS e CSS
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def do_GET(self):
        if self.path == '/api/db':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            if os.path.exists(DB_FILE):
                with open(DB_FILE, 'r', encoding='utf-8') as f:
                    self.wfile.write(f.read().encode('utf-8'))
            else:
                self.wfile.write(b'{"funcionarios": []}')
            return
            
        return super().do_GET()

    def do_POST(self):
        if self.path == '/api/db':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                new_data = json.loads(post_data.decode('utf-8'))
            except:
                new_data = {}
                
            db = {}
            if os.path.exists(DB_FILE):
                with open(DB_FILE, 'r', encoding='utf-8') as f:
                    try:
                        db = json.load(f)
                    except:
                        pass
                        
            # Merge das chaves (ex: atualiza só "clientes" ou só "funcionarios")
            db.update(new_data)
            
            if not os.path.exists(DATA_DIR):
                os.makedirs(DATA_DIR)
                
            with open(DB_FILE, 'w', encoding='utf-8') as f:
                json.dump(db, f, indent=2, ensure_ascii=False)
                
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "sucesso"}).encode('utf-8'))
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
