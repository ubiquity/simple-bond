import { HardhatRuntimeEnvironment } from "hardhat/types";

const deploySimpleBond = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, getChainId, ethers } = hre;
  const { deploy } = deployments;
  const { BigNumber } = ethers;

  const { deployer, treasury } = await ethers.getNamedSigners();
  const chainId = await getChainId();

  const uARDeployment = await deployments.get("UAR");

  const vestingBlocks = 32300; // about 5 days
  const allowance = BigNumber.from(10).pow(32);

  const deploySimpleBond = await deploy("SimpleBond", {
    from: deployer.address,
    args: [uARDeployment.address, vestingBlocks, treasury.address],
    log: true
  });
  if (deploySimpleBond.newlyDeployed) {
    console.log("SimpleBond newly deployed", deploySimpleBond.address);

    if (chainId == "1") {
      console.log("Have to allow MINTER_ROLE to SimpleBond");
      console.log("Have to set infinite allowance to SimpleBond");
    } else {
      // Transfer ownership of uAR Token to SimpleBond contract in order to Mint it
      const uARContract = new ethers.Contract(uARDeployment.address, uARDeployment.abi, deployer);
      await uARContract.transferOwnership(deploySimpleBond.address);

      // Set allowance for SimpleBond to spend treasury money
      await uARContract.connect(treasury).increaseAllowance(deploySimpleBond.address, allowance);
    }
  }
};
deploySimpleBond.tags = ["SimpleBond"];
deploySimpleBond.dependencies = ["Tokens"];
deploySimpleBond.runAtTheEnd = () => console.log("END");

export default deploySimpleBond;
