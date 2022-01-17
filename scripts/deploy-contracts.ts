import { Contract } from "@ethersproject/contracts";
import { MULTISIG_WALLET_CONTRACT } from "./constant";
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
