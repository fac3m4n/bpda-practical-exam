import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("BPDAExamFT", {
    from: deployer,
    // Contract constructor arguments
    args: [],
    log: true,

    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const BPDAExamFTContract = await hre.ethers.getContract<Contract>("BPDAExamFT", deployer);
  console.log("👋 Initial greeting:", await BPDAExamFTContract.getAddress());
};

export default deployYourContract;

deployYourContract.tags = ["BPDAExamFTContract"];
