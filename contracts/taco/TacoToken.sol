// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "./core/DeflationaryERC20.sol";
import "./Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/SocialProofable.sol";

interface IUniswapV2Pair {
    function sync() external;
}

interface IUniswapV2Factory {
    function createPair(address tokenA, address tokenB)
        external
        returns (address pair);
}

/**                                 
 *            ╭╯╭╯  ╭╯╭╯  ╭╯╭╯      
 *        ╱▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔╲▔▔▔╲   
 *       ╱      ╭╮   ╭╮      ╲╮╮ ╲  
 *       ▏     ▂▂▂▂▂▂▂▂▂     ▕╮╮ ▕  
 *       ▏     ╲▂▂▂▂▂▂▂╱     ▕╮╮ ▕  
 *       ╲▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂╲▂▂╱  
 *               TACOS              
 *
 *
 * @title TacoToken
 * @dev Contract for $TACO.
 *      Based of the work by Tendies $TEND
 *
 * @author soulbar@protonmail.com ($TEND)
 * @author @Onchained ($TACO)
 */
contract TacoToken is DeflationaryERC20, Pausable, SocialProofable {
    using SafeMath for uint256;

    //===============================================//
    //          Contract Variables                   //
    //===============================================//

    // SOCIAL PROOF //
    string public constant override getTwitter = "Taconomics101";
    string public constant override getTelegram = "TacoGram";
    string public constant override getWebsite = "taconomics.io";
    string public constant override getGithub = "taconomics";
    uint256 public twitterProof;
    bytes public githubProof;

    // CRUNCH //
    uint256 public lastCrunchTime;
    uint256 public totalCrunched;

    // crunchRate is defined as a percentage (e.g. 1 = 1%, 5 = 5%, 27 = 27%)
    uint256 public crunchRate;

    /**
     * rewardForTaquero is defined as a percentage (e.g. 1 = 1%, 5 = 5%, 27 = 27%)
     * this is however a percentage of the crunchRate.
     */ 
    uint256 public rewa