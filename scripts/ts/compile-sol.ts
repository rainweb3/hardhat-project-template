// scripts/ts/compile-sol.ts
import fs from "fs"
import path from "path"
import solc from "solc"

// ====== 配置区 ======
const DEFAULT_SOLC_VERSION = "0.8.8"
const OUTPUT_DIR = path.join(__dirname, "..", "..", "artifacts", "compiled")
// ===================

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

function help(): void {
    console.log(`
Usage: npx ts-node scripts/ts/compile-sol.ts <SolidityFile.sol> [options]

Options:
  --version, -v <version>   Specify Solidity version (default: ${DEFAULT_SOLC_VERSION})
  --optimize, -o            Enable optimizer (default: true)
  --runs <n>                Set optimizer runs (default: 200)
  --help, -h                Show this help

Example:
  npx ts-node scripts/ts/compile-sol.ts contracts/SimpleStorage.sol
  npx ts-node scripts/ts/compile-sol.ts contracts/Token.sol --version 0.8.20
`)
    process.exit(0)
}

// 解析命令行参数
const args = process.argv.slice(2)
if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    help()
}

const filePath = args[0]
let solcVersion = DEFAULT_SOLC_VERSION
let optimize = true
let runs = 200

for (let i = 1; i < args.length; i++) {
    if (args[i] === "--version" || args[i] === "-v") {
        solcVersion = args[++i]
    } else if (args[i] === "--optimize" || args[i] === "-o") {
        optimize = true
    } else if (args[i] === "--runs") {
        const runsStr = args[++i]
        runs = parseInt(runsStr, 10)
        if (isNaN(runs)) {
            console.error("❌ Invalid value for --runs: must be a number")
            process.exit(1)
        }
    }
}

// 检查文件是否存在
if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`)
    process.exit(1)
}

// 读取源码
const source = fs.readFileSync(filePath, "utf8")
const fileName = path.basename(filePath)
const contractName = path.parse(fileName).name // 更安全地提取文件名（支持 .sol.sol）

console.log(`🔨 Compiling ${fileName} with solc v${solcVersion}...`)

// 设置编译输入
const input = {
    language: "Solidity",
    sources: {
        [fileName]: {
            content: source,
        },
    },
    settings: {
        outputSelection: {
            "*": {
                "*": ["*"], // 输出所有信息
            },
        },
        optimizer: {
            enabled: optimize,
            runs: runs,
        },
    },
}

// 获取指定版本的 solc 编译器（可选：支持多版本）
// 注意：当前 `solc` 包是固定版本，如需动态加载其他版本，需使用 `solc/wrapper`
const compiled = solc.compile(JSON.stringify(input))
const output = JSON.parse(compiled)

// 检查编译错误
if (output.errors) {
    const errors = output.errors.filter(
        (e: { severity: string }) => e.severity === "error",
    )
    if (errors.length > 0) {
        console.error("❌ Compilation failed:")
        errors.forEach((err: { formattedMessage: string }) =>
            console.error(err.formattedMessage),
        )
        process.exit(1)
    }
}

// 提取合约
if (!output.contracts || !output.contracts[fileName]) {
    console.error("❌ No contracts found in compilation output")
    process.exit(1)
}

const contracts = output.contracts[fileName]
const firstContractName = Object.keys(contracts)[0]
if (!firstContractName) {
    console.error("❌ No contract found in file")
    process.exit(1)
}

const contract = contracts[firstContractName]

// 输出 ABI 和 Bytecode
const abiPath = path.join(OUTPUT_DIR, `${contractName}.abi.json`)
const binPath = path.join(OUTPUT_DIR, `${contractName}.bin`)

fs.writeFileSync(abiPath, JSON.stringify(contract.abi, null, 2))
fs.writeFileSync(binPath, contract.evm.bytecode.object)

console.log(`✅ Compiled: ${fileName}`)
console.log(`   ABI:  ${abiPath}`)
console.log(`   BIN:  ${binPath}`)
