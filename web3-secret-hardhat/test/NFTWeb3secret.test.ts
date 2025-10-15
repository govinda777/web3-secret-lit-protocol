import { expect } from "chai";
import { ethers } from "hardhat";
import { NFTWeb3secret } from "../typechain-types";

describe("NFTWeb3secret", function () {
  let nft: NFTWeb3secret;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy do contrato
    const NFTWeb3secretFactory = await ethers.getContractFactory(
      "NFTWeb3secret"
    );
    nft = (await NFTWeb3secretFactory.deploy(owner.address)) as NFTWeb3secret;
    await nft.waitForDeployment();
  });

  it("✅ deve mintar uma NFT, armazenar o segredo e associar o tokenURI corretamente", async function () {
    const cid = "bafybeihdwdemoCID12345example";
    const tokenURI = "ipfs://bafybeighdemoMetadataExample123/metadata.json";

    // Mint válido (somente o owner pode)
    const tx = await nft.connect(owner).mint(cid, tokenURI);
    await tx.wait();

    // Busca o segredo armazenado
    const secret = await nft.getSecret(1);

    // Validações
    expect(secret.cid).to.equal(cid);
    expect(secret.minter).to.equal(owner.address);

    // Valida tokenURI e owner
    expect(await nft.tokenURI(1)).to.equal(tokenURI);
    expect(await nft.ownerOf(1)).to.equal(owner.address);
  });

  it("❌ deve rejeitar mintagem por um usuário que não seja o owner", async function () {
    const cid = "bafyCIDNotAllowed";
    const tokenURI = "ipfs://metadata.json";

    await expect(
      nft.connect(addr1).mint(cid, tokenURI)
    ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
  });

  it("🔓 deve permitir que o owner veja o segredo", async function () {
    const cid = "bafySecret123";
    const tokenURI = "ipfs://meta123";

    await nft.connect(owner).mint(cid, tokenURI);
    const secret = await nft.connect(owner).getSecret(1);

    expect(secret.cid).to.equal(cid);
    expect(secret.minter).to.equal(owner.address);
  });

  it("🔓 deve permitir que o minter veja o segredo", async function () {
    const cid = "bafySecretForMinter";
    const tokenURI = "ipfs://metaMinter";

    await nft.connect(owner).mint(cid, tokenURI);
    const secret = await nft.connect(owner).getSecret(1);

    // Como o owner é também o minter, funciona igual
    expect(secret.minter).to.equal(owner.address);
  });

  it("🔒 deve negar acesso ao segredo para quem não for owner nem minter", async function () {
    const cid = "bafyPrivateSecret";
    const tokenURI = "ipfs://metaSecret";

    await nft.connect(owner).mint(cid, tokenURI);

    await expect(nft.connect(addr1).getSecret(1)).to.be.revertedWith(
      "Acesso negado"
    );
  });

  it("📜 deve retornar corretamente o minter original", async function () {
    const cid = "bafyMinterCheck";
    const tokenURI = "ipfs://metaMinterCheck";

    await nft.connect(owner).mint(cid, tokenURI);
    const minter = await nft.getMinter(1);

    expect(minter).to.equal(owner.address);
  });

  it("🔎 deve verificar corretamente se um usuário pode acessar o segredo", async function () {
    const cid = "bafyAccessCheck";
    const tokenURI = "ipfs://metaAccessCheck";

    await nft.connect(owner).mint(cid, tokenURI);

    expect(await nft.canAccessSecret(1, owner.address)).to.equal(true);
    expect(await nft.canAccessSecret(1, addr2.address)).to.equal(false);
  });

  it("⚠️ deve lançar erro ao tentar acessar um token inexistente", async function () {
    await expect(nft.getSecret(999)).to.be.revertedWith("Token inexistente");
    await expect(nft.getMinter(999)).to.be.revertedWith("Token inexistente");
  });
});
