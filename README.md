# Sample Hardhat Project

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
# hardhat v2版本，不支持ignition，本人项目移除了这个模块
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```

# 智能合约开发常用命令汇总（含 ts-node 执行）

| 命令 | 说明 |
|------|------|
| `npx hardhat compile` | 编译 Solidity 合约 |
| `npx hardhat test` | 运行测试用例 |
| `npx hardhat node` | 启动本地 Hardhat 节点（本地测试网） |
| `npx hardhat run scripts/deploy.ts --network localhost` | 部署合约到本地节点 |
| `npx hardhat run scripts/deploy.ts --network sepolia` | 部署合约到 Sepolia 测试网 |
| `npm run format` | 格式化代码（通常使用 Prettier） |
| `npm run lint` | 检查代码规范（通常使用 ESLint） |
| `npm run clean` | 清理构建产物（如 `artifacts/`, `cache/` 等） |
| `npm run reinstall` | 删除 `node_modules` 并重新安装依赖 |
| `npm run ts-node -- your-script.ts` | 使用 ts-node 直接执行任意 TypeScript 脚本 |
| `npx ts-node your-script.ts` | 直接通过 npx 执行 TypeScript 脚本（无需 npm run） |
| `npx hardhat clean` | 清理 Hardhat 编译缓存和构建产物（包括 `artifacts/` 和 `cache/` 目录） |
| `npx tsc` | 将 TypeScript 文件编译为 JavaScript（需确保 `tsconfig.json` 配置正确） |


# 本地测试
```
# 1.启动本地节点
npx hardhat node


# 2.启动后会在控制台输出以下日志内容：
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========

WARNING: These accounts, and their private keys, are publicly known.
Any funds sent to them on Mainnet or any other live network WILL BE LOST.

Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d


# 3.在.env文件中填写环境变量值
# 私钥
REMOTE_TEST_PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
# rpc地址
REMOTE_TEST_RPC_URL=" http://127.0.0.1:8545"
# 加密密码
ENCRYPTION_PASSWORD="YourStrongPassword123!"
# 生成的加密文件存放位置
ENCRYPTED_KEY_PATH = "./scripts/ts/json/encryptedKey.json"


# 4.执行加密脚本-生成加密json文件-部署时连接钱包要用
 npx ts-node .\scripts\ts\encryptKey.ts --network localhost
✅ 私钥验证通过 - 地址: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
✅ 加密成功！文件保存至: ./scripts/ts/json/encryptedKey.json

# 5.执行解密脚本，测试加密情况
 npx ts-node .\scripts\ts\decryptKey.ts --network localhost
🔓 开始解密钱包文件...
✅ 解密成功！
💼 关联地址: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
🔐 私钥: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
🔐 解密流程完成。

# 6.在本地Hardhat localhost 网络中部署合约-示例
 npx ts-node .\scripts\ts\deploy.ts --network localhost    
🚀 开始部署合约...

🔐 环境变量加载完成
✅ 钱包已解密
👷 部署者地址: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
🌐 当前网络: unknown (Chain ID: 31337)
💰 余额: 10000.0 ETH
🔍 正在加载合约编译文件: "你本地合约的绝对路径"\contracts\SimpleStorage.sol\SimpleStorage.json
📦 合约编译文件加载成功

🚀 正在部署合约...

📤 部署交易已发送
📝 交易哈希: 0x54c5b5a3394c75c95ca745186fe3cae6925e2ecb28532c25ab63a5ff53326746
⛽ Max Fee: 3.0 Gwei
⚡ Priority Fee: 1.0 Gwei

⏳ 等待交易上链...

✅ 合约部署成功！
📍 合约地址: 0x5FbDB2315678afecb367f032d93F642f64180aa3
📦 区块号: 1                                                                                                                                    
⛽ 消耗 Gas: 335488
💸 交易费用: 0.00062904 ETH

💾 合约地址已保存

🔍 初始值验证: 0

🎉 部署流程完成
```
