pragma solidity ^0.8.0;

contract Caller {

    function callContract(address addr, bytes32 commitment) public payable {
        (bool res, ) = addr.call{value: msg.value, gas: 500000}(abi.encodeWithSignature("commit(bytes32)", commitment));
        require(res == true, "Fail!t");
    }

    receive() external payable {
    }
}