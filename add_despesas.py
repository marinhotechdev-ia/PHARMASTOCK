import json, datetime, random

with open('data/database.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

vendas = db.get("vendas", [])

# Generate 3 despesas totaling -3000
for i in range(3):
    dt = datetime.datetime.now() - datetime.timedelta(days=random.randint(0, 10))
    v = {
        "id": f"D-200{i+1}",
        "data": dt.strftime("%Y-%m-%d"),
        "cliente": ["Pagamento de Fornecedor", "Conta de Luz", "Aluguel da Loja"][i],
        "itens": 1,
        "total": -1000.00
    }
    vendas.append(v)

vendas.sort(key=lambda x: x["data"], reverse=True)
db["vendas"] = vendas

with open('data/database.json', 'w', encoding='utf-8') as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print("3 Despesas adicionadas com sucesso!")
