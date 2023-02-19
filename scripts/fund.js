const {getNamedAccounts, ethers} = require("hardhat");

async function main() {
    const {deployer} = await getNamedAccounts();
    const fundMe = await ethers.getContract("FundMe", deployer);
    console.log("funding contract...");
    const transactionResponse = await fundMe.fund({value: ethers.utils.parseEther("0.3")});
    await transactionResponse.wait(1);
    console.log("funded");
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
