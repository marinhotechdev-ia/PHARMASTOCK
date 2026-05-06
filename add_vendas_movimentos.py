import json, random, datetime

produtos = ["Paracetamol 750mg", "Ibuprofeno 400mg", "Amoxicilina 500mg", "Dipirona 1g"]

with open('data/database.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

vendas = []
movs = []

total_revenue = 0
target_revenue = 20000.00

for i in range(19):
    amount = round(random.uniform(500, 1500), 2)
    total_revenue += amount
    
    dt = datetime.datetime.now() - datetime.timedelta(days=random.randint(0, 29), hours=random.randint(0, 23))
    itens = random.randint(1, 10)
    
    v = {
        "id": f"V-{1001 + i}",
        "data": dt.strftime("%Y-%m-%d"),
        "cliente": "Cliente Balcão",
        "itens": itens,
        "total": amount
    }
    vendas.append(v)
    
    m = {
        "produto": random.choice(produtos),
        "tipo": "SAIDA",
        "motivo": "Venda Balcão",
        "lote": f"L-{random.randint(1000, 9999)}",
        "validade": "2025-10-10",
        "qtd": itens,
        "dataHora": dt.isoformat()
    }
    movs.append(m)

last_amount = round(target_revenue - total_revenue, 2)
dt = datetime.datetime.now()
vendas.append({
    "id": f"V-{1001 + 19}",
    "data": dt.strftime("%Y-%m-%d"),
    "cliente": "Cliente Ouro",
    "itens": 15,
    "total": last_amount
})
movs.append({
    "produto": "Amoxicilina 500mg",
    "tipo": "SAIDA",
    "motivo": "Venda Especial",
    "lote": "L-9999",
    "validade": "2025-12-31",
    "qtd": 15,
    "dataHora": dt.isoformat()
})

vendas.sort(key=lambda x: x["data"], reverse=True)
movs.sort(key=lambda x: x["dataHora"], reverse=True)

db["vendas"] = vendas
db["movimentos"] = movs

with open('data/database.json', 'w', encoding='utf-8') as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print("20 Vendas e Movimentações adicionadas totalizando R$ 20.000,00!")
