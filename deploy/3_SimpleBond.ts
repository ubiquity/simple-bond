import { HardhatRuntimeEnvironment } from "hardhat/types";

const deploySimpleBond = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;

  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  console.log(deployer, "deployer");

  const UAR = (await deployments.getOrNull("UAR"))?.address;

  const rewardPerBillion = 1000;
  const vestingBlocks = 32300; // about 5 days

  const deployResult = await deploy("SimpleBond", {
    from: deployer,
    args: [UAR, rewardPerBillion, vestingBlocks],
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
