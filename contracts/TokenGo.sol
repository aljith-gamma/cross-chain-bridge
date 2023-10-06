// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './TokenBase.sol';

contract TokenGo is TokenBase {
  constructor() TokenBase('GO Token', 'GTK') {}
}