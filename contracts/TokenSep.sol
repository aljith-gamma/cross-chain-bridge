// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './TokenBase.sol';

contract TokenSep is TokenBase {
  constructor() TokenBase('SEP Token', 'STK') {}
}