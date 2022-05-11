//SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.12;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/TokenTimelock.sol";

/**
 * @dev A token holder contract that will allow a beneficiary to extract the
 * tokens after a given release time.
 *
 * Useful for simple vesting schedules like "advisors get all of their tokens
 * after 1 year".
 */
contract LPTokenTimelock is TokenTimelock {
    constructor(
        IERC20 token_,
        address beneficiary_,
        uint256 releaseTime_
    ) TokenTimelock(token_, beneficiary_, releaseTime_) {
    }
}
