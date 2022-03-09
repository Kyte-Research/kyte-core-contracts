import { ContractFactory, Contract } from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  MOCK_TOKEN_VESTING_CONTRACT,
  TOKEN_CONTRACT,
} from "../scripts/constant";

describe("TokenVesting", function () {
  let Token: ContractFactory;
  let testToken: Contract;
  let TokenVesting: ContractFactory;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];

  before(async function () {
    Token = await ethers.getContractFactory(TOKEN_CONTRACT);
    TokenVesting = await ethers.getContractFactory(MOCK_TOKEN_VESTING_CONTRACT);
  });
  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    testToken = await Token.deploy("Test Token", "TT", 1000000);
    await testToken.deployed();
    const mintTokenTx = await testToken.mint(owner.address, 1000000);
    // wait until the transaction is mined
    await mintTokenTx.wait();
  });

  describe("Vesting", function () {
    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await testToken.balanceOf(owner.address);
      const totalSupply = await testToken.totalSupply();
      expect(totalSupply).to.equal(ownerBalance);
    });

    /*
     * TEST SUMMARY
     * deploy vesting contract
     * send tokens to vesting contract
     * create new vesting schedule (100 tokens)
     * check that vested amount is 0
     * set time to half the vesting period
     * check that vested amount is half the total amount to vest (50 tokens)
     * check that only beneficiary can try to release vested tokens
     * check that beneficiary cannot release more than the vested amount
     * release 10 tokens and check that a Transfer event is emitted with a value of 10
     * check that the released amount is 10
     * check that the vested amount is now 40
     * set current time after the end of the vesting period
     * check that the vested amount is 90 (100 - 10 released tokens)
     * release all vested tokens (90)
     * check that the number of released tokens is 100
     * check that the vested amount is 0
     * check that anyone cannot revoke a vesting
     */
    it("Should vest tokens gradually", async function () {
      // deploy vesting contract
      const tokenVesting = await TokenVesting.deploy(testToken.address);
      await tokenVesting.deployed();
      expect((await tokenVesting.token()).toString()).to.equal(
        testToken.address
      );
  

      const baseTime = 1622551248;
      const beneficiary = addr1;
      const startTime = baseTime;
      const cliff = 0;
      const duration = 1000;
      const slicePeriodSeconds = 1;
      const revokable = true;
      const amount = 100;
      const upfront = 0;

      await testToken.approve(tokenVesting.address, amount);

      // create new vesting schedule
      await tokenVesting.createVestingSchedule(
        beneficiary.address,
        startTime,
        cliff,
        duration,
        slicePeriodSeconds,
        revokable,
        amount,
        upfront
      );
      const vestingContractBalance = await testToken.balanceOf(
        tokenVesting.address
      );
      expect(vestingContractBalance).to.equal(amount);
      expect(await tokenVesting.getVestingSchedulesCount()).to.be.equal(1);
      expect(
        await tokenVesting.getVestingSchedulesCountByBeneficiary(
          beneficiary.address
        )
      ).to.be.equal(1);

      // compute vesting schedule id
      const vestingScheduleId =
        await tokenVesting.computeVestingScheduleIdForAddressAndIndex(
          beneficiary.address,
          0
        );

      // check that vested amount is 0
      expect(
        await tokenVesting.computeReleasableAmount(vestingScheduleId)
      ).to.be.equal(0);

      // set time to half the vesting period
      const halfTime = baseTime + duration / 2;
      await tokenVesting.setBlockTimestamp(halfTime);

      // check that vested amount is half the total amount to vest
      expect(
        await tokenVesting
          .connect(beneficiary)
          .computeReleasableAmount(vestingScheduleId)
      ).to.be.equal(50);

      // check that only beneficiary can try to release vested tokens
      await expect(
        tokenVesting.connect(addr2).release(vestingScheduleId, 100)
      ).to.be.revertedWith("not-authorised");

      // check that beneficiary cannot release more than the vested amount
      await expect(
        tokenVesting.connect(beneficiary).release(vestingScheduleId, 100)
      ).to.be.revertedWith("insufficient-vested-token");

      // release 10 tokens and check that a Transfer event is emitted with a value of 10
      await expect(
        tokenVesting.connect(beneficiary).release(vestingScheduleId, 10)
      )
        .to.emit(testToken, "Transfer")
        .withArgs(tokenVesting.address, beneficiary.address, 10);

      // check that the vested amount is now 40
      expect(
        await tokenVesting
          .connect(beneficiary)
          .computeReleasableAmount(vestingScheduleId)
      ).to.be.equal(40);
      let vestingSchedule = await tokenVesting.getVestingSchedule(
        vestingScheduleId
      );

      // check that the released amount is 10
      expect(vestingSchedule.released).to.be.equal(10);

      // set current time after the end of the vesting period
      await tokenVesting.setBlockTimestamp(baseTime + duration + 1);

      // check that the vested amount is 90
      expect(
        await tokenVesting
          .connect(beneficiary)
          .computeReleasableAmount(vestingScheduleId)
      ).to.be.equal(90);

      // beneficiary release vested tokens (45)
      await expect(
        tokenVesting.connect(beneficiary).release(vestingScheduleId, 45)
      )
        .to.emit(testToken, "Transfer")
        .withArgs(tokenVesting.address, beneficiary.address, 45);

      // owner release vested tokens (45)
      await expect(tokenVesting.connect(owner).release(vestingScheduleId, 45))
        .to.emit(testToken, "Transfer")
        .withArgs(tokenVesting.address, beneficiary.address, 45);
      vestingSchedule = await tokenVesting.getVestingSchedule(
        vestingScheduleId
      );

      // check that the number of released tokens is 100
      expect(vestingSchedule.released).to.be.equal(100);

      // check that the vested amount is 0
      expect(
        await tokenVesting
          .connect(beneficiary)
          .computeReleasableAmount(vestingScheduleId)
      ).to.be.equal(0);

      // check that anyone cannot revoke a vesting
      await expect(
        tokenVesting.connect(addr2).revoke(vestingScheduleId)
      ).to.be.revertedWith("Ownable: caller is not the owner");
      await tokenVesting.revoke(vestingScheduleId);
    });

    it("Should release the upfront token on vesting schedule creation", async () => {
      // deploy vesting contract
      const tokenVesting = await TokenVesting.deploy(testToken.address);
      await tokenVesting.deployed();
      expect((await tokenVesting.token()).toString()).to.equal(
        testToken.address
      );
    
      const baseTime = 1622551248;
      const beneficiary = addr1;
      const startTime = baseTime;
      const cliff = 0;
      const duration = 1000;
      const slicePeriodSeconds = 1;
      const revokable = true;
      const amount = 100;
      const upfront = 10;

      await testToken.approve(tokenVesting.address, amount + upfront);
      
      // create new vesting schedule
      expect(
        await tokenVesting.createVestingSchedule(
          beneficiary.address,
          startTime,
          cliff,
          duration,
          slicePeriodSeconds,
          revokable,
          amount,
          upfront
        )
      )
        .to.emit(testToken, "Transfer")
        .withArgs(tokenVesting.address, beneficiary.address, upfront);
    });

    it("Should release vested tokens if revoked", async () => {
      // deploy vesting contract
      const tokenVesting = await TokenVesting.deploy(testToken.address);
      await tokenVesting.deployed();
      expect((await tokenVesting.token()).toString()).to.equal(
        testToken.address
      );

      const baseTime = 1622551248;
      const beneficiary = addr1;
      const startTime = baseTime;
      const cliff = 0;
      const duration = 1000;
      const slicePeriodSeconds = 1;
      const revokable = true;
      const amount = 100;
      const upfront = 0;

      await testToken.approve(tokenVesting.address, amount + upfront);

      // create new vesting schedule
      await tokenVesting.createVestingSchedule(
        beneficiary.address,
        startTime,
        cliff,
        duration,
        slicePeriodSeconds,
        revokable,
        amount,
        upfront
      );

      // compute vesting schedule id
      const vestingScheduleId =
        await tokenVesting.computeVestingScheduleIdForAddressAndIndex(
          beneficiary.address,
          0
        );

      // set time to half the vesting period
      const halfTime = baseTime + duration / 2;
      await tokenVesting.setBlockTimestamp(halfTime);

      await expect(tokenVesting.revoke(vestingScheduleId))
        .to.emit(testToken, "Transfer")
        .withArgs(tokenVesting.address, beneficiary.address, 50)
        .to.emit(testToken, "Transfer")
        .withArgs(tokenVesting.address, owner.address, 50);
    });

    it("Should compute vesting schedule index", async function () {
      const tokenVesting = await TokenVesting.deploy(testToken.address);
      await tokenVesting.deployed();
      const expectedVestingScheduleId =
        "0xa279197a1d7a4b7398aa0248e95b8fcc6cdfb43220ade05d01add9c5468ea097";
      expect(
        (
          await tokenVesting.computeVestingScheduleIdForAddressAndIndex(
            addr1.address,
            0
          )
        ).toString()
      ).to.equal(expectedVestingScheduleId);
      expect(
        (
          await tokenVesting.computeNextVestingScheduleIdForHolder(
            addr1.address
          )
        ).toString()
      ).to.equal(expectedVestingScheduleId);
    });

    it("Should check input parameters for createVestingSchedule method", async function () {
      const tokenVesting = await TokenVesting.deploy(testToken.address);
      await tokenVesting.deployed();
      await testToken.approve(tokenVesting.address, 1000);
      const time = Date.now();
      await expect(
        tokenVesting.createVestingSchedule(
          addr1.address,
          time,
          0,
          0,
          1,
          false,
          1,
          0
        )
      ).to.be.revertedWith("invalid-duration");
      await expect(
        tokenVesting.createVestingSchedule(
          addr1.address,
          time,
          0,
          1,
          0,
          false,
          1,
          0
        )
      ).to.be.revertedWith("invalid-slice-period");
      await expect(
        tokenVesting.createVestingSchedule(
          addr1.address,
          time,
          0,
          1,
          1,
          false,
          0,
          0
        )
      ).to.be.revertedWith("invalid-amount");
    });
  });
});
