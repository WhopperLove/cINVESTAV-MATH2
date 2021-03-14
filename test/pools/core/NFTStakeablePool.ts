import { ethers, network } from "@nomiclabs/buidler";
import { expect } from "chai";
import { Signer } from "ethers";

import { NftStakeablePoolFactory } from '../../../src/types/NftStakeablePoolFactory';
import { NftStakeablePool } from '../../../src/types/NftStakeablePool';

import { TaconomicsFactory } from '../../../src/types/TaconomicsFactory';
import { Taconomics } from '../../../src/types/Taconomics';

import { KarmaTokenMockFactory } from "../../../src/types/KarmaTokenMockFactory";
import { KarmaTokenMock } from "../../../src/types/KarmaTokenMock";

import { NeverStakeStrategyFactory } from '../../../src/types/NeverStakeStrategyFactory';
import { EvenRedeemStrategyFactory } from '../../../src/types/EvenRedeemStrategyFactory';

describe("NFTStakeablePool", function() {
  let deployer: Signer;
  let deployerAddress: string;
  let redeemer: Signer;
  let nftStakeablePool: NftStakeablePool;
  let taconomics: Taconomics;
  let staker: Signer;
  let underlyingToken: KarmaTokenMock;

  beforeEach(async function () {
    [deployer, staker, redeemer] = await ethers.getSigners();

    deployerAddress = await deployer.getAddress();

    const karmaTokenFactory = new KarmaTokenMockFactory(deployer);
    underlyingToken = await karmaTokenFactory.deploy();
    await underlyingToken.deployed();

    taconomics = await (new TaconomicsFactory(deployer)).deploy(
      "0xa5409ec958c83c3f309868babaca7c86dcb077c1",
      "https://localhost:3000/tacos/",
      "https://localhost:3000/contract/taconomics-erc1155"
    );
    await taconomics.deployed();
    await taconomics.create(1, 0, []);

    nftStakeablePool = await (new NftStakeablePoolFactory(deployer)).deploy(
      "Test Pool",
      taconomics.address,
      underlyingToken.address,
      "0x0000000000000000000000000000000000000000"
    );
    await nftStakeablePool.deployed();

    await taconomics.addMinter(nftStakeablePool.address);
  });

  describe("#stake", function() {
    it("Cannot stake before approving underlying", async function () {
      await expect(nftStakeablePool.stake(100))
        .to.be.revertedWith("ERC20: transfer amount exceeds allowance");
    });

    it("Cannot stake when underlying balance is 0", async function () {
      await underlyingToken.connect(staker).approve(nftStakeablePool.address, 100);
      await expect(nftStakeablePool.connect(staker).stake(100))
        .to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("Can stake, after approval and with enough balance", async function () {
      const stakerAddress = await staker.getAddress();
      await underlyingToken.transfer(stakerAddress, 100);
      await underlyingToken.connect(staker).approve(nftStakeablePool.address, 100);
      await nftStakeablePool.connect(staker).stake(100);

      expect(await underlyingToken.balanceOf(nftStakeablePool.address)).to.equal(100);
    });

    it("contract balance of underlying has the total staked balance", async function () {
      const stakerAddress = await staker.getAddress();
      await underlyingToken.transfer(stakerAddress, 100);
      await underlyingToken.connect(staker).approve(nftStakeablePool.address, 100);
      await nftStakeablePool.connect(staker).stake(100);

      expect(await nftStakeablePool.balanceOf(stakerAddress)).to.equal(100);
      expect(await underlyingToken.balanceOf(nftStakeablePool.address)