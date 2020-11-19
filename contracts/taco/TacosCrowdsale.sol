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
 *
 * @author soulbar@protonmail.com ($TEND)
 * @author @Onchained ($TACO)
 */
contract TacosCrowdsale is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    //===============================================//
    //          Contract Variables                   //
    //===============================================//

    // Caps
    uint256 public constant ROUND_1_CAP = 70 ether; // CAP = 70
    uint256 public constant ROUND_2_CAP = 140 ether; // CAP = 70
    uint256 public constant ROUND_3_CAP = 210 ether; // CAP = 70
    // HARDCAP = ROUND_3_CAP
    
    // During tests, we should use 12 ether instead given that by default we only have 20 addresses.
    uint256 public constant CAP_PER_ADDRESS = 2 ether;
    uint256 public constant MIN_CONTRIBUTION = 0.1 ether;

    // Start time 08/09/2020 @ 6:00am (UTC) // For Cooks
    uint256 public constant CROWDSALE_START_TIME = 1596952800;

    // Start time 08/10/2020 @ 4:00pm (UTC)
    uint256 public constant KARMASA