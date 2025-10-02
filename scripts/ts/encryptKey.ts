// scripts/encryptKey.ts
import { config as dotenvConfig } from "dotenv"
import { ethers } from "ethers"
import { writeFile } from "fs/promises"

dotenvConfig()

const { REMOTE_TEST_PRIVATE_KEY, ENCRYPTION_PASSWORD } = process.env

if (!REMOTE_TEST_PRIVATE_KEY) {
    throw new Error("❌ 请设置 REMOTE_TEST_PRIVATE_KEY")
}
if (!ENCRYPTION_PASSWORD) {
    throw new Error("❌ 请设置 ENCRYPTION_PASSWORD")
}

let privateKey = REMOTE_TEST_PRIVATE_KEY.trim()
if (
    (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
    (privateKey.startsWith("'") && privateKey.endsWith("'"))
) {
    privateKey = privateKey.slice(1, -1)
}
if (!privateKey.startsWith("0x")) {
    throw new Error("❌ 私钥必须以 '0x' 开头")
}
if (privateKey.length !== 66) {
    throw new Error(`❌ 私钥长度必须为 66 字符（实际: ${privateKey.length}）`)
}
if (!/^0x[0-9a-fA-F]{64}$/i.test(privateKey)) {
    throw new Error("❌ 私钥必须是 0x 后跟 64 个十六进制字符")
}

async function encryptPrivateKey(): Promise<void> {
    try {
        const wallet = new ethers.Wallet(privateKey)
        const address = wallet.address
        console.log(`✅ 私钥验证通过 - 地址: ${address}`)

        const encryptedJson = await wallet.encrypt(ENCRYPTION_PASSWORD!.trim())

        const encryptedKeyRelativePath = process.env.ENCRYPTED_KEY_PATH
            ? process.env.ENCRYPTED_KEY_PATH.trim() // 环境变量存在时，trim后使用
            : "./scripts/ts/json/encryptedKey.json" // 环境变量不存在时，用默认路径

        await writeFile(encryptedKeyRelativePath, encryptedJson, "utf8")
        console.log(`✅ 加密成功！文件保存至: ${encryptedKeyRelativePath}`)
    } catch (rawError) {
        const message = isErrorWithMessage(rawError)
            ? rawError.message
            : String(rawError)
        console.error("❌ 加密失败:", message)
        process.exit(1)
    }
}

// 类型守卫：安全处理未知错误
function isErrorWithMessage(error: unknown): error is { message: string } {
    return typeof error === "object" && error !== null && "message" in error
}

encryptPrivateKey().catch(rawError => {
    const message = isErrorWithMessage(rawError)
        ? rawError.message
        : String(rawError)
    console.error("❌ 脚本异常:", message)
    process.exit(1)
})
