import json, random, datetime

produtos = [
    "Paracetamol 750mg", "Ibuprofeno 400mg", "Amoxicilina 500mg", "Dipirona 1g", 
    "Losartana 50mg", "Omeprazol 20mg", "Neosaldina", "Dorflex"
]

with open('data/database.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

movs = []
for i in range(20):
    is_entrada = random.choice([True, False])
    tipo = "ENTRADA" if is_entrada else "SAIDA"
    qtd = random.randint(5, 50)
    
    # Datas espalhadas pelos últimos 5 dias
    dt = datetime.datetime.now() - datetime.timedelta(days=random.randint(0, 5), hours=random.randint(0, 23), minutes=random.randint(0, 59))
    
    motivo = "Compra do Fornecedor" if is_entrada else random.choice(["Venda Balcão", "Vencimento", "Avaria"])
    
    mov = {
        "produto": random.choice(produtos),
        "tipo": tipo,
        "motivo": motivo,
        "lote": f"L-{random.randint(1000, 9999)}",
        "validade": (dt + datetime.timedelta(days=365)).strftime("%Y-%m-%d"),
        "qtd": qtd,
        "dataHora": dt.isoformat()
    }
    movs.append(mov)

# Ordenar da mais recente para a mais antiga
movs.sort(key=lambda x: x["dataHora"], reverse=True)

db["movimentos"] = movs

with open('data/database.json', 'w', encoding='utf-8') as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print("20 Movimentações criadas no banco de dados com sucesso!")
