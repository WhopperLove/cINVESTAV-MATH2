import { UniswapFactoryMockFactory } from '../src/types/UniswapFactoryMockFactory';
import { UniswapV2PairMockFactory } from '../src/types/UniswapV2PairMockFactory';
import { TacoTokenFactory } from "../src/types/TacoTokenFactory";

import { TaconomicsFactory } from '../src/types/TaconomicsFactory';
import { GenesisPoolFactory } from '../src/types/GenesisPoolFactory';

const { ethers, network } = require("@nomiclabs/buidler");

export async function main() {
  if (network.name != "localhost" && network.name != "buidlerevm") throw Error("Deploy script only works for local networks");

  const TOTAL_SUPPLY = "15624000000000000000000000";
  const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", await deployer.getAddress());
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Set Uniswap Mock
  const uniswapV2PairFactory = new UniswapV2PairMockFactory(deployer);
  const uniswapPool = await uniswapV2PairFactory.deploy();
  await uniswapPool.deployed();
  console.log("\nUniswapV2Pair[Mock] deployed to:", uniswapPool.address);
  const uniswapFactoryMockFactory = new UniswapFactoryMockFactory(deployer);
  const uniswapFactory= await uniswapFactoryMockFactory.deploy(uniswapPool.address);
  await uniswapFactory.deployed();
  console.log("UniswapFactory[Mock] deployed to:", uniswapPool.address);

  // Deploy Taco Token Contract
  const tacoTokenFactory = new TacoTokenFactory(deployer);
  const tacoToken = await tacoTokenFactory.deploy(TOTAL_SUPPLY, uniswapFactory.address, WETH_ADDRESS);

  await tacoToken.deployed();
  console.log("\nTacoToken deployed to:", tac