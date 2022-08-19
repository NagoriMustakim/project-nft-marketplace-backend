const { ethers, network } = require("hardhat")
const fs = require("fs")
//make sure make this in helper-hardhat-config,js
const frontendContractFile = "../moralis-nft-marketplace/constant/networkMapping.json"
const frontEndAbiLocation = "../moralis-nft-marketplace/constant/"
module.exports = async function () {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Updating ...")
        await updateContractAddress()
        await updateABI()
    }
}
async function updateContractAddress() {
    const NFTmarketplace = await ethers.getContract("NFTmarketplace")
    const chainId = network.config.chainId.toString()
    const contractAddresses = JSON.parse(fs.readFileSync(frontendContractFile, "utf8"))
    if (chainId in contractAddresses) {
        if (!contractAddresses[chainId]["NFTmarketplace"].includes(NFTmarketplace.address)) {
            contractAddresses[chainId]["NFTmarketplace"].push(NFTmarketplace.address)
        }

    }
    else {
        contractAddresses[chainId] = { NFTmarketplace: [NFTmarketplace.address] }
    }
    fs.writeFileSync(frontendContractFile, JSON.stringify(contractAddresses))
}
async function updateABI() {
    const NFTmarketplace = await ethers.getContract("NFTmarketplace")
    fs.writeFileSync(
        `${frontEndAbiLocation}NftMarketplace.json`,
        NFTmarketplace.interface.format(ethers.utils.FormatTypes.json)
    )
    const basicNft = await ethers.getContract("BasicNft")
    fs.writeFileSync(
        `${frontEndAbiLocation}BasicNft.json`,
        basicNft.interface.format(ethers.utils.FormatTypes.json)
    )
}
// this script gonna grap our nftmarketplace contract address and export to frontend
module.exports.tags = ["all", "updateAddress"]