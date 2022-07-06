// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC20, ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract Diam is ERC20Permit, Ownable {

constructor() ERC20("Diam", "DIAM") ERC20Permit("Diam"){
_mint(_msgSender(), 1000000000000000000000000000);
}

}