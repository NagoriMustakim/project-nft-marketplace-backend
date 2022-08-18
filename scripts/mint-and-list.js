const { ethers, network } = require("hardhat")
const PRICE = ethers.utils.parseEther("0.1")
const { moveBlocks } = require("../utils/move-blocks")
async function mintAndlist() {
    const NFTmarketplace = await ethers.getContract("NFTmarketplace")
    const basicnft = await ethers.getContract("BasicNft")

    console.log("Minting nft... ")
    const mintTx = await basicnft.mintNft()
    const mintTxReceipt = await mintTx.wait(1)
    const tokenId = mintTxReceipt.events[0].args.tokenId
    console.log(`token ID is: ${tokenId}`)
    console.log("Approving NFT...")
    const approvalTx = await basicnft.approve(NFTmarketplace.address, tokenId)
    await approvalTx.wait(1)
    console.log("Listing NFT...")
    const tx = await NFTmarketplace.listItem(basicnft.address, tokenId, PRICE)
    await tx.wait(1)
    console.log("NFT Listed!")
    if (network.config.chainId == 31337) {
        await moveBlocks(2, (sleepAmount = 1000)) // 1sec
    }
}
mintAndlist()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })