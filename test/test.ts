import { expect } from "chai";
import { ethers } from "hardhat";
const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");


describe("RocketToken", function () {
   let owner, contract, instance;
   let second, third;
   let lockTime, freeAmount, minPrice;

  beforeEach(async function () {
    [owner, second, third] = await ethers.getSigners();
    lockTime = (await time.latest()) + 60;
    freeAmount = 2; 
    minPrice = 100000000;
    contract = await ethers.getContractFactory("RocketToken");
    instance = await contract.deploy(lockTime, freeAmount,  minPrice);
  });

  it("Test contract", async function () {
    const expectLockTime = await instance.getFreeAmount();
    expect(expectLockTime).to.be.equal(freeAmount);
  });

  it("Only First 2 address can got free mint", async function () {
    await instance.freeMint(owner.address, 1);
    await instance.freeMint(second.address, 2);
    expect(await instance.freeMint(third.address, 3)).to.be.revertedWith('Starters full')
  });

  it("Everyone got at most 3 free tokens", async function () {
    await instance.freeMint(second.address, 1);
    await instance.freeMint(second.address, 2);
    await instance.freeMint(second.address, 3);
    expect(await instance.freeMint(second.address, 4)).to.be.revertedWith('Already granted 3 tokens')
  });
});
