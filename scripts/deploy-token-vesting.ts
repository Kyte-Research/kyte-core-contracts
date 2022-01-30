// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { deployTokenVesting } from "./deploy-contracts";

async function main() {
  const tokenAddr = "";
  const tokenVesting = await deployTokenVesting(tokenAddr);

  await tokenVesting.deployed();

  console.log("Token deployed to:", tokenVesting.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
