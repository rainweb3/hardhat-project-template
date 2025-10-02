import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import { config as dotenvConfig } from "dotenv" // ✅ 重命名为 dotenvConfig

dotenvConfig() // 加载 .env 文件

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.8",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        sepolia: {
            url: process.env.REMOTE_TEST_RPC_URL || "",
            accounts: process.env.REMOTE_TEST_PRIVATE_KEY
                ? [process.env.REMOTE_TEST_PRIVATE_KEY]
                : [],
        },
        localhost: {
            url: "http://127.0.0.1:8545",
        },
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY || "",
    },
    sourcify: {
        enabled: false,
    },
}

export default config
