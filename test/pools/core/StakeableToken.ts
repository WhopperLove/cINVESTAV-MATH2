import { ethers } from "@nomiclabs/buidler";
import { expect } from "chai";
import { Signer } from "ethers";

import { ExposedStakeableTokenFactory } from '../../../src/types/ExposedStakeableTokenFactory';
import { ExposedStakeableToken } from '../../../src/types/ExposedStakeableToken';

import { NeverStakeStrategyFactory } from '../../../src/types/NeverStakeStrategyFactory';
import { NeverStakeStrategy } from '../../../src/types/NeverStakeStrategy';

import { KarmaTokenMockFactory } from "../../../src/types/KarmaTokenMockFactory";
import { KarmaTokenMock } from "../../../src/types/KarmaTokenMock";

describe("StakeableToken", function() {
  let deployer: Signer;
  let staker: Signer;
  let stakeableTokenWrapper: ExposedStakeableToken;
  let underlyingToken: KarmaTokenMock;

  beforeEach(async function () {
    [deployer, staker] = await ethers.getSigners();

    const karmaTokenFactory = new KarmaTokenMockFactory(deployer);
    underlyingToken = await karmaTokenFactory.deploy();
    await underlyingToken.deployed();

    const stakeableTokenWrapperFactory = new ExposedStakeableTokenFactory(deployer);
    stakeableTokenWrapper = await stakeableTokenWrapperFactory.deploy(underlyingToken.address, "0x0000000000000000000000000000000000000000");
  });

  describe("#stake", function() {
    it("Cannot stake before approving underlying", async function () {
      await expect(stakeableTokenWrapper.stake(100))
        .to.be.revertedWith("ERC20: transfer amount exceeds allowance");
    });

    it("Cannot stake when underlying balance is 0", async function () {
      await underlyingToken.connect(staker).approve(stakeableTokenWrapper.address, 100);
      await expect(stakeableTokenWrapper.connect(staker).stake(100))
        .to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("Can stake, after approval and with enough balance", async function () {
      const stakerAddress = await staker.getAddress();
      await underlyingToken.transfer(stakerAddress, 100);
      await underlyingToken.connect(staker).approve(stakeableTokenWrapper.address, 100);
      await stakeableTokenWrapper.connect(staker).stake(100);

      expect(await underlyingToken.balanceOf(stakeableTokenWrapper.address)).to.equal(100);
    });

    it("contract balance of underlying has the total staked balance", async function () {
      const stakerAddress = await staker.getAddress();
      await underlyingToken.transfer(stakerAddress, 100);
      await underlyingToken.connect(staker).approve(stakeableTokenWrapper.address, 100);
      await stakeableTokenWrapper.connect(staker).stake(100);

      expect(await stakeableTokenWrapper.balanceOf(stakerAddress)).to.equal(100);
      expect(await underlyingToken.balanceOf(stakeableTokenWrapper.address)).to.equal(100);

      await underlyingToken.approve(stakeableTokenWrapper.address, 120);
      await stakeableTokenWrapper.stake(120);

      const deployerAddress = await deployer.getAddress();

      expect(await stakeableTokenWrapper.balanceOf(deployerAddress)).to.equal(120);
      expect(await underlyingToken.balanceOf(stakeableTokenWrapper.address)).to.equal(220);
    });

    it("succesfully updates lastUpdateTime", async function () {
      const stakerAddress = await staker.getAddress();
      await underlyingToken.transfer(stakerAddress, 100);
      await underlyingToken.connect(staker).approve(stakeableTokenWrapper.address, 100);

      expect(await stakeableTokenWrapper.lastUpdateTime(stakerAddress)).to.equal(0);
      await stakeableTokenWrapper.connect(staker).stake(100);
      expect(await stakeableTokenWrapper.lastUpdateTime(stakerAddress)).not.to.equal(0);
    });

    it("cannot stake when strategy returns false", async function () {
      const neverStakeStrategy = await (new NeverStakeStrategyFactory(deployer)).deploy();
      const stakerAddress = await staker.getAddress();
      await stakeableTokenWrapper.setStakeableStrategy(neverStakeStrategy.address);

      await underlyingToken.transfer(stakerAddress, 100);
      await underlyingToken.connect(staker).approve(stakeableTokenWrapper.address, 100);

      await expect(stakeableTokenWrapper.connect(staker).stake(100))
        .to.be.revertedWith("StakeableToken#_stake: Sender doesn't meet the requirements to stake.");
    });
  });

  describe("#withdraw", function() {
    it("cannot withdraw when nothing is staked", async function() {
      await expect(stakeableTokenWrapper.withdraw(100))
        .to.be.revertedWith("Cannot withdraw more than what's staked.");
    });

    it("can withdraw exactly the same amount that was staked", async function() {
      await underlyingToken.approve(stakeableTokenWrapper.address, 120);
      await stakeableTokenWrapper.stake(120);

      expect(await underlyingToken.balanceOf(stakeableTokenWrapper.address)).to.equal(120);

      await stakeableTokenWrapper.withdraw(120);
      expect(await underlyingToken.balanceOf(stakeableTokenWrapper.address)).to.equal(0);
    });

    it("can withdraw less than what was staked", async function() {
      await underlyingToken.approve(stakeableTokenWrapper.address, 120);
      await stakeableTokenWrapper.stake(120);

      expect(await underlyingToken.balanceOf(stakeableTokenWrapper.address)).to.equal(120);

      await stakeableTokenWrapper.withdraw(60);
      expect(await underlyingToken.balanceOf(stakeableTokenWrapper.address)).to.equal(60);
    });

    it("cannot withdraw more than what was staked", async function() {
      await underlyingToken.approve(stakeableTokenWrapper.address, 120);
      await stakeableTokenWrapper.stake(120);

      expect(await underlyingToken.balanceOf(stakeableTokenWrapper.address)).to.equal(120);

      await expect(stakeableTokenWrapper.withdraw(200))
        .to.be.revertedWith("Cannot withdraw more than what's staked.");
    });

    it("succesfully updates lastUpdateTime", async function () {
      const deplo