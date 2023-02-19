require("@nomiclabs/hardhat-waffle")
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy")

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const COINMARKET_CAP_KEY = process.env.COINMARKET_CAP_KEY;



/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity:{
    compilers: [
        {version: "0.8.8"},
        {version: "0.6.6"}
    ]
  },
  defaultNetwork: "hardhat",
  networks: {
    goerli: {
        url: GOERLI_RPC_URL,
        accounts: [PRIVATE_KEY],
        chainId: 5,
        blockConfirmations: 6
    },
    hardhat: {
        chaindId: 31337
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: COINMARKET_CAP_KEY,
    token: "ETH"
  },
  namedAccounts: {
    deployer: {
        default: 0,
        1: 0
    }
  }
};
