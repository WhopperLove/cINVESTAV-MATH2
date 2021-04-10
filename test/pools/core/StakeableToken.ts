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
      await underlyin