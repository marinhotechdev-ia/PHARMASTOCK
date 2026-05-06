import json
import os

db = {
  "funcionarios": [
    { "nome": "Ana Paula Ramos", "cpf": "012.345.678-90", "cargo": "Farmacêutica", "perfil": "farmaceutico", "status": "Ativo", "login": "ana.ramos", "telefone": "(11) 91234-5678", "senha": "123" },
    { "nome": "Carlos Mendes", "cpf": "098.765.432-10", "cargo": "Atendente", "perfil": "atendente", "status": "Inativo", "login": "carlos.mendes", "telefone": "(21) 98765-1234", "senha": "123" },
    { "nome": "Beatriz Lima", "cpf": "111.222.333-44", "cargo": "Gerente", "perfil": "administrador", "status": "Ativo", "login": "beatriz.lima", "telefone": "(31) 91111-2222", "senha": "123" },
    { "nome": "Diego Souza", "cpf": "222.333.444-55", "cargo": "Atendente", "perfil": "atendente", "status": "Ativo", "login": "diego.souza", "telefone": "(41) 92222-3333", "senha": "123" },
    { "nome": "Elaine Costa", "cpf": "333.444.555-66", "cargo": "Farmacêutica", "perfil": "farmaceutico", "status": "Ativo", "login": "elaine.costa", "telefone": "(51) 93333-4444", "senha": "123" },
    { "nome": "Felipe Almeida", "cpf": "444.555.666-77", "cargo": "Entregador", "perfil": "atendente", "status": "Ativo", "login": "felipe.almeida", "telefone": "(61) 94444-5555", "senha": "123" },
    { "nome": "Gabriela Santos", "cpf": "555.666.777-88", "cargo": "Caixa", "perfil": "atendente", "status": "Ativo", "login": "gabriela.santos", "telefone": "(71) 95555-6666", "senha": "123" },
    { "nome": "Henrique Pereira", "cpf": "666.777.888-99", "cargo": "Atendente", "perfil": "atendente", "status": "Inativo", "login": "henrique.pereira", "telefone": "(81) 96666-7777", "senha": "123" },
    { "nome": "Isabela Martins", "cpf": "777.888.999-00", "cargo": "Farmacêutica", "perfil": "farmaceutico", "status": "Ativo", "login": "isabela.martins", "telefone": "(91) 97777-8888", "senha": "123" },
    { "nome": "João Carvalho", "cpf": "888.999.000-11", "cargo": "Supervisor", "perfil": "administrador", "status": "Ativo", "login": "joao.carvalho", "telefone": "(11) 98888-9999", "senha": "123" }
  ],
  "clientes": [
    { "nome": "Mariana Costa", "cpf": "123.456.789-00", "telefone": "(11) 99876-5432", "status": "Ativo", "email": "mariana.costa@email.com", "nascimento": "1985-04-15", "endereco": "Rua das Flores, 123", "uso": "Losartana 50mg" },
    { "nome": "Roberto Almeida", "cpf": "098.765.432-10", "telefone": "(21) 98765-1234", "status": "Inativo", "email": "roberto.alm@email.com", "nascimento": "1978-10-22", "endereco": "Av. Principal, 400", "uso": "Nenhum" },
    { "nome": "Carlos Eduardo", "cpf": "111.222.333-44", "telefone": "(31) 91111-2222", "status": "Ativo", "email": "carlos@email.com", "nascimento": "1990-01-10", "endereco": "Rua A, 10", "uso": "Omeprazol" },
    { "nome": "Fernanda Silva", "cpf": "222.333.444-55", "telefone": "(41) 92222-3333", "status": "Ativo", "email": "fernanda@email.com", "nascimento": "1988-05-20", "endereco": "Rua B, 20", "uso": "Nenhum" },
    { "nome": "Lucas Pereira", "cpf": "333.444.555-66", "telefone": "(51) 93333-4444", "status": "Inativo", "email": "lucas@email.com", "nascimento": "1975-08-30", "endereco": "Rua C, 30", "uso": "AAS 100mg" },
    { "nome": "Juliana Santos", "cpf": "444.555.666-77", "telefone": "(61) 94444-5555", "status": "Ativo", "email": "juliana@email.com", "nascimento": "1995-12-05", "endereco": "Rua D, 40", "uso": "Nenhum" },
    { "nome": "Marcos Oliveira", "cpf": "555.666.777-88", "telefone": "(71) 95555-6666", "status": "Ativo", "email": "marcos@email.com", "nascimento": "1982-03-18", "endereco": "Rua E, 50", "uso": "Insulina" },
    { "nome": "Aline Souza", "cpf": "666.777.888-99", "telefone": "(81) 96666-7777", "status": "Ativo", "email": "aline@email.com", "nascimento": "1992-07-25", "endereco": "Rua F, 60", "uso": "Nenhum" },
    { "nome": "Ricardo Lima", "cpf": "777.888.999-00", "telefone": "(91) 97777-8888", "status": "Inativo", "email": "ricardo@email.com", "nascimento": "1960-11-12", "endereco": "Rua G, 70", "uso": "Sinvastatina" },
    { "nome": "Camila Ribeiro", "cpf": "888.999.000-11", "telefone": "(11) 98888-9999", "status": "Ativo", "email": "camila@email.com", "nascimento": "2000-02-28", "endereco": "Rua H, 80", "uso": "Nenhum" }
  ],
  "fornecedores": [
    { "nomeFantasia": "MedSinal Distribuidora", "cnpj": "12.345.678/0001-90", "telefone": "(11) 3000-1234", "status": "Ativo", "razaoSocial": "MedSinal Comercial Ltda", "email": "contato@medsinal.com", "representante": "Roberto Neves", "prazoEntrega": "2 dias" },
    { "nomeFantasia": "FarmaLog Brasil", "cnpj": "98.765.432/0001-10", "telefone": "(21) 4000-5678", "status": "Inativo", "razaoSocial": "FarmaLog Logística S/A", "email": "vendas@farmalog.com.br", "representante": "Cláudia Silva", "prazoEntrega": "5 dias" },
    { "nomeFantasia": "DistriFarma SC", "cnpj": "11.111.111/0001-11", "telefone": "(48) 3333-1111", "status": "Ativo", "razaoSocial": "DistriFarma SC Ltda", "email": "sc@distrifarma.com", "representante": "Marcos Antônio", "prazoEntrega": "1 dia" },
    { "nomeFantasia": "BioPharma SP", "cnpj": "22.222.222/0001-22", "telefone": "(11) 3333-2222", "status": "Ativo", "razaoSocial": "BioPharma Suprimentos Médicos", "email": "sp@biopharma.com", "representante": "Ana Carolina", "prazoEntrega": "3 dias" },
    { "nomeFantasia": "MegaMeds RJ", "cnpj": "33.333.333/0001-33", "telefone": "(21) 3333-3333", "status": "Ativo", "razaoSocial": "MegaMeds Distribuição S/A", "email": "rj@megameds.com", "representante": "Bruno Costa", "prazoEntrega": "4 dias" },
    { "nomeFantasia": "SulFarma RS", "cnpj": "44.444.444/0001-44", "telefone": "(51) 3333-4444", "status": "Inativo", "razaoSocial": "SulFarma Comércio Varejista", "email": "rs@sulfarma.com", "representante": "Carla Oliveira", "prazoEntrega": "7 dias" },
    { "nomeFantasia": "NorteFarma AM", "cnpj": "55.555.555/0001-55", "telefone": "(92) 3333-5555", "status": "Ativo", "razaoSocial": "NorteFarma Suprimentos", "email": "am@nortefarma.com", "representante": "Daniel Souza", "prazoEntrega": "10 dias" },
    { "nomeFantasia": "CentroOeste Med", "cnpj": "66.666.666/0001-66", "telefone": "(62) 3333-6666", "status": "Ativo", "razaoSocial": "CentroOeste Med Ltda", "email": "go@centrooeste.com", "representante": "Eduardo Mendes", "prazoEntrega": "2 dias" },
    { "nomeFantasia": "NordestePharma", "cnpj": "77.777.777/0001-77", "telefone": "(81) 3333-7777", "status": "Ativo", "razaoSocial": "NordestePharma Comércio S/A", "email": "pe@nordestepharma.com", "representante": "Fernanda Lima", "prazoEntrega": "5 dias" },
    { "nomeFantasia": "MinasMed MG", "cnpj": "88.888.888/0001-88", "telefone": "(31) 3333-8888", "status": "Ativo", "razaoSocial": "MinasMed Suprimentos Médicos", "email": "mg@minasmed.com", "representante": "Gustavo Santos", "prazoEntrega": "3 dias" }
  ],
  "laboratorios": [
    { "nomeFantasia": "Aché Laboratórios", "cnpj": "60.659.463/0001-91", "telefone": "0800 701 6900", "status": "Ativo", "razaoSocial": "Aché Laboratórios Farmacêuticos S.A.", "email": "contato@ache.com.br", "responsavel": "Dr. Carlos Eduardo", "site": "www.ache.com.br" },
    { "nomeFantasia": "Eurofarma", "cnpj": "61.190.096/0001-92", "telefone": "0800 704 3876", "status": "Ativo", "razaoSocial": "Eurofarma Laboratórios S.A.", "email": "eurofarma@eurofarma.com.br", "responsavel": "Dra. Maria Luiza", "site": "www.eurofarma.com.br" },
    { "nomeFantasia": "EMS", "cnpj": "57.507.378/0001-01", "telefone": "0800 191 914", "status": "Ativo", "razaoSocial": "EMS S/A", "email": "sac@ems.com.br", "responsavel": "Dr. João Silva", "site": "www.ems.com.br" },
    { "nomeFantasia": "Neo Química", "cnpj": "02.508.825/0001-40", "telefone": "0800 979 9900", "status": "Ativo", "razaoSocial": "Brainfarma Indústria Química", "email": "sac@neoquimica.com.br", "responsavel": "Dra. Ana Costa", "site": "www.neoquimica.com.br" },
    { "nomeFantasia": "Medley", "cnpj": "50.929.710/0001-79", "telefone": "0800 729 8000", "status": "Ativo", "razaoSocial": "Medley Farmacêutica Ltda.", "email": "sac@medley.com.br", "responsavel": "Dr. Roberto Neves", "site": "www.medley.com.br" },
    { "nomeFantasia": "Teuto", "cnpj": "17.159.229/0001-76", "telefone": "0800 622 282", "status": "Inativo", "razaoSocial": "Laboratório Teuto Brasileiro S/A", "email": "sac@teuto.com.br", "responsavel": "Dra. Cláudia Silva", "site": "www.teuto.com.br" },
    { "nomeFantasia": "Cimed", "cnpj": "02.814.497/0001-07", "telefone": "0800 704 4647", "status": "Ativo", "razaoSocial": "Cimed Indústria de Medicamentos", "email": "sac@cimed.com.br", "responsavel": "Dr. Marcos Antônio", "site": "www.cimed.com.br" },
    { "nomeFantasia": "Bayer", "cnpj": "18.459.628/0001-15", "telefone": "0800 702 1241", "status": "Ativo", "razaoSocial": "Bayer S.A.", "email": "sac@bayer.com.br", "responsavel": "Dra. Ana Carolina", "site": "www.bayer.com.br" },
    { "nomeFantasia": "Sanofi", "cnpj": "02.685.377/0001-57", "telefone": "0800 703 0014", "status": "Ativo", "razaoSocial": "Sanofi-Aventis Farmacêutica", "email": "sac@sanofi.com.br", "responsavel": "Dr. Bruno Costa", "site": "www.sanofi.com.br" },
    { "nomeFantasia": "Novartis", "cnpj": "56.994.502/0001-30", "telefone": "0800 888 3003", "status": "Ativo", "razaoSocial": "Novartis Biociências S.A.", "email": "sac@novartis.com.br", "responsavel": "Dra. Carla Oliveira", "site": "www.novartis.com.br" }
  ],
  "estoque": [
    { "codigo": "1001", "nome": "Losartana Potássica 50mg", "categoria": "Medicamento", "quantidade": 150, "preco": "R$ 15,90", "status": "Em Estoque", "lote": "L2023-01", "validade": "2025-10" },
    { "codigo": "1002", "nome": "Dorflex (Dipirona, Orfenadrina)", "categoria": "Medicamento", "quantidade": 80, "preco": "R$ 18,50", "status": "Em Estoque", "lote": "L2023-02", "validade": "2025-11" },
    { "codigo": "1003", "nome": "Neosaldina 30 Drágeas", "categoria": "Medicamento", "quantidade": 15, "preco": "R$ 22,90", "status": "Estoque Baixo", "lote": "L2023-03", "validade": "2024-05" },
    { "codigo": "1004", "nome": "Tylenol (Paracetamol) 750mg", "categoria": "Medicamento", "quantidade": 200, "preco": "R$ 19,90", "status": "Em Estoque", "lote": "L2023-04", "validade": "2026-01" },
    { "codigo": "1005", "nome": "Dipirona Monoidratada 1g", "categoria": "Medicamento", "quantidade": 300, "preco": "R$ 12,50", "status": "Em Estoque", "lote": "L2023-05", "validade": "2025-12" },
    { "codigo": "1006", "nome": "Rivotril (Clonazepam) 2mg", "categoria": "Controlado", "quantidade": 45, "preco": "R$ 25,00", "status": "Em Estoque", "lote": "L2023-06", "validade": "2024-08" },
    { "codigo": "1007", "nome": "Omeprazol 20mg", "categoria": "Medicamento", "quantidade": 120, "preco": "R$ 14,90", "status": "Em Estoque", "lote": "L2023-07", "validade": "2025-09" },
    { "codigo": "1008", "nome": "Pantoprazol 40mg", "categoria": "Medicamento", "quantidade": 90, "preco": "R$ 35,90", "status": "Em Estoque", "lote": "L2023-08", "validade": "2025-07" },
    { "codigo": "1009", "nome": "Amoxicilina 500mg", "categoria": "Antibiótico", "quantidade": 0, "preco": "R$ 28,00", "status": "Esgotado", "lote": "L2023-09", "validade": "2024-02" },
    { "codigo": "1010", "nome": "Azitromicina 500mg", "categoria": "Antibiótico", "quantidade": 5, "preco": "R$ 32,50", "status": "Estoque Baixo", "lote": "L2023-10", "validade": "2024-06" },
    { "codigo": "1011", "nome": "Ibuprofeno 400mg", "categoria": "Medicamento", "quantidade": 250, "preco": "R$ 16,00", "status": "Em Estoque", "lote": "L2023-11", "validade": "2026-03" },
    { "codigo": "1012", "nome": "Paracetamol 500mg", "categoria": "Medicamento", "quantidade": 400, "preco": "R$ 9,90", "status": "Em Estoque", "lote": "L2023-12", "validade": "2026-05" },
    { "codigo": "1013", "nome": "Luftal (Simeticona) Gotas", "categoria": "Medicamento", "quantidade": 60, "preco": "R$ 21,50", "status": "Em Estoque", "lote": "L2023-13", "validade": "2025-02" },
    { "codigo": "1014", "nome": "Captopril 25mg", "categoria": "Medicamento", "quantidade": 180, "preco": "R$ 8,50", "status": "Em Estoque", "lote": "L2023-14", "validade": "2025-08" },
    { "codigo": "1015", "nome": "Atenolol 50mg", "categoria": "Medicamento", "quantidade": 140, "preco": "R$ 11,90", "status": "Em Estoque", "lote": "L2023-15", "validade": "2025-10" },
    { "codigo": "1016", "nome": "Glifage XR (Metformina) 500mg", "categoria": "Medicamento", "quantidade": 110, "preco": "R$ 22,00", "status": "Em Estoque", "lote": "L2023-16", "validade": "2025-04" },
    { "codigo": "1017", "nome": "Amaryl (Glimepirida) 2mg", "categoria": "Medicamento", "quantidade": 75, "preco": "R$ 45,00", "status": "Em Estoque", "lote": "L2023-17", "validade": "2025-01" },
    { "codigo": "1018", "nome": "Puran T4 (Levotiroxina) 50mcg", "categoria": "Medicamento", "quantidade": 130, "preco": "R$ 17,90", "status": "Em Estoque", "lote": "L2023-18", "validade": "2026-02" },
    { "codigo": "1019", "nome": "Clonazepam Gotas 2,5mg/mL", "categoria": "Controlado", "quantidade": 50, "preco": "R$ 14,00", "status": "Em Estoque", "lote": "L2023-19", "validade": "2024-11" },
    { "codigo": "1020", "nome": "Valium (Diazepam) 10mg", "categoria": "Controlado", "quantidade": 30, "preco": "R$ 29,90", "status": "Em Estoque", "lote": "L2023-20", "validade": "2024-09" },
    { "codigo": "1021", "nome": "Claritin (Loratadina) 10mg", "categoria": "Medicamento", "quantidade": 85, "preco": "R$ 38,50", "status": "Em Estoque", "lote": "L2023-21", "validade": "2025-06" },
    { "codigo": "1022", "nome": "Polaramine (Dexclorfeniramina)", "categoria": "Medicamento", "quantidade": 95, "preco": "R$ 24,90", "status": "Em Estoque", "lote": "L2023-22", "validade": "2025-03" },
    { "codigo": "1023", "nome": "Meticorten (Prednisona) 20mg", "categoria": "Medicamento", "quantidade": 65, "preco": "R$ 42,00", "status": "Em Estoque", "lote": "L2023-23", "validade": "2024-12" },
    { "codigo": "1024", "nome": "Nimesulida 100mg", "categoria": "Medicamento", "quantidade": 300, "preco": "R$ 10,50", "status": "Em Estoque", "lote": "L2023-24", "validade": "2026-04" },
    { "codigo": "1025", "nome": "Cataflam (Diclofenaco) 50mg", "categoria": "Medicamento", "quantidade": 120, "preco": "R$ 34,90", "status": "Em Estoque", "lote": "L2023-25", "validade": "2025-05" },
    { "codigo": "1026", "nome": "Lexapro (Escitalopram) 10mg", "categoria": "Controlado", "quantidade": 40, "preco": "R$ 89,90", "status": "Em Estoque", "lote": "L2023-26", "validade": "2024-10" },
    { "codigo": "1027", "nome": "Zoloft (Sertralina) 50mg", "categoria": "Controlado", "quantidade": 55, "preco": "R$ 75,00", "status": "Em Estoque", "lote": "L2023-27", "validade": "2025-01" },
    { "codigo": "1028", "nome": "Prozac (Fluoxetina) 20mg", "categoria": "Controlado", "quantidade": 70, "preco": "R$ 68,50", "status": "Em Estoque", "lote": "L2023-28", "validade": "2025-08" },
    { "codigo": "1029", "nome": "Keflex (Cefalexina) 500mg", "categoria": "Antibiótico", "quantidade": 8, "preco": "R$ 49,90", "status": "Estoque Baixo", "lote": "L2023-29", "validade": "2024-07" },
    { "codigo": "1030", "nome": "Buscopan Composto", "categoria": "Medicamento", "quantidade": 180, "preco": "R$ 26,00", "status": "Em Estoque", "lote": "L2023-30", "validade": "2025-11" }
  ]
}

with open(os.path.join('data', 'database.json'), 'w', encoding='utf-8') as f:
    json.dump(db, f, indent=2, ensure_ascii=False)
print("DB gerado com sucesso!")
