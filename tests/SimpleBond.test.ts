import type { Signer, Contract } from "ethers";
import type { LP } from "types/LP";
import type { UAR } from "types/UAR";
import type { SimpleBond } from "types/SimpleBond";
import type { SignerWithAddress } from "hardhat-deploy-ethers/signers";

import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { BigNumber, utils } from "ethers";

import { mineNBlocks } from "./utils";

const ten = BigNumber.from(10);
const one = ten.pow(18);

describe("SimpleBond", function () {
  let signer: SignerWithAddress;

  let lp: LP;
  let uAR: UAR;
  let simpleBond: SimpleBond;

  before(async () => {
    [signer] = await ethers.getSigners();
    console.log(signer);
    console.log(signer.address, "signer");

    // Deploy contract if not already
    if (!(await ethers.getContractOrNull("SimpleBond"))) {
      console.log("Deploying...");
      await deployments.fixture();
    }

    simpleBond = await ethers.getContract("SimpleBond", signer);
    console.log(simpleBond.address, "simpleBond");

    uAR = await ethers.getContract("UAR", signer);
    console.log(uAR.address, "uAR");

    lp = await ethers.getContract("LP", signer);
    console.log(lp.address, "lp");

    // MINT 1000 LP tokens
    await (await lp.mint(one.mul(1000))).wait();

    // APPROVE 500 LP tokens to be spent by simpleBond
    await (await lp.approve(simpleBond.address, one.mul(500))).wait();
  });

  afterEach(async () => {
    const balances = await simpleBond.balancesOf(signer.address);
    console.log(`${utils.formatEther(balances.balanceDeposit)} balanceDeposit`);
    console.log(`${utils.formatEther(balances.balanceRewards)} balanceRewards`);
    console.log(`${utils.formatEther(balances.balanceUnlockDeposit)} balanceUnlockDeposit`);
    console.log(`${utils.formatEther(balances.balanceClaimableRewards)} balanceClaimableRewards`);

    const bondsCount = Number(await simpleBond.bondsCount(signer.address));
    for (let index = 0; index < bondsCount; index++) {
      const bond = await simpleBond.bonds(signer.address, index);
      console.log(`${utils.formatEther(bond.deposit)} deposit`);
      console.log(`${utils.formatEther(bond.rewards)} rewards`);
      console.log(`${bond.block} block`);
      console.log(`${bond.token} token`);
    }

    console.log(await ethers.provider.getBlockNumber(), "current block");
  });

  it("Should be ok", async function () {
    expect(signer.address).to.be.properAddress;
    expect(simpleBond.address).to.be.properAddress;
    expect(uAR.address).to.be.properAddress;
    expect(lp.address).to.be.properAddress;
  });

  it("Should deposit", async function () {
    await simpleBond.deposit(lp.address, one.mul(100));
  });

  it("Wait 1000 blocks", async function () {
    await mineNBlocks(1000);
  });

  it("Should claim 1 reward", async function () {
    await simpleBond.claim(lp.address, one);
  });

  it("Should deposit again", async function () {
    await simpleBond.deposit(lp.address, one.mul(100));
  });

  it("Wait 2000 blocks", async function () {
    await mineNBlocks(2000);
  });

  it("Wait 30000 blocks", async function () {
    await mineNBlocks(30000);
  });

  it("Should withdraw LPs", async function () {
    await simpleBond.withdraw(lp.address, one.mul(200));
  });

  it("Should claim all remainings rewards", async function () {
    await simpleBond.claim(lp.address, one.mul(2));
  });
});
