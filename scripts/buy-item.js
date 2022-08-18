const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks")
const tokenId = 5
async function buyItem() {
    const nftMarketplace = await ethers.getContract("NFTmarketplace")
    const basicNft = await ethers.getContract("BasicNft")
    const listing = await nftMarketplace.getListing(basicNft.address, tokenId)
    const price = listing.price.toString()
    const tx = await nftMarketplace.buyItem(basicNft.address, tokenId, { value: price })
    await tx.wait(1)
    console.log("bought nft!..")
    if (network.config.chainId == 31337) {
        await moveBlocks(2, (sleepAmount = 1000)) // 1sec
    }
}
buyItem()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })