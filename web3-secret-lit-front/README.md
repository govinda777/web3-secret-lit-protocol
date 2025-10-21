# ⚡ Web3Secret NFT

Aplicação Web3 para criar NFTs com segredos criptografados usando **Lit Protocol** e **MetaMask**.  
Permite que apenas o dono ou usuários autorizados possam descriptografar e visualizar o conteúdo do NFT.

---

## 🔹 Tecnologias utilizadas

- [Next.js](https://nextjs.org/) (React)
- [TypeScript](https://www.typescriptlang.org/)
- [Lit Protocol](https://litprotocol.com/) para criptografia baseada em condições de contrato
- [ethers.js](https://docs.ethers.io/v6/) para interagir com contratos Ethereum
- [SIWE (Sign-In With Ethereum)](https://docs.login.xyz/siwe) para autenticação
- MetaMask para conexão da carteira

---

## ⚙️ Funcionalidades

- Conectar e desconectar MetaMask
- Criar NFTs com segredos criptografados
- Condições on-chain para acesso a segredos (usando função `canAccessSecret` do contrato)
- Descriptografar segredos se o usuário tiver permissão
- Interface visual com TailwindCSS

---


Acesse `http://localhost:3000` no seu navegador e conecte sua MetaMask.

---

🔑 Executando o projeto

1. Crie um arquivo .env.local na raiz do projeto e defina a variável do contrato:

```bash
NEXT_PUBLIC_CONTRACT=0xSeuContratoNFT
```
2. Instale dependencias e rode

```bash
npm install
npm run dev
```
---

## ⚠️ Observações

- Certifique-se de que a MetaMask está conectada à rede correta (Sepolia no exemplo).
- Segredos criptografados são salvos no `localStorage` enquanto a metadata completa ainda não é salva on-chain.
- Erros de acesso ou permissões serão exibidos em um modal com mensagem detalhada.

---
## 🔄 Fluxo de criação e acesso ao NFT secreto

```mermaid
flowchart TD
    A[Usuário abre a página] --> B{Carteira MetaMask conectada?}
    B -- Não --> C[Solicitar conexão MetaMask]
    C --> D[Usuário autoriza acesso]
    D --> E[MetaMask retorna endereço da carteira]
    B -- Sim --> E

    E --> F[Usuário digita segredo]
    F --> G[Criptografar segredo com Lit Protocol]
    G --> H[Gerar condições on-chain: canAccessSecret]
    H --> I[Mintar NFT via contrato: mint tokenURI]
    I --> J[Evento SecretMinted emitido]
    J --> K[Salvar metadata local ou no IPFS]

    %% Descriptografia
    L[Usuário informa tokenId] --> M[Recupera tokenURI do contrato]
    M --> N[Obter objeto encrypted da metadata]
    N --> O[Gerar assinatura SIWE via MetaMask]
    O --> P[Enviar para Lit Protocol para decrypt]
    P --> Q{Usuário autorizado?}
    Q -- Sim --> R[Segredo descriptografado é exibido]
    Q -- Não --> S[Mostrar modal Acesso negado]
