"use client";

import { useEffect, useState } from "react";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { encryptString, decryptToString } from "@lit-protocol/encryption";
import { ethers } from "ethers";
import { SiweMessage } from "siwe";

// ------------------ CONFIGURAÇÕES DO CONTRATO ------------------

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT as string;

// ABI (Application Binary Interface) define quais funções e eventos o contrato expõe
const CONTRACT_ABI = [
  "event SecretMinted(uint256 indexed tokenId, address indexed minter, string cid)",
  "function mint(string cid, string tokenURI) public returns (uint256)",
  "function canAccessSecret(uint256 tokenId, address user) public view returns (bool)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
];

// ABI reduzida para apenas a função `canAccessSecret` (usada pelo Lit Protocol)
const CAN_ACCESS_SECRET_ABI = {
  constant: true,
  inputs: [
    { name: "tokenId", type: "uint256" }, // token a verificar
    { name: "user", type: "address" }, // endereço do usuário
  ],
  name: "canAccessSecret", // nome da função no contrato
  outputs: [{ name: "", type: "bool" }], // retorna verdadeiro ou falso
  stateMutability: "view", // não altera estado on-chain
  type: "function",
};

export default function Home() {
  const [litClient, setLitClient] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [provider, setProvider] = useState<any>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  const [secret, setSecret] = useState("");
  const [status, setStatus] = useState("");
  const [decryptedText, setDecryptedText] = useState("");
  const [tokenIdForDecrypt, setTokenIdForDecrypt] = useState("");
  const [lastTokenId, setLastTokenId] = useState<number | null>(null);
  const [minting, setMinting] = useState(false);
  const [decrypting, setDecrypting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalMsg, setModalMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // Atualiza status para o usuário
        setStatus("🧠 Inicializando Lit Client...");

        // Conecta ao nó do Lit Protocol (rede 'datil-test')
        const client = new LitNodeClient({ litNetwork: "datil-test" });
        await client.connect();

        // Armazena cliente conectado no estado
        setLitClient(client);
        console.log("✅ Lit Client conectado!");
        setStatus("✅ Lit Client conectado!");
      } catch (err) {
        // Em caso de falha, loga erro e atualiza status
        console.error("❌ Erro inicialização:", err);
        setStatus("❌ Falha ao inicializar Lit");
      }
    })();
  }, []);

  // ------------------ CONEXÃO DA WALLET ------------------

  const connectWallet = async () => {
    // Verifica se MetaMask está instalada
    if (!window.ethereum) {
      alert("MetaMask não detectada!");
      return;
    }
    try {
      // Cria provider do ethers conectado ao MetaMask
      const web3Provider = new ethers.BrowserProvider(window.ethereum);

      // Solicita permissão para acessar as contas do usuário
      await web3Provider.send("eth_requestAccounts", []);

      // Obtém o "signer" (usuário atual da MetaMask)
      const signer = await web3Provider.getSigner();

      // Extrai o endereço da carteira
      const address = await signer.getAddress();
      console.log("👛 Wallet conectada:", address);

      // Atualiza estados React
      setProvider(web3Provider);
      setWalletAddress(address);
      // Cria instância do contrato com o signer (para chamadas que exigem assinatura)
      setContract(new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer));
      setStatus(`✅ Carteira conectada: ${address}`);
    } catch (err) {
      console.error("❌ Erro ao conectar carteira:", err);
      setStatus("❌ Falha ao conectar MetaMask");
    }
  };

  // ------------------ DESCONECTAR WALLET ------------------

  const disconnectWallet = async () => {
    try {
      // Desconecta cliente Lit se estiver ativo
      if (litClient?.disconnect) await litClient.disconnect();

      // Reseta estados da aplicação
      setLitClient(null);
      setWalletAddress("");
      setProvider(null);
      setContract(null);
      setDecryptedText("");
      setSecret("");
      setStatus("👋 Carteira desconectada");
      console.log("👋 Carteira desconectada manualmente.");

      // Tenta revogar permissões concedidas à dApp (nem todos os browsers suportam)
      try {
        if (typeof window !== "undefined" && window.ethereum) {
          await window.ethereum.request({
            method: "wallet_revokePermissions",
            params: [{ eth_accounts: {} }],
          });
        }
        console.log("🔒 Permissões revogadas no MetaMask");
      } catch (e) {
        console.warn("⚠️ Revogação não suportada:", e);
      }

      // Recarrega a página para forçar o MetaMask a pedir reconexão
      window.location.reload();
    } catch (err) {
      console.error("❌ Erro ao desconectar:", err);
    }
  };

  // ------------------ HELPERS ------------------

  // Constrói as condições de contrato usadas pelo Lit Protocol
  // para garantir que apenas o dono ou autorizado possa descriptografar
  const buildEvmContractConditions = (tokenId: number) => [
    {
      conditionType: "evmContract", // tipo de condição (chamada EVM)
      chain: "sepolia", // rede utilizada
      contractAddress: CONTRACT_ADDRESS, // contrato NFT
      functionName: "canAccessSecret", // função que valida acesso
      functionParams: [String(tokenId), ":userAddress"], // parâmetros (token + usuário atual)
      functionAbi: CAN_ACCESS_SECRET_ABI, // definição da função
      returnValueTest: { key: "", comparator: "=", value: "true" }, // valida se retorno é true
    },
  ];

  // Gera uma assinatura SIWE (Sign-In With Ethereum)
  // usada pelo Lit Protocol para autenticar o usuário antes da descriptografia
  const getAuthSig = async () => {
    const signer = await provider.getSigner();
    const domain = window.location.host;
    const origin = window.location.origin;
    // Define validade de 1h para a assinatura
    const expiration = new Date(Date.now() + 3600 * 1000).toISOString();

    // Cria mensagem SIWE (Sign-In With Ethereum)
    const siwe = new SiweMessage({
      domain,
      address: walletAddress,
      statement: "Assinar acesso ao Lit Protocol",
      uri: origin,
      version: "1",
      chainId: 11155111,
      expirationTime: expiration,
    });

    // Prepara a mensagem para exibição e assinatura
    const msg = siwe.prepareMessage();
    const sig = await signer.signMessage(msg);
    console.log("📝 Mensagem SIWE assinada:", msg);

    // Retorna o objeto de autenticação para o Lit
    return {
      sig,
      derivedVia: "web3.eth.personal.sign",
      signedMessage: msg,
      address: walletAddress,
    };
  };

  // ------------------ CRIPTOGRAFAR E MINTAR ------------------
  const handleEncryptAndMint = async () => {
    try {
      setMinting(true);
      setDecryptedText("");
      setStatus("🚀 Iniciando fluxo...");

      // Verifica se cliente Lit e contrato estão prontos
      if (!litClient || !contract) throw new Error("Dependências não prontas");
      if (!secret.trim()) throw new Error("Digite o segredo");

      // Inicia mint no contrato NFT
      console.log("🪄 Iniciando mint...");
      const tokenURI = `data:,encrypted_pending`; // placeholder de metadata
      const tx = await contract.mint("", tokenURI); // chama mint()
      const rc = await tx.wait(); // espera confirmação on-chain

      // Busca o evento `SecretMinted` emitido na transação
      const event = rc.logs
        .map((log: any) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((e: any) => e?.name === "SecretMinted");

      if (!event) throw new Error("Evento SecretMinted não encontrado");

      // Extrai o tokenId do evento
      const tokenId = Number(event.args.tokenId);
      console.log("🎟️ Novo tokenId:", tokenId);

      // Criptografa o segredo usando as condições do contrato
      console.log("🔒 Criptografando segredo...");
      const evmCond = buildEvmContractConditions(tokenId);
      const encrypted = await encryptString(
        { dataToEncrypt: secret, evmContractConditions: evmCond },
        litClient
      );

      // Cria metadata local (ainda não salva on-chain)
      const meta = {
        name: `WhatsApp Key #${tokenId}`,
        description: "Somente quem tem acesso pode descriptografar.",
        properties: { encrypted },
      };

      // Salva metadata no localStorage
      localStorage.setItem(`meta_${tokenId}`, JSON.stringify(meta));

      // Atualiza estados visuais
      setLastTokenId(tokenId);
      setTokenIdForDecrypt(String(tokenId));
      setStatus("✅ NFT criado e segredo salvo localmente!");
    } catch (err: any) {
      console.error("❌ Erro:", err);
      setStatus(`❌ Erro: ${err.message}`);
    } finally {
      setMinting(false);
    }
  };

  // ------------------ DESCRIPTOGRAFAR SEGREDO ------------------

  const handleDecrypt = async () => {
    try {
      setDecrypting(true);
      setDecryptedText("");

      // Verifica dependências
      if (!litClient || !contract) throw new Error("Dependências não prontas");

      // Valida tokenId informado
      const tokenId = Number(tokenIdForDecrypt);
      if (Number.isNaN(tokenId)) throw new Error("tokenId inválido");

      // Obtém tokenURI do contrato
      const uri = await contract.tokenURI(tokenId);
      let meta;

      // Caso o tokenURI seja local (data URI)
      if (uri.startsWith("data:,")) {
        const stored = localStorage.getItem(`meta_${tokenId}`);
        if (!stored) throw new Error("Metadata local não encontrado");
        meta = JSON.parse(stored);
      } else if (uri.startsWith("data:application/json;base64,")) {
        // Decodifica metadata armazenada em Base64
        const decoded = JSON.parse(
          atob(uri.replace("data:application/json;base64,", ""))
        );
        meta = decoded;
      } else {
        throw new Error("Formato inválido de tokenURI");
      }

      // Extrai objeto `encrypted` com os dados criptografados
      const encrypted = meta?.properties?.encrypted;
      if (!encrypted?.ciphertext || !encrypted?.dataToEncryptHash)
        throw new Error("Campo 'encrypted' inválido no metadata");

      setStatus("🔐 Descriptografando...");

      // Gera assinatura de autenticação SIWE
      const authSig = await getAuthSig();

      // Usa Lit Protocol para descriptografar com base nas condições do contrato
      const decrypted = await decryptToString(
        {
          evmContractConditions: buildEvmContractConditions(tokenId),
          chain: "sepolia",
          ciphertext: encrypted.ciphertext,
          dataToEncryptHash: encrypted.dataToEncryptHash,
          authSig,
        },
        litClient
      );

      // Exibe resultado descriptografado
      setDecryptedText(decrypted);
      setStatus("✅ Segredo revelado!");
    } catch (err: any) {
      console.error("❌ Erro decrypt:", err);

      // Trata erros de permissão (usuário não autorizado)
      const msg = String(err.message || err.toString());
      if (
        msg.includes("NodeAccessControlConditionsReturnedNotAuthorized") ||
        msg.includes("not permitted to access this content")
      ) {
        setModalMsg(
          "🚫 Você não tem permissão para visualizar este segredo. Apenas o proprietário ou criador do NFT pode descriptografá-lo."
        );
        setShowModal(true);
      } else {
        setStatus(`❌ Erro decrypt: ${msg}`);
      }
    } finally {
      setDecrypting(false);
    }
  };

  // ------------------ UI ------------------

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center text-white bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900 via-black to-gray-950 p-6 space-y-6 overflow-hidden">
      {/* Fundo animado */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 animate-pulse"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-purple-700/10 via-pink-500/5 to-blue-600/10 blur-3xl animate-gradient-x"></div>

      <h1 className="text-4xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 drop-shadow-[0_0_10px_rgba(255,0,255,0.4)]">
        ⚡ Web3Secret NFT
      </h1>
      <p className="text-sm text-gray-400">
        powered by Lit Protocol + MetaMask
      </p>

      {!walletAddress ? (
        <button
          onClick={connectWallet}
          className="px-8 py-3 text-lg bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 rounded-xl shadow-[0_0_15px_rgba(255,0,255,0.4)] hover:shadow-[0_0_25px_rgba(255,0,255,0.7)] transition-all animate-pulse"
        >
          Conectar Carteira 🔮
        </button>
      ) : (
        <div className="w-full max-w-xl backdrop-blur-lg bg-white/5 border border-purple-500/30 rounded-2xl p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              ✅ {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
            <button
              onClick={disconnectWallet}
              className="text-xs text-red-400 hover:text-red-600 transition"
            >
              Desconectar
            </button>
          </div>

          <textarea
            placeholder="Digite seu segredo..."
            className="w-full h-24 bg-black/60 text-purple-100 p-3 rounded-xl border border-purple-500/40 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/40 outline-none transition-all"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
          />

          <button
            onClick={handleEncryptAndMint}
            disabled={minting}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:opacity-90 transition-all font-semibold text-white shadow-[0_0_15px_rgba(255,0,255,0.4)]"
          >
            {minting ? "✨ Processando..." : "🪄 Mintar NFT com Segredo"}
          </button>

          {lastTokenId !== null && (
            <p className="text-center text-sm text-green-400">
              ✅ NFT criado! tokenId #{lastTokenId}
            </p>
          )}

          <div className="p-4 bg-black/60 rounded-xl border border-purple-500/30">
            <h2 className="font-semibold mb-2 text-pink-400">
              🔓 Recuperar segredo
            </h2>
            <input
              type="number"
              className="w-full bg-black/60 p-2 rounded-lg mb-3 border border-pink-500/30 focus:border-pink-500 outline-none text-white"
              placeholder="tokenId"
              value={tokenIdForDecrypt}
              onChange={(e) => setTokenIdForDecrypt(e.target.value)}
            />
            <button
              onClick={handleDecrypt}
              disabled={decrypting}
              className="w-full py-2 bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl hover:opacity-90 transition-all font-semibold text-white shadow-[0_0_10px_rgba(0,255,150,0.5)]"
            >
              {decrypting ? "🔍 Verificando..." : "Descriptografar"}
            </button>
          </div>

          {decryptedText && (
            <div className="bg-black/50 border border-green-500/30 p-3 mt-4 rounded-lg text-green-300 font-mono break-words animate-fadeIn">
              {decryptedText}
            </div>
          )}
        </div>
      )}

      <div className="absolute bottom-4 text-sm text-gray-400 animate-pulse">
        {status}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-red-500 rounded-2xl p-6 max-w-md text-center shadow-lg animate-fadeIn">
            <h2 className="text-xl font-bold mb-3 text-red-400">
              ❌ Acesso Negado
            </h2>
            <p className="text-gray-300 mb-4">{modalMsg}</p>
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
