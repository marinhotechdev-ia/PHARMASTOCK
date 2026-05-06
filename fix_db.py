import json

with open('data/database.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

# Fix fornecedores
for i, f in enumerate(db.get('fornecedores', [])):
    f['fantasia'] = f.get('nomeFantasia', '')
    f['razao'] = f.get('razaoSocial', '')
    f['ie'] = 'Isento'
    f['endereco'] = 'Rua Genérica, 100'
    f['repNome'] = f.get('representante', '')
    f['repContato'] = '(11) 99999-0000'

# Fix laboratorios
for i, l in enumerate(db.get('laboratorios', [])):
    l['nome'] = l.get('nomeFantasia', '')
    l['vinculados'] = f"{i*3 + 2} medicamentos cadastrados no estoque."

# Fix estoque
import random
for i, p in enumerate(db.get('estoque', [])):
    p['ean'] = f"7891000{str(i).zfill(5)}"
    p['lab'] = "Diversos"
    p['und'] = "Caixa"
    p['atual'] = p.get('quantidade', 0)
    p['min'] = 10
    p['preco'] = p.get('preco', '').replace('R$ ', '').replace(',', '.')
    
with open('data/database.json', 'w', encoding='utf-8') as f:
    json.dump(db, f, indent=2, ensure_ascii=False)
