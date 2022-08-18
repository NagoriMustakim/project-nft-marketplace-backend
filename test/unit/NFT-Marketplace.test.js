const { network, getNamedAccounts, ethers, deployments } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("NFT-Marketplace unit test", function () {
        let NftMarketplace, basicNFT, deployer, player
        const TOKEN_ID = 0
        const PRICE = 0.100000000000000000
        beforeEach(async function () {
            deployer = (await getNamedAccounts()).deployer
            player = (await getNamedAccounts()).player
            await deployments.fixture(["all"])
            console.log("=======*****************=====")
            NftMarketplace = await ethers.getContract("NFTmarketplace")
            basicNFT = await ethers.getContract("BasicNft")
            console.log("=======*****************=====")
            await basicNFT.mintNft()
            await basicNFT.approve(NftMarketplace.address, TOKEN_ID)
        })
        // it("list and buy the nft", async function () {
        //     await NftMarketplace.listItem(basicNFT.address, TOKEN_ID, PRICE)
        //     const playerConnectedMarketPlace = NftMarketplace.connect(player)
        //     playerConnectedMarketPlace.buyItem(basicNFT.address, TOKEN_ID)
        //     const newOwner = basicNFT.ownerOf(TOKEN_ID)
        //     const deployerProceeds = await NftMarketplace.getProceeds(deployer)

        // })
    })