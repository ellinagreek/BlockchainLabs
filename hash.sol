pragma solidity ^0.4.22;

contract helloWorld {
    function renderHelloWorld (bytes32 blindingFactor, uint8 choice) public returns (bytes32) {
        bytes32 myhash = keccak256(abi.encodePacked(msg.sender, choice, blindingFactor));
        return myhash;
 }
}