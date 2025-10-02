import { expect } from "chai"
import { ethers } from "hardhat"
import { SimpleStorage } from "../typechain-types"

describe("SimpleStorage", function () {
    let simpleStorage: SimpleStorage

    beforeEach(async function () {
        const factory = await ethers.getContractFactory("SimpleStorage")

        // ✅ 正确的类型断言方式：先 unknown，再 SimpleStorage
        simpleStorage =
            (await await factory.deploy()) as unknown as SimpleStorage
        await simpleStorage.deploymentTransaction()?.wait() // 确保部署完成（可选）
    })

    it("Should store and retrieve a number", async function () {
        await simpleStorage.store(100)
        expect(await simpleStorage.retrieve()).to.equal(100n)
    })

    it("Should add a person", async function () {
        await simpleStorage.addPerson("Alice", 42)

        const person = await simpleStorage.people(0)
        expect(person.name).to.equal("Alice")
        expect(person.favoriteNumber).to.equal(42n)

        expect(await simpleStorage.nameToFavoriteNumber("Alice")).to.equal(42n)
    })
})
