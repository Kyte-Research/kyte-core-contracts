// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { deployVestingTokenTimelock } from "./deploy-contracts";

async function main() {
  const tokenAddr = process.env.TOKEN_ADDRESS;
  const beneficiary = process.env.TOKEN_LP_BENEFICIARY;
  const releaseTime = process.env.LOCK_TIME;

  if (!tokenAddr || !beneficiary || !releaseTime) {
    throw new Error("Please specify required environment variables");
  }

  const lpTokenTimelock = await deployVestingTokenTimelock(
    tokenAddr,
    beneficiary,
    releaseTime
  );

  await lpTokenTimelock.deployed();

  console.log("LP Token Vesting deployed to:", lpTokenTimelock.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
