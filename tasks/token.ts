import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { keccak256, toUtf8Bytes } from "ethers/lib/utils";


const ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";


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

    await kteToken.mint(to, hre.ethers.utils.parseUnits(tokens, 18), {
      gasLimit: 8000000,
    });
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

    await kteToken.pause({gasLimit: 8000000});
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

task("grant-admin", "Give role to any user")
  .addParam("to", "Address of the user")
  .addParam("address", "Token address")
  .setAction(async (args, hre) => {
    const { to, address } = args;
    const accounts = await hre.ethers.getSigners();
    const signer = accounts[0];

    const KTEToken = await hre.ethers.getContractFactory("KTEToken");
    const kteToken = new hre.ethers.Contract(
      address,
      KTEToken.interface,
      signer
    );
    await kteToken.grantRole(
      ADMIN_ROLE,
      to
    );
  });


  task("revoke-admin", "Give role to any user")
  .addParam("of", "Address of the user")
  .addParam("address", "Token address")
  .setAction(async (args, hre) => {
    const { of, address } = args;
    const accounts = await hre.ethers.getSigners();
    const signer = accounts[0];

    const KTEToken = await hre.ethers.getContractFactory("KTEToken");
    const kteToken = new hre.ethers.Contract(
      address,
      KTEToken.interface,
      signer
    );
    await kteToken.revokeRole(ADMIN_ROLE, of);
  });


task("grant-role", "Give role to any user")
  .addParam("to", "Address of the user")
  .addParam("address", "Token address")
  .addParam("role", "Role to be assigned")
  .setAction(async (args, hre) => {
    const { of, address, role='MINTER_ROLE' } = args;
    const roleKecca = keccak256(toUtf8Bytes(role));
    const accounts = await hre.ethers.getSigners();
    const signer = accounts[0];

    const KTEToken = await hre.ethers.getContractFactory("KTEToken");
    const kteToken = new hre.ethers.Contract(
      address,
      KTEToken.interface,
      signer
    );
    await kteToken.grantRole(roleKecca, of);
  });


task("revoke-role", "Revoke role of any user")
  .addParam("of", "Address of the user")
  .addParam("address", "Token address")
  .addParam("role", "Role to be assigned")
  .setAction(async (args, hre) => {
    const { of, address, role = 'MINTER_ROLE' } = args;
    const roleKecca = keccak256(toUtf8Bytes(role));
    const accounts = await hre.ethers.getSigners();
    const signer = accounts[0];

    const KTEToken = await hre.ethers.getContractFactory("KTEToken");
    const kteToken = new hre.ethers.Contract(
      address,
      KTEToken.interface,
      signer
    );
    await kteToken.revokeRole(roleKecca, of);
  });
