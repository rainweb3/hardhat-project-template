// scripts/decryptKey.ts
import { config as dotenvConfig } from "dotenv"
import { ethers } from "ethers"
import { readFile } from "fs/promises"
import * as path from "path"

// 加载 .env 文件
dotenvConfig()

// ✅ 明确检查 process.env
if (!process.env.ENCRYPTION_PASSWORD) {
    console.error("❌ 请在 .env 中设置 ENCRYPTION_PASSWORD")
    process.exit(1)
}

const ENCRYPTION_PASSWORD = process.env.ENCRYPTION_PASSWORD.trim()

async function decryptPrivateKey(): Promise<void> {
    console.log("🔓 开始解密钱包文件...")

    const encryptedKeyRelativePath = process.env.ENCRYPTED_KEY_PATH
        ? process.env.ENCRYPTED_KEY_PATH.trim() // 环境变量存在时，trim后使用
        : "./scripts/ts/json/encryptedKey.json" // 环境变量不存在时，用默认路径
    // 1. 检查文件是否存在
    const fullPath = path.resolve(encryptedKeyRelativePath)
    let encryptedJson: string
    try {
        encryptedJson = await readFile(fullPath, "utf8")
    } catch (rawError) {
        const error = rawError as NodeJS.ErrnoException
        if (error.code === "ENOENT") {
            console.error(`❌ 文件未找到: ${fullPath}`)
            console.error(`请先运行: npx ts-node ${encryptedKeyRelativePath}`)
        } else {
            console.error(`❌ 读取文件失败: ${error.message}`)
        }
        process.exit(1)
    }

    // 2. 解密（✅ 使用 process.env 来源的密码）
    let wallet
    try {
        wallet = await ethers.Wallet.fromEncryptedJson(
            encryptedJson,
            ENCRYPTION_PASSWORD,
        )
    } catch (rawError) {
        const message = getErrorMessage(rawError)
        if (
            message.toLowerCase().includes("password") ||
            message.includes("checksum")
        ) {
            console.error("❌ 解密失败：密码错误")
        } else if (message.includes("invalid json")) {
            console.error("❌ 解密失败：加密文件格式损坏")
        } else {
            console.error("❌ 解密失败:", message)
        }
        process.exit(1)
    }

    // 3. 输出结果
    const address = await wallet.getAddress()
    console.log("✅ 解密成功！")
    console.log(`💼 关联地址: ${address}`)

    if ("privateKey" in wallet) {
        console.log(`🔐 私钥: ${(wallet as { privateKey: string }).privateKey}`)
    } else {
        console.warn("⚠️  无法导出私钥（本流程不应出现）")
    }
}

function getErrorMessage(error: unknown): string {
    return typeof error === "string"
        ? error
        : error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : "未知错误"
}

// 执行
decryptPrivateKey()
    .then(() => {
        console.log("🔐 解密流程完成。")
        process.exit(0)
    })
    .catch(rawError => {
        console.error("❌ 脚本异常:", getErrorMessage(rawError))
        process.exit(1)
    })
