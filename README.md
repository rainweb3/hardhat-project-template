# Sample Hardhat Project

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
#本项目不支持ignition，移除了
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
