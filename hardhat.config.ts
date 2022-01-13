import type { HardhatUserConfig } from "hardhat/types";

import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import "hardhat-docgen";
import "hardhat-change-network";
import "hardhat-gas-reporter";
import "solidity-coverage";

import "@typechain/hardhat";
import "tsconfig-paths/register";

import "./tasks/index";

import dotenv from "dotenv";
import findupSync from "findup-sync";

if (!process.env.INFURA_API_KEY) {
  dotenv.config({ path: findupSync(".env") || "" });
  if (!process.env.INFURA_API_KEY) {
    throw new Error("HARDHAT : ENV variable INFURA_API_KEY not set!");
  }
}

const accounts = [
  process.env.PRIVATE_KEY_0_DEPLOY || "",
  process.env.PRIVATE_KEY_1_TEST || "",
  process.env.PRIVATE_KEY_2_TEST || "",
  process.env.PRIVATE_KEY_3_TEST || "",
  process.env.PRIVATE_KEY_4_TEST || "",
  process.env.PRIVATE_KEY_5_TEST || ""
];

const admin = process.env.PUBLIC_KEY || "";
const ledger = `ledger://${process.env.PUBLIC_KEY}`;

const hardhatUserConfig: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  namedAccounts: {
    admin: { default: 0 },
    deployer: { default: 1, rinkeby: ledger },
    tester1: { default: 2 },
    tester2: { default: 3 },
    random: { default: 4 },
    treasury: { default: 5 },
    uAD: "0x0F644658510c95CB46955e55D7BA9DDa9E9fBEc6",
    uAR: "0x5894cFEbFdEdBe61d01F20140f41c5c49AedAe97",
    uAD3CRVf: "0x20955CB69Ae1515962177D164dfC9522feef567E"
  },
  solidity: {
    compilers: [
      {
        version: "0.8.9",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.8.4"
      }
    ]
  },
  networks: {
    hardhat: {
      saveDeployments: true,
      initialBaseFeePerGas: 0
    },
    local: {
      chainId: 31337,
      url: "http://127.0.0.1:8545"
    },
    mainnet: {
      chainId: 1,
      // url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts
    },
    ropsten: {
      chainId: 3,
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts
    },
    rinkeby: {
      chainId: 4,
      // url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
      // gasPrice: 20_000_000_000,
      accounts
    },
    goerli: {
      chainId: 5,
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts
    },
    fantom: {
      chainId: 250,
      url: "https://rpcapi.fantom.network",
      etherscan: { apiKey: process.env.ETHERSCAN_API_KEY_FANTOM },
      accounts
    },
    kovan: {
      chainId: 42,
      url: `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts
    },
    bsc: {
      chainId: 56,
      url: "https://bsc-dataseed1.binance.org",
      etherscan: { apiKey: process.env.ETHERSCAN_API_KEY_BINANCE },
      accounts
    },
    matic: {
      chainId: 137,
      url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      // gasPrice: 50_000_000_000
      etherscan: { apiKey: process.env.ETHERSCAN_API_KEY_POLYGON },
      accounts
    },
    avalanche: {
      chainId: 43114,
      url: "https://api.avax.network/ext/bc/C/rpc",
      etherscan: { apiKey: process.env.ETHERSCAN_API_KEY_AVALANCHE },
      accounts
    },
    fuji: {
      chainId: 43113,
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      etherscan: { apiKey: process.env.ETHERSCAN_API_KEY_AVALANCHE },
      accounts
    },
    mumbai: {
      chainId: 80001,
      url: `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_API_KEY}`,
      // url: `https://rpc-mumbai.maticvigil.com/v1/${process.env.MATICVIGIL_API_KEY}`,
      accounts,
      gasPrice: 20_000_000_000,
      etherscan: { apiKey: process.env.ETHERSCAN_API_KEY_POLYGON }
    },
    optimism: {
      chainId: 10,
      url: `https://optimism-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts
    },
    optimismkovan: {
      chainId: 69,
      url: `https://optimism-kovan.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts
    },
    arbitrum: {
      chainId: 42161,
      // url: "https://arb1.arbitrum.io/rpc",
      url: `https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      // url: `https://arb-mainnet.g.alchemy.com/v2/${process.env.ARBITRUM_API_KEY}`,
      accounts
    },
    arbitrumrinkeby: {
      chainId: 421611,
      url: `https://arbitrum-rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
      // url: "https://rinkeby.arbitrum.io/rpc",
      // url: `https://arb-rinkeby.g.alchemy.com/v2/${process.env.ARBITRUM_API_KEY}`,
      // gasPrice: 20_000_000_000
      accounts
    },
    xdai: {
      chainId: 100,
      url: "https://dai.poa.network",
      // url: "https://xdai.poanetwork.dev/",
      // url: "https://rpc.xdaichain.com/",
      // gasPrice: 80_000_000_000,
      accounts
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD"
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY_ETHEREUM
  },
  typechain: {
    outDir: "types",
    target: "ethers-v5",
    externalArtifacts: ["abis/*.json"]
  },
  paths: {
    sources: "contracts",
    deploy: "deploy",
    deployments: "deployments",
    tests: "tests",
    imports: "lib",
    cache: "artifacts/cache",
    artifacts: "artifacts"
  },
  mocha: {
    timeout: 1_000_000,
    bail: true
  }
};

export default hardhatUserConfig;
