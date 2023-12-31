// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IToken.sol";

contract BridgeBase {
    IToken public token;

    mapping(address => mapping(uint256 => bool)) public processedNonces;

    enum Step {
        Burn,
        Mint
    }

    event Transfer(
        address from,
        address to,
        uint256 amount,
        uint256 date,
        uint256 nonce,
        bytes signature,
        Step indexed step
    );

    constructor(address _token) {
        token = IToken(_token);
    }

    function burn(
        address to,
        uint256 amount,
        uint256 nonce,
        bytes calldata signature
    ) external {
        require(
            processedNonces[msg.sender][nonce] == false,
            "transfer already processed"
        );
        processedNonces[msg.sender][nonce] = true;
        
        token.burn(msg.sender, amount);
        emit Transfer(
            msg.sender,
            to,
            amount,
            block.timestamp,
            nonce,
            signature,
            Step.Burn
        );
    }

    function mint(
        address from,
        address to,
        uint256 amount,
        uint256 nonce,
        bytes calldata signature
    ) external {
        // Calculate the hash of the message to be signed
        bytes32 message = prefixed(
            keccak256(abi.encodePacked(from, to, amount, nonce))
        );
        // Check if the signature matches the hash of the message
        require(recoverSigner(message, signature) == from, "wrong signature");
        // Check if the nonce has already been processed
        require(
            processedNonces[from][nonce] == false,
            "transfer already processed"
        );
        processedNonces[from][nonce] = true;
        
        // Mint the specified amount of tokens to the receiver
        token.mint(to, amount);
        // Emit the Transfer event with transfer details and step
        emit Transfer(
            from,
            to,
            amount,
            block.timestamp,
            nonce,
            signature,
            Step.Mint
        );
    }

    // Utility function to calculate the hash of the signed message
    function prefixed(bytes32 hash) internal pure returns (bytes32) {
        // Calculate the hash of the message with the Ethereum signed message prefix
        return keccak256(abi
.encodePacked("\x19Ethereum Signed Message:\n32", hash));
}

function recoverSigner(bytes32 message, bytes memory sig) internal pure returns (address) {
    // Declare variables to hold the values of v, r and s in the signature
    uint8 v;
    bytes32 r;
    bytes32 s;

    // Split the signature into its components (v, r, s)
    (v, r, s) = splitSignature(sig);

    // Recover the address that signed the message
    return ecrecover(message, v, r, s);
}

function splitSignature(bytes memory sig) internal pure returns (uint8, bytes32, bytes32) {
    // Ensure that the length of the signature is 65 bytes
    require(sig.length == 65);

    // Declare variables to hold the values of r, s, and v in the signature
    bytes32 r;
    bytes32 s;
    uint8 v;

    // Extract the values of r, s, and v from the signature
    assembly {
        r := mload(add(sig, 32))
        s := mload(add(sig, 64))
        v := byte(0, mload(add(sig, 96)))
    }

    // Return the extracted values (v, r, s)
    return (v, r, s);
}
}