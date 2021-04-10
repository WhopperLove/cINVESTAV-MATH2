
import { ethers } from "@nomiclabs/buidler";
import { expect } from "chai";
import { Signer } from "ethers";

import { TaconomicsFactory } from '../../../src/types/TaconomicsFactory';
import { Taconomics } from '../../../src/types/Taconomics';

import { ExposedRedeemableNftFactory } from '../../../src/types/ExposedRedeemableNftFactory';
import { ExposedRedeemableNft } from '../../../src/types/ExposedRedeemableNft';

import { EvenRedeemStrategyFactory } from '../../../src/types/EvenRedeemStrategyFactory';
import { EvenRedeemStrategy } from '../../../src/types/EvenRedeemStrategy';

describe("RedeemableNFT", function() {
  let deployer: Signer;
  let deployerAddress: string;
  let redeemer: Signer;
  let redeemableNFT: ExposedRedeemableNft;
  let taconomics: Taconomics;

  beforeEach(async function () {
    [deployer, redeemer] = await ethers.getSigners();

    deployerAddress = await deployer.getAddress();

    taconomics = await (new TaconomicsFactory(deployer)).deploy(
      "0xa5409ec958c83c3f309868babaca7c86dcb077c1",
      "https://game.taconomics.io/tacos/",
      "https://game.taconomics.io/contract/taconomics-erc1155"
    );
    await taconomics.deployed();

    await taconomics.create(1, 0, []);

    redeemableNFT = await (new ExposedRedeemableNftFactory(deployer)).deploy(taconomics.address);
    await redeemableNFT.deployed();

    await taconomics.addMinter(redeemableNFT.address);
  });

  describe("addNFT", function () {
    it("fails to add a new NFT when the NFT does not exists", async function () {
      await expect(redeemableNFT.addNFT(2, 10000, "0x0000000000000000000000000000000000000000"))
        .to.be.revertedWith("RedeemableNFT#_addNFT: NFT doesn't exist");
    });

    it("succesfully adds a new NFT when the NFT exists", async function () {
      await redeemableNFT.addNFT(1, 10000, "0x0000000000000000000000000000000000000000");
      expect((await redeemableNFT.nfts(1)).pointsToRedeem).to.equal(10000);
    });
