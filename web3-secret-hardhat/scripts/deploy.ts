import { ethers } from "hardhat";

// Função principal assíncrona que orquestra o deploy do contrato.
async function main() {
  console.log("🚀 Deploying NFTWeb3secret...");

  // O primeiro signer geralmente é usado como deployer (dono inicial do contrato).
  const [deployer] = await ethers.getSigners();

  console.log("👤 Deployer address:", deployer.address);
  console.log(
    "💰 Balance:",
    (await deployer.provider!.getBalance(deployer.address)).toString()
  );

  // Cria uma “Contract Factory” — uma instância que sabe como implantar o contrato NFTWeb3secret.
  // Essa factory vem do bytecode e do ABI compilados pelo Hardhat.
  const NFTWeb3secret = await ethers.getContractFactory("NFTWeb3secret");

  // Realiza o deploy do contrato, passando o endereço do deployer como argumento do construtor.
  // Isso define o deployer como dono inicial (`Ownable(initialOwner)` no contrato).
  const nft = await NFTWeb3secret.deploy(deployer.address);

  // Aguarda a confirmação completa do deploy na rede.
  await nft.waitForDeployment();

  // Obtém o endereço do contrato já implantado.
  // Esse é o endereço público do contrato na blockchain (para usar no frontend/backend).
  const contractAddress = await nft.getAddress();

  console.log(`✅ Contract deployed successfully at: ${contractAddress}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
