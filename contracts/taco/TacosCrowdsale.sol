// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IUniswapV2Router.sol";

interface Pauseable {
    function unpause() external;
}

/**
 * @title TacosCrowdsale
 * @dev Crowdsale contract for $TACO.
 *      Pre-Sale done in this manner:
 *        1st Round: Early Cooks (2 ETH contribution max during round, CAP 70 ETH)
 *        2nd Round: $KARMA holders (2 ETH contribution max during round, CAP 70 ETH)
 *        3rd Round: Public Sale (2 ETH contribution max during round, CAP 70 ETH)
 *        - Any single address can contribute at most 2 ETH -
 *      1 ETH = 20000 $TACO (during the entire sale)
 *      Hardcap = 210 ETH
 *      Once hardcap is reached:
 *        All liquidity is added to Uniswap and locked automatically, 0% risk of rug pull.
