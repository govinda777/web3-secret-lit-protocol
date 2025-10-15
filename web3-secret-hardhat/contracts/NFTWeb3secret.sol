// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title NFTWeb3secret
/// @notice NFT que vincula segredos criptografados no IPFS a cada token.
/// @dev Compatível com OpenZeppelin 5.x e pronto para integração com Lit Protocol.
contract NFTWeb3secret is ERC721URIStorage, Ownable {
    struct Secret {
        string cid; // CID do arquivo no IPFS (dados criptografados)
        address minter; // Endereço do criador da NFT
    }

    // Contador interno que mantém o ID do último token criado.
    uint256 private _tokenIds;

    // Mapeia cada tokenId para seu segredo correspondente.
    mapping(uint256 => Secret) private secrets;

    // Evento emitido quando uma nova NFT secreta é criada.
    event SecretMinted(
        uint256 indexed tokenId,
        address indexed minter,
        string cid
    );

    // Construtor que define o nome e símbolo da coleção, além do owner inicial.
    constructor(
        address initialOwner
    ) ERC721("Web3SecretNFT", "W3S") Ownable(initialOwner) {}

    /// @notice Cria uma nova NFT com um segredo associado.
    /// @param _cid CID do arquivo criptografado no IPFS.
    /// @param _tokenURI URL do metadata (JSON da NFT).
    function mint(
        string memory _cid,
        string memory _tokenURI
    ) public onlyOwner returns (uint256) {
        // Incrementa o contador de IDs de token.
        _tokenIds++;

        // Armazena o novo tokenId.
        uint256 newTokenId = _tokenIds;

        // Cria a NFT e atribui a propriedade ao remetente (msg.sender).
        _safeMint(msg.sender, newTokenId);

        // Define o tokenURI (metadado JSON no IPFS ou servidor).
        _setTokenURI(newTokenId, _tokenURI);

        // Associa o segredo (CID + minter) ao token recém-criado.
        secrets[newTokenId] = Secret({cid: _cid, minter: msg.sender});

        // Emite evento informando o mint da NFT secreta.
        emit SecretMinted(newTokenId, msg.sender, _cid);

        // Retorna o ID do token recém-criado.
        return newTokenId;
    }

    /// @notice Retorna o segredo (apenas para owner/minter).
    /// @param tokenId ID do token cujo segredo será consultado.
    function getSecret(uint256 tokenId) public view returns (Secret memory) {
        // Garante que o token realmente exista.
        require(_ownerOf(tokenId) != address(0), "Token inexistente");

        // Obtém o endereço do dono atual.
        address owner = _ownerOf(tokenId);

        // Permite acesso apenas ao dono atual ou ao criador original.
        require(
            msg.sender == owner || msg.sender == secrets[tokenId].minter,
            "Acesso negado"
        );

        // Retorna a estrutura Secret correspondente.
        return secrets[tokenId];
    }

    /// @notice Retorna o minter original da NFT.
    /// @param tokenId ID do token consultado.
    function getMinter(uint256 tokenId) public view returns (address) {
        // Garante que o token existe.
        require(_ownerOf(tokenId) != address(0), "Token inexistente");

        // Retorna o endereço do criador original.
        return secrets[tokenId].minter;
    }

    /// @notice Verifica se um endereço pode acessar o segredo.
    /// @param tokenId ID do token consultado.
    /// @param user Endereço que deseja verificar permissão.
    /// @return Retorna verdadeiro se o user for dono ou criador da NFT.
    function canAccessSecret(
        uint256 tokenId,
        address user
    ) public view returns (bool) {
        // Obtém o dono e o criador do token.
        address owner = _ownerOf(tokenId);
        address minter = secrets[tokenId].minter;

        // Retorna verdadeiro se o endereço for autorizado.
        return (user == owner || user == minter);
    }
}
