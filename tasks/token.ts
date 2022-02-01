import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";

task("mint-token", "Mint token")
  .addParam("address", "Token address")
  .addOptionalParam("tokens", "Number of tokens")
  .addOptionalParam("to", "To address")
  .setAction(async (args, hre) => {
    const {
      address,
      tokens = "500",
      to = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    } = args;
    const accounts = await hre.ethers.getSigners();
    const signer = accounts[0];

    const KTEToken = await hre.ethers.getContractFactory("KTEToken");
    const kteToken = new hre.ethers.Contract(
      address,
      KTEToken.interface,
      signer
    );

    await kteToken.mint(to, hre.ethers.utils.parseUnits(tokens, 18));
  });

task("pause", "Pause")
  .addParam("address", "Token address")
  .setAction(async (args, hre) => {
    const { address } = args;
    const accounts = await hre.ethers.getSigners();
    const signer = accounts[0];

    const KTEToken = await hre.ethers.getContractFactory("KTEToken");
    const kteToken = new hre.ethers.Contract(
      address,
      KTEToken.interface,
      signer
    );

    await kteToken.pause();
  });

task("unpause", "Un Pause")
  .addParam("address", "Token address")
  .setAction(async (args, hre) => {
    const { address } = args;
    const accounts = await hre.ethers.getSigners();
    const signer = accounts[0];

    const KTEToken = await hre.ethers.getContractFactory("KTEToken");
    const kteToken = new hre.ethers.Contract(
      address,
      KTEToken.interface,
      signer
    );

    await kteToken.unpause();
  });

task("approve", "Approve to spend")
  .addParam("address", "Token address")
  .addParam("sa", "Spender Address")
  .addOptionalParam("amount", "To address")
  .setAction(async (args, hre) => {
    const { address, amount = "9000000000", sa } = args;
    const accounts = await hre.ethers.getSigners();
    const signer = accounts[0];

    const KTEToken = await hre.ethers.getContractFactory("KTEToken");
    const kteToken = new hre.ethers.Contract(
      address,
      KTEToken.interface,
      signer
    );
    await kteToken.approve(sa, hre.ethers.utils.parseUnits(amount, 18));
  });
