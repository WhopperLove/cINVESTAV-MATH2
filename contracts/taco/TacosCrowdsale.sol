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
    uint256 public constant KARMASALE_START_TIME = 1597075200;

    // Start time 08/11/2020 @ 4:00pm (UTC)
    uint256 public constant PUBLICSALE_START_TIME = 1597161600;

    // End time
    uint256 public constant CROWDSALE_END_TIME = PUBLICSALE_START_TIME + 1 days;

    // Karma Membership = 200 Karma
    uint256 public constant KARMA_MEMBERSHIP_AMOUNT = 2000000;

    // Early cooks list for round 1
    // Too many cooks? https://www.youtube.com/watch?v=QrGrOK8oZG8
    mapping(address => bool) public cookslist;

    // Contributions state
    mapping(address => uint256) public contributions;

    // Total wei raised (ETH)
    uint256 public weiRaised;

    // Flag to know if liquidity has been locked
    bool public liquidityLocked = false;

    // Pointer to the TacoToken
    IERC20 public tacoToken;

    // Pointer to the KarmaToken
    IERC20 public karmaToken;

    // How many tacos do we send per ETH contributed.
    uint256 public tacosPerEth;

    // Pointer to the UniswapRouter
    IUniswapV2Router02 internal uniswapRouter;

    //===============================================//
    //                 Constructor                   //
    //===============================================//
    constructor(
        IERC20 _tacoToken,
        IERC20 _karmaToken,
        uint256 _tacosPerEth,
        address _uniswapRouter
    ) public Ownable() {
        tacoToken = _tacoToken;
        karmaToken = _karmaToken;
        tacosPerEth = _tacosPerEth;
        uniswapRouter = IUniswapV2Router02(_uniswapRouter);
    }

    //===============================================//
    //                   Events                      //
    //===============================================//
    event TokenPurchase(
        address indexed beneficiary,
        uint256 weiAmount,
        uint256 tokenAmount
    );

    //===============================================//
    //                   Methods                     //
    //===============================================//

    // Main entry point for buying into the Pre-Sale. Contract Receives $ETH
    receive() external payable {
        // Prevent owner from buying tokens, but allow them to add pre-sale ETH to the contract for Uniswap liquidity
        if (owner() != msg.sender) {
            // Validations.
            require(
                msg.sender != address(0),
                "TacosCrowdsale: beneficiary is the zero address"
            );
            require(isOpen(), "TacosCrowdsale: sale did not start yet.");
            require(!hasEnded(), "TacosCrowdsale: sale is over.");
            require(
                weiRaised < _totalCapForCurrentRound(),
                "TacosCrowdsale: The cap for the current round has been filled."
            );
            require(
                _allowedInCurrentRound(msg.sender),
                "TacosCrowdsale: Address not allowed for this round."
            );
            require(
                contributions[msg.sender] < CAP_PER_ADDRESS,
                "TacosCrowdsale: Individual cap has been filled."
            );

            // If we've passed most validations, let's get them $TACOs
            _buyTokens(msg.sender);
        }
    }

    /**
     * Function to calculate how many `weiAmount` can the sender purchase
     * based on total available cap for this round, and how many eth they've contributed.
     *
     * At the end of the function we refund the remaining ETH not used for purchase.
     */
    function _buyTokens(address beneficiary) internal {
        // How much ETH still available for the current Round CAP
        uint256 weiAllowanceForRound = _totalCapForCurrentRound().sub(weiRaised);

        // In case there is less allowance in this cap than what was sent, cap that.
        uint256 weiAmountForRound = weiAllowanceForRound < msg.value
            ? weiAllowanceForRound
            : msg.value;

        // How many wei is this sender still able to get per their address CAP.
        uint256 weiAllowanceForAddress = CAP_PER_ADDRESS.sub(
            contributions[beneficiary]
        );

        // In case the allowance of this address is less than what was sent, cap that.
        uint256 weiAmount = weiAllowanceForAddress < weiAmountForRound
            ? weiAllowanceForAddress
            : weiAmountForRound;

        // Internal call to run the final validations, and perform the purchase.
        _buyTokens(beneficiary, weiAmount, weiAllowanceForRound);

        // Refund all unused funds.
        uint256 refund = msg.value.sub(weiAmount);
        if (refund > 0) {
            payable(beneficiary).transfer(refund);
        }
    }

    /**
     * Function that validates the minimum wei amount, then perform the actual transfer of $TACOs
     */
    function _buyTokens(address beneficiary, uint256 weiAmount, uint256 weiAllowanceForRound) internal {
        require(
            weiAmount >= MIN_CONTRIBUTION || weiAllowanceForRound < MIN_CONTRIBUTION,
