import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";

task("create-vesting", "Create token vesting")
  .addParam("tokenAddress", "Token address")
  .addParam("vestingAddress", "Vesting address")
  .addParam("address", "Beneficiary address")
  .addOptionalParam("tokens", "Number of tokens")
  .setAction(async (args, hre) => {
    const { tokenAddress, vestingAddress, address, tokens = "500" } = args;
    const accounts = await hre.ethers.getSigners();
    const signer = accounts[0];

    const TokenVesting = await hre.ethers.getContractFactory("TokenVesting");
    const tokenVesting = new hre.ethers.Contract(
      vestingAddress,
      TokenVesting.interface,
      signer
    );

    // epoch current time
    const baseTime = Number((new Date().getTime() / 1000).toFixed(0));
    const startTime = baseTime;
    const cliff = 0;
    const duration = 1000;
    const slicePeriodSeconds = 1;
    const revokable = true;
    const amount = hre.ethers.utils.parseUnits(tokens, 18);
    const upfront = hre.ethers.utils.parseUnits("1", 18);

    await tokenVesting.createVestingSchedule(
      address,
      startTime,
      cliff,
      duration,
      slicePeriodSeconds,
      revokable,
      amount,
      upfront,
      {
        gasLimit: 8000000,
      }
    );
  });

task("release", "Release vested tokens")
  .addParam("vestingAddress", "Vesting address")
  .addParam("vestingScheduleId", "Vesting Schedule Id")
  .addParam("amount", "Number of tokens")
  .setAction(async (args, hre) => {
    const { amount, vestingAddress, vestingScheduleId } = args;
    const accounts = await hre.ethers.getSigners();
    const signer = accounts[0];

    const TokenVesting = await hre.ethers.getContractFactory("TokenVesting");
    const tokenVesting = new hre.ethers.Contract(
      vestingAddress,
      TokenVesting.interface,
      signer
    );

    await tokenVesting.release(vestingScheduleId, amount, {
      gasLimit: 8000000,
    });
  });
