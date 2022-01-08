import hre from "hardhat";
import { changeNetwork } from "hardhat";

const main = async (): Promise<void> => {
  console.log("network name", hre.network.name);
  hre.changeNetwork("rinkeby");
  console.log("network name", hre.network.name);
  changeNetwork("ropsten");
  console.log("network name", hre.network.name);
};

main().then(console.log).catch(console.error);
