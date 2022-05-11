import { Contract } from "@ethersproject/contracts";
import { MULTISIG_WALLET_CONTRACT, TOKEN_VESTING_CONTRACT } from "./constant";
import {
  TOKEN_CONTRACT,
  TOKEN_NAME,
  TOKEN_SYMBOL,
  TOKEN_TOTAL_SUPPLY,
} from "./constant";
const hre = require("hardhat");

export async function deployToken(): Promise<Contract> {
  const KTEToken = await hre.ethers.getContractFactory(TOKEN_CONTRACT);
  const kteToken = await KTEToken.deploy(
    TOKEN_NAME,
    TOKEN_SYMBOL,
    hre.ethers.utils.parseUnits(TOKEN_TOTAL_SUPPLY, 18)
  );
  return kteToken;
}

export async function deployMultisig(
  owners: Array<string>,
  numOfConfirmation: number
): Promise<Contract> {
  const MultiSigWallet = await hre.ethers.getContractFactory(
    MULTISIG_WALLET_CONTRACT
  );
  const multiSigWallet = await MultiSigWallet.deploy(owners, numOfConfirmation);
  return multiSigWallet;
}

export async function deployTokenVesting(token: string): Promise<Contract> {
  const TokenVesting = await hre.ethers.getContractFactory(
    TOKEN_VESTING_CONTRACT
  );
  const tokenVesting = await TokenVesting.deploy(token);
  return tokenVesting;
}

export async function deployVestingTokenTimelock(
  token: string,
  beneficiary: string,
  releaseTime: string
): Promise<Contract> {
  const LPTokenTimelock = await hre.ethers.getContractFactory(
    "LPTokenTimelock"
  );
  const tokenVesting = await LPTokenTimelock.deploy(
    token,
    beneficiary,
    releaseTime
  );
  return tokenVesting;
}
