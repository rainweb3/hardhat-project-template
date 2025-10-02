// utils/path-config.ts
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

// 🌟 所有路径配置集中在这里
const PATHS = {
    ENCRYPTED_KEY: "./scripts/ts/json/encryptedKey.json", // 默认相对路径
    DEPLOY_LOGS: "./logs/deploy.log",
    CONFIG: "./config/app.json",
    // 可以添加更多...
} as const

// 🔧 解析路径的通用函数
function resolvePath(relativeOrAbsolute: string): string {
    // 如果是绝对路径，直接返回
    if (resolve(relativeOrAbsolute) === relativeOrAbsolute) {
        return relativeOrAbsolute
    }
    // 否则是相对路径，基于项目根目录解析
    return resolve(getProjectRoot(), relativeOrAbsolute)
}

// 🏠 获取项目根目录（假设 utils 在项目内）
function getProjectRoot(): string {
    // const __filename = fileURLToPath(import.meta.url)
    const __filename = fileURLToPath("")
    const __dirname = dirname(__filename)
    return resolve(__dirname, "../") // 根据实际层级调整
}

// 📦 导出所有路径（经过环境变量覆盖后）
export const PathConfig = {
    ENCRYPTED_KEY: () =>
        resolvePath(
            process.env.ENCRYPTED_KEY_PATH?.trim() || PATHS.ENCRYPTED_KEY,
        ),
    DEPLOY_LOGS: () =>
        resolvePath(process.env.DEPLOY_LOGS_PATH?.trim() || PATHS.DEPLOY_LOGS),
    CONFIG: () => resolvePath(process.env.CONFIG_PATH?.trim() || PATHS.CONFIG),
} as const

// 🔁 导出解析函数（供自定义路径使用）
export { resolvePath }
