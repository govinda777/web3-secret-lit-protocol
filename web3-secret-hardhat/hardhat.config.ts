import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },

  networks: {
    // 🌐 Rede local (Hardhat Node)
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: [process.env.LOCAL_PRIVATE_KEY as string],
    },

    // 🔗 Rede Sepolia
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL as string,
      accounts: [process.env.SEPOLIA_PRIVATE_KEY as string],
    },
  },
};

export default config;
