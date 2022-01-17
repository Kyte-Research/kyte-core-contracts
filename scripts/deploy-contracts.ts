import { TOKEN_CONTRACT, TOKEN_NAME, TOKEN_SYMBOL, TOKEN_TOTAL_SUPPLY } from './constant';
const hre = require('hardhat');

export async function deployToken(): Promise<string> {
    const KTEToken = await hre.ethers.getContractFactory(TOKEN_CONTRACT);
    const kteToken = await KTEToken.deploy(TOKEN_NAME, TOKEN_SYMBOL, hre.ethers.utils.parseUnits(TOKEN_TOTAL_SUPPLY, 18));
    await kteToken.deployed();
    return kteToken.address;
  }
  