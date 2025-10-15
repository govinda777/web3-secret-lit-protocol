# 🔐 Web3 Secret — NFT com Segredos Criptografados (Lit Protocol + Hardhat)

Projeto que permite **mintar NFTs que armazenam segredos criptografados no IPFS**, integrando **Lit Protocol**, **Ethereum (Sepolia)** e **Hardhat**.

Cada NFT gerada possui:
- 🔒 Um **segredo criptografado** salvo no IPFS  
- 🧾 Um **metadata JSON** referenciado no `tokenURI`  
- 👤 Permissão de acesso apenas para o **owner** ou **minter** original  
- 🧠 Suporte total ao **Lit Protocol** para controle descentralizado de acesso  

---

## 📁 Estrutura principal

```
web3-secret-hardhat/
│
├── contracts/
│   └── NFTWeb3secret.sol        # Contrato principal (ERC721 com segredos)
│
├── scripts/
│   └── deploy.ts                # Script de deploy do contrato
│
├── test/
│   └── NFTWeb3secret.test.ts    # Testes automatizados (Hardhat + Chai)
│
├── .env.example                 # Exemplo de configuração de ambiente
├── hardhat.config.ts            # Configuração de compilação e redes
├── package.json
└── tsconfig.json
```

---

## ⚙️ 1. Instalação

Clone o repositório e instale as dependências:

```bash
cd web3-secret-hardhat
npm install
```

---

## 🔑 2. Variáveis de ambiente

Copie o arquivo de exemplo e configure suas chaves:

```bash
cp .env.example .env
```

Edite o `.env` com os seguintes valores:

```bash
# ===========================
# Localhost
# ===========================
LOCAL_PRIVATE_KEY=

# ===========================
# Sepolia
# ===========================
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/<SEU_INFURA_ID>
SEPOLIA_PRIVATE_KEY=<sua_private_key_de_teste_sem_0x>

# ===========================
# (opcional, após deploy)
# ===========================
CONTRACT_ADDRESS=<endereco_gerado_pelo_deploy>
```

> ⚠️ **Importante:** nunca use a private key da sua carteira principal.  
> Gere uma nova conta apenas para testes (Sepolia faucet: https://sepoliafaucet.com).

---

## 🧱 3. Compilar o contrato

```bash
npx hardhat compile
```

Isso gera os artefatos em `artifacts/` e `typechain-types/`.

---

## 🧪 4. Executar os testes locais

Os testes garantem que:
- A NFT é mintada corretamente  
- O segredo é armazenado no mapping  
- O tokenURI e owner são corretos  
- Apenas owner/minter têm acesso ao segredo  

```bash
npx hardhat test
```

Saída esperada:
```
 NFTWeb3secret
    ✔ ✅ deve mintar uma NFT, armazenar o segredo e associar o tokenURI corretamente
    ✔ ❌ deve rejeitar mintagem por um usuário que não seja o owner
    ✔ 🔓 deve permitir que o owner veja o segredo
    ✔ 🔓 deve permitir que o minter veja o segredo
    ✔ 🔒 deve negar acesso ao segredo para quem não for owner nem minter
    ✔ 📜 deve retornar corretamente o minter original
    ✔ 🔎 deve verificar corretamente se um usuário pode acessar o segredo
    ✔ ⚠️ deve lançar erro ao tentar acessar um token inexistente
```

---

## 🌐 5. Rodar nó local do Hardhat

Para testar deploys e interações sem gastar gas:

```bash
npx hardhat node
```

Isso iniciará um nó Ethereum local com 20 contas pré-carregadas.

---

## 🚀 6. Fazer deploy local

Em outro terminal:

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

Exemplo de saída:
```
✅ Contrato NFTWeb3secret deployado em: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

Copie o endereço e adicione no `.env`:
```bash
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

---

## ☁️ 7. Deploy na rede Sepolia

Quando quiser subir o contrato para uma rede pública de testes:

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

Certifique-se de:
- Ter ETH de teste (Sepolia Faucet)
- Ter configurado `SEPOLIA_RPC_URL` e `SEPOLIA_PRIVATE_KEY`

---

## 🧩 8. Interagindo com o contrato

Você pode usar o **Hardhat Console** para interagir diretamente:

```bash
npx hardhat console --network localhost
```

Exemplo:

```js
const nft = await ethers.getContractAt("NFTWeb3secret", process.env.CONTRACT_ADDRESS);
await nft.mint("bafybeiexemploCID", "ipfs://metadata123.json");
```

---

## 🧠 9. Fluxo resumido

```mermaid
graph LR
A[Usuário] --> B[Hardhat Console]
B --> C[Contrato NFTWeb3secret]
C --> D[Mint NFT com segredo (CID IPFS)]
D --> E[Token ERC721 com acesso restrito]
```

---

## 🔒 10. Segurança e boas práticas

- Nunca commite seu `.env`  
- Use contas de teste (nunca mainnet)  
- Sempre valide `CONTRACT_ADDRESS` antes de interagir  
- Pode usar `hardhat verify` para verificar o contrato na Etherscan (Sepolia)

---

## 🧰 11. Comandos úteis

| Comando | Descrição |
|----------|------------|
| `npx hardhat compile` | Compila os contratos |
| `npx hardhat test` | Executa os testes |
| `npx hardhat node` | Inicia o nó local |
| `npx hardhat run scripts/deploy.ts --network localhost` | Faz o deploy local |
| `npx hardhat run scripts/deploy.ts --network sepolia` | Faz o deploy na Sepolia |
| `npx hardhat console --network sepolia` | Console interativo |

---

## 🧠 Tecnologias utilizadas

- **Solidity 0.8.28**
- **TypeScript**
- **Hardhat**
- **Ethers.js**
- **Chai + Mocha**

---

## 👨‍💻 Autor

**Matheus Banqueiro Lima**  
💼 Desenvolvedor Full Cycle  
🚀 Criador do projeto **Web3 Secret NFT**

---

💬 _“Segredos merecem ser protegidos — até mesmo na blockchain.”_
