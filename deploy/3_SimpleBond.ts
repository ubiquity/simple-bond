import { HardhatRuntimeEnvironment } from "hardhat/types";

const deploySimpleBond = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;

  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const LP = (await deployments.getOrNull("LP"))?.address;
  const UAR = (await deployments.getOrNull("UAR"))?.address;

  const rewardPourcentage = 61700;
  const vestingBlocks = 32300; // about 5 days

  const deployResult = await deploy("SimpleBond", {
    from: deployer,
    args: [LP, UAR, rewardPourcentage, vestingBlocks],
    log: true
  });
  // if (deployResult.newlyDeployed) {
  //   console.log("New SimpleBond deployment");
  // }
};
deploySimpleBond.tags = ["SimpleBond"];
deploySimpleBond.dependencies = ["Tokens"];
deploySimpleBond.runAtTheEnd = () => console.log("END");

export default deploySimpleBond;
