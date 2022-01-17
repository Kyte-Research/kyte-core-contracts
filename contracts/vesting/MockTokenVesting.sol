//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./TokenVesting.sol";

contract MockTokenVesting is TokenVesting {
  uint256 mockTime = 0;

  constructor(address token_) TokenVesting(token_) {}

  function setCurrentTime(uint256 _time) external {
    mockTime = _time;
  }

  function getCurrentTime() internal view returns (uint256) {
    return mockTime;
  }
}
