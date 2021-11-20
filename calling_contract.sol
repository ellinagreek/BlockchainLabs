pragma solidity ^0.8.0;

contract Caller {
    function call_contract(address addr, bytes32 commitment) public payable {
        bool res = false;
        (res,) = addr.delegatecall(abi.encodeWithSignature("commit(bytes32)", commitment));
        require(res == true,"Fail!");
        
    }
}