import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { Signer, Contract, BigNumber } from "ethers";
import { FeeData, TransactionReceipt } from "@ethersproject/abstract-provider";

describe("Template", function () {
  let signer: Signer;
  let signerAddress: string;
  let template: Contract;

  before(async () => {
    signer = (await ethers.getSigners())[0];
    signerAddress = await signer.getAddress();
    console.log("signer", signerAddress, "\n");

    // Deploy contract if not already
    if (!(await ethers.getContractOrNull("Template"))) {
      console.log("Deploy Template...");
      await deployments.fixture(["Template"]);
    }

    template = await ethers.getContract("Template", signer);
    console.log("contract", template.address, "\n");
  });

  afterEach(async () => {});

  it("Should be ok", async function () {
    expect(signerAddress).to.be.properAddress;
    expect(template.address).to.be.properAddress;
  });
});
