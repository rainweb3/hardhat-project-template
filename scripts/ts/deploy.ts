import { config as dotenvConfig } from "dotenv"
import {
    ethers,
    JsonRpcProvider,
    TransactionReceipt,
    ContractFactory,
    Network,
    Contract,
} from "ethers"
import * as fs from "fs"
import * as path from "path"

dotenvConfig()

// 在文件顶部或单独的 types.ts 中
interface EnhancedTransactionReceipt extends TransactionReceipt {
    effectiveGasPrice?: bigint
}

async function main() {
    console.log("🚀 开始部署合约...\n")

    // ========== 1. 环境变量 ==========
    const ENCRYPTION_PASSWORD = process.env.ENCRYPTION_PASSWORD?.trim()
    const REMOTE_TEST_RPC_URL = process.env.REMOTE_TEST_RPC_URL?.trim()

    if (!ENCRYPTION_PASSWORD) throw new Error("❌ 缺少 ENCRYPTION_PASSWORD")
    if (!REMOTE_TEST_RPC_URL) throw new Error("❌ 缺少 REMOTE_TEST_RPC_URL")

    console.log("🔐 环境变量加载完成")

    // ========== 2. 钱包 ==========
    const encryptedKeyRelativePath = process.env.ENCRYPTED_KEY_PATH
        ? process.env.ENCRYPTED_KEY_PATH.trim() // 环境变量存在时，trim后使用
        : "./scripts/ts/json/encryptedKey.json" // 环境变量不存在时，用默认路径

    const walletPath = path.resolve(encryptedKeyRelativePath)
    if (!fs.existsSync(walletPath)) throw new Error("❌ 钱包文件不存在")

    const encryptedJson = fs.readFileSync(walletPath, "utf8")
    const wallet = await ethers.Wallet.fromEncryptedJson(
        encryptedJson,
        ENCRYPTION_PASSWORD,
    )
    console.log("✅ 钱包已解密")

    // ========== 3. 网络 ==========
    const provider = new JsonRpcProvider(REMOTE_TEST_RPC_URL)
    const signer = wallet.connect(provider)
    const address = await signer.getAddress()
    console.log("👷 部署者地址:", address)

    const network: Network = await provider.getNetwork()
    console.log(
        "🌐 当前网络:",
        network.name,
        "(Chain ID:",
        network.chainId.toString() + ")",
    )

    const balance = await provider.getBalance(address)
    const ethBalance = ethers.formatEther(balance)
    console.log("💰 余额:", ethBalance, "ETH")

    if (balance === 0n) {
        throw new Error("❌ 余额为 0，请先获取测试币")
    }

    // ========== 4. 加载合约 ==========
    const artifactPath = path.resolve(
        "./artifacts/contracts/SimpleStorage.sol/SimpleStorage.json",
    )
    console.log("🔍 正在加载合约编译文件:", artifactPath)
    if (!fs.existsSync(artifactPath)) {
        throw new Error("❌ 编译文件不存在，请先运行: npx hardhat compile")
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"))
    const { abi, bytecode } = artifact

    // 严格类型检查
    if (typeof bytecode !== "string" || !bytecode.startsWith("0x")) {
        throw new Error("❌ 字节码无效")
    }
    if (!Array.isArray(abi)) {
        throw new Error("❌ ABI 必须是数组")
    }

    console.log("📦 合约编译文件加载成功")

    // ========== 5. 部署 ==========
    const factory = new ContractFactory(abi, bytecode, signer)
    console.log("\n🚀 正在部署合约...")

    const feeData = await provider.getFeeData()
    const maxFeePerGas = feeData.maxFeePerGas || ethers.parseUnits("30", "gwei")
    const maxPriorityFeePerGas =
        feeData.maxPriorityFeePerGas || ethers.parseUnits("2", "gwei")

    const contract = await factory.deploy({
        maxFeePerGas,
        maxPriorityFeePerGas,
    })

    const tx = contract.deploymentTransaction()
    if (!tx) throw new Error("❌ 部署交易为空")

    console.log("\n📤 部署交易已发送")
    console.log("📝 交易哈希:", tx.hash)
    console.log("⛽ Max Fee:", ethers.formatUnits(maxFeePerGas, "gwei"), "Gwei")
    console.log(
        "⚡ Priority Fee:",
        ethers.formatUnits(maxPriorityFeePerGas, "gwei"),
        "Gwei",
    )

    // ========== 6. 等待确认 ==========
    console.log("\n⏳ 等待交易上链...")
    const receipt: TransactionReceipt | null = await tx.wait()
    if (!receipt) {
        throw new Error("❌ 交易未上链")
    }
    if (receipt.status !== 1) {
        throw new Error("❌ 交易失败")
    }

    const contractAddress = await contract.getAddress()
    console.log("\n✅ 合约部署成功！")
    console.log("📍 合约地址:", contractAddress)
    console.log("📦 区块号:", receipt.blockNumber)
    console.log("⛽ 消耗 Gas:", receipt.gasUsed.toString())

    // ========== 安全计算交易费用 ==========
    const getEffectiveGasPrice = (receipt: TransactionReceipt): bigint => {
        const enhancedReceipt = receipt as EnhancedTransactionReceipt

        if (typeof enhancedReceipt.effectiveGasPrice === "bigint") {
            return enhancedReceipt.effectiveGasPrice
        }

        if (typeof receipt.gasPrice === "bigint") {
            return receipt.gasPrice
        }

        return ethers.parseUnits("10", "gwei")
    }

    // ✅ 添加调用（修复未使用警告）
    const effectiveGasPrice = getEffectiveGasPrice(receipt)

    console.log(
        "💸 交易费用:",
        ethers.formatEther(receipt.gasUsed * effectiveGasPrice),
        "ETH",
    )

    // ========== 7. 保存地址 ==========
    fs.writeFileSync(
        path.resolve(__dirname, "../contractAddress.txt"),
        contractAddress,
        "utf8",
    )
    console.log("\n💾 合约地址已保存")

    // ========== 8. 验证状态 ==========
    try {
        const deployedContract = new Contract(contractAddress, abi, provider)
        const value = await deployedContract.retrieve()
        console.log("\n🔍 初始值验证:", value.toString())
    } catch (error) {
        console.warn(
            "⚠️  无法读取初始值:",
            error instanceof Error ? error.message : String(error),
        )
    }
}

main()
    .then(() => {
        console.log("\n🎉 部署流程完成\n")
        process.exit(0)
    })
    .catch(err => {
        console.error("\n💥 部署失败:")
        console.error("❌", err instanceof Error ? err.message : String(err))
        process.exit(1)
    })
