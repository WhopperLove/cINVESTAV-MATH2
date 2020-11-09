// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "../core/RedeemableNFT.sol";

contract ExposedRedeemableNFT is RedeemableNFT {

  constructor(address _nftsAddress)
  public
  RedeemableNFT(_nftsAddress)
  {}

  function addNFT(
    uint256 nftId,
    uint256 pointsToRedeem,
    address strategy
  ) public {
    _addNFT(nftId, pointsToRedeem, strategy);
  }

  function updateNFTStrategy(uint256 nftId, address