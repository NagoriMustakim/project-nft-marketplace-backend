const { ethers, network } = require("hardhat")
const fs = require("fs")
const frontendContractFile = "../moralis-nft-marketplace/constant/networkMapping.json"
module.exports = async function () {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Updating ...")
        await updateContractAddress()
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
// this script gonna grap our nftmarketplace contract address and export to frontend
module.exports.tags = ["all", "updateAddress"]