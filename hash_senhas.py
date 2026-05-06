"""
Script único para converter senhas em texto plano para hash SHA-256 no database.json.
Também adiciona o usuário 'admin' como funcionário do sistema.
Execute APENAS UMA VEZ. Depois discard este arquivo.
"""
import json
import hashlib
import os

DB_FILE = os.path.join('data', 'database.json')

def hash_senha(senha):
    return hashlib.sha256(senha.encode('utf-8')).hexdigest()

with open(DB_FILE, 'r', encoding='utf-8') as f:
    db = json.load(f)

# Verificar se o admin já existe
funcionarios = db.get('funcionarios', [])
admin_existe = any(f.get('login', '').lower() == 'admin' for f in funcionarios)

if not admin_existe:
    # Adicionar o admin como primeiro funcionário
    admin = {
        "nome": "Administrador",
        "cpf": "000.000.000-00",
        "cargo": "Administrador Geral",
        "perfil": "administrador",
        "status": "Ativo",
        "login": "admin",
        "telefone": "(00) 00000-0000",
        "senha": "ffff@2026"  # Será hasheada abaixo
    }
    funcionarios.insert(0, admin)
    print("✅ Usuário admin adicionado ao banco de dados.")

# Hashear TODAS as senhas
senhas_conhecidas = {}
for func in funcionarios:
    senha_atual = func.get('senha', '')
    # Verifica se já é um hash (64 caracteres hexadecimais)
    if len(senha_atual) == 64 and all(c in '0123456789abcdef' for c in senha_atual):
        print(f"  ⏭️  {func['login']} — senha já está em hash, pulando.")
        continue
    
    senha_hash = hash_senha(senha_atual)
    senhas_conhecidas[func['login']] = f"{senha_atual} -> {senha_hash[:12]}..."
    func['senha'] = senha_hash

db['funcionarios'] = funcionarios

with open(DB_FILE, 'w', encoding='utf-8') as f:
    json.dump(db, f, indent=2, ensure_ascii=False)

print("\n🔒 Senhas convertidas para SHA-256:")
for login, info in senhas_conhecidas.items():
    print(f"  ✅ {login}: {info}")
print(f"\n📦 Total de funcionários: {len(funcionarios)}")
print("✅ Banco de dados atualizado com sucesso!")
