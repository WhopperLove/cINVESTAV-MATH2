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
    uint256 public rewardForTaquero;

    /**
     * Taco Tuesday means the reward is multiplied by a factor defined here.
     * This percentage is defined as a multiplier with 1 decimal.
     * (e.g. 15 = 1.5x, 10 = 1x, 2 = 2x)
     * This is a multiplier applied to the rewardForTaquero percentage
     * (e.g. if rewardForTaquery = 2%, and multiplier is 20 (2x), then the reward is 4%)
     */
    uint256 public tacoTuesdayRewardMultiplier;

    struct TaqueroStats {
        uint256 timesCrunched;
        uint256 tacosCrunched;
    }

    mapping(address => TaqueroStats) public taquerosCrunchStats;
    address[] public taqueros;

    // UNISWAP //
    IERC20 public WETH;
    IUniswapV2Factory public uniswapFactory;
    address public uniswapPool;

    //===============================================//
    //                 Constructor                   //
    //===============================================//
    constructor(uint256 initialSupply, address _uniswapFactoryAddress, address _wethToken)
        public
        Pausable()
        DeflationaryERC20("Tacos", "TACO")
    {
        _mint(msg.sender, initialSupply);

        // Initialize UniswapFactory
        uniswapFactory = IUniswapV2Factory(_uniswapFactoryAddress);
        WETH = IERC20(_wethToken);

        // Crunch variables
        crunchRate = 4; // Initial crunch rate set at 4%
        rewardForTaquero = 1; // Initial reward percentage set at 1% (1% of 4%)
        tacoTuesdayRewardMultiplier = 20; // Initial tacoTuesday multiplier set at 2x

    }

    //===============================================//
    //                   Events                      //
    //===============================================//
    event PoolCrunched(
        address taquero,
        uint256 crunchedAmount,
        uint256 newTotalSupply,
        uint256 newUniswapPoolSupply,
        uint256 taqueroReward,
        uint256 timesCrunched,
        uint256 totalTacosCrunched
    );

    //===============================================//
    //                   Methods                     //
    //===============================================//

    // UNISWAP POOL //
    function setUniswapPool() external onlyOwner {
        require(uniswapPool == address(0), "TacoToken: pool already created");
        uniswapPool = uniswapFactory.createPair(address(WETH), address(this));
    }

    // TOKEN TRANSFER HOOK //
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
        require(
            !paused || msg.sender == pauser,
            "TacoToken: Cannot transfer tokens while game is paused and sender is not the Pauser."
        );
    }

    // PAUSABLE OVERRIDE //
    function unpause() external onlyPauser {
        super._unpause();

        // Start crunching
        lastCrunchTime = now;
    }

    // CRUNCH VARIABLES SETTERS //
    function setCrunchRate(uint256 _crunchRate) externa