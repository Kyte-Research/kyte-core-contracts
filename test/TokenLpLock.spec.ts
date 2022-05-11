import { ContractFactory, Contract } from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { TIME_LOCK_CONTRACT, TOKEN_CONTRACT } from "../scripts/constant";

describe("TimeLockTest", function () {
  let Token: ContractFactory;
  let testToken: Contract;
  let LPTokenTimelock: ContractFactory;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];
  const beneficiary = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";

  before(async function () {
    Token = await ethers.getContractFactory(TOKEN_CONTRACT);
    LPTokenTimelock = await ethers.getContractFactory(TIME_LOCK_CONTRACT);
  });

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    testToken = await Token.deploy("Test LP Token", "LP", 1000000);
    await testToken.deployed();
    const mintTokenTx = await testToken.mint(owner.address, 1000);
    await mintTokenTx.wait();
  });

  describe("LP Token test cases", function () {
    it("Release date is 2 days from today so it should not release", async function () {
      // deploy vesting contract
      const datetime = new Date();
      datetime.setDate(datetime.getDate() + 2);
      const tokenTimeLock = await LPTokenTimelock.deploy(
        testToken.address,
        beneficiary,
        datetime.getTime()
      );
      await tokenTimeLock.deployed();
      expect((await tokenTimeLock.token()).toString()).to.equal(
        testToken.address
      );

      await expect(tokenTimeLock.release()).to.be.revertedWith(
        "TokenTimelock: current time is before release time"
      );
    });

    it("Release date is in 20seconds from now & execution of release action is in 30seconds from now so it should release", async function () {
      // deploy vesting contract
      const datetime = new Date();
      datetime.setSeconds(datetime.getSeconds() + 20);
      const tokenTimeLock = await LPTokenTimelock.deploy(
        testToken.address,
        beneficiary,
        Math.floor(datetime.getTime() / 1000)
      );

      const tokenLockAddress = await tokenTimeLock.deployed();
      const mintTokenTx = await testToken.mint(tokenLockAddress.address, 1000);
      await mintTokenTx.wait();

      // Increase time by 30 seconds and mine new block
      await network.provider.send("evm_increaseTime", [30]);
      await network.provider.send("evm_mine");

      await tokenTimeLock.release();
      const benefiaryBalance = await testToken.balanceOf(beneficiary);
      const amount = 1000;
      expect(amount).to.equal(benefiaryBalance);
    });
  });
});
