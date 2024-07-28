pragma solidity ^0.8.20;

import "../../interfaces/IHTS1594.sol";
// import "../ERC20Token.sol";
import "../../libraries/KindMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Standard implementation of ERC1594 (Subset of ERC1400 https://github.com/ethereum/EIPs/issues/1411)
 */
contract HTS1594 is IHTS1594, ERC20Token, Ownable {

    // Variable which tells whether issuance is ON or OFF forever
    // Implementers need to implement one more function to reset the value of `issuance` variable
    // to false. That function is not a part of the standard (EIP-1594) as it is depend on the various factors
    // issuer, followed compliance rules etc. So issuers have the choice how they want to close the issuance. 
    bool internal issuance = true;
    
    /// Constructor
    constructor() public  {

    }
    
    function transferWithData(address _to, uint256 _value, bytes _data) external {
        // Add a function to validate the `_data` parameter
        _transfer(msg.sender, _to, _value);
    }

    function transferFromWithData(address _from, address _to, uint256 _value, bytes _data) external {
        // Add a function to validate the `_data` parameter
        _transferFrom(msg.sender, _from, _to, _value);
    }

    function isIssuable() external view returns (bool) {
        return issuance;
    }

    function issue(address _tokenHolder, uint256 _value, bytes _data) external onlyOwner {
        // Add a function to validate the `_data` parameter
        require(issuance, "Issuance is closed");
        _mint(_tokenHolder, _value);
        emit Issued(msg.sender, _tokenHolder, _value, _data);
    }


    function redeem(uint256 _value, bytes _data) external {
        // Add a function to validate the `_data` parameter
        _burn(msg.sender, _value);
        emit Redeemed(address(0), msg.sender, _value, _data);
    }

    function redeemFrom(address _tokenHolder, uint256 _value, bytes _data) external {
        // Add a function to validate the `_data` parameter
        _burnFrom(_tokenHolder, _value);
        emit Redeemed(msg.sender, _tokenHolder, _value, _data);
    }


    function canTransfer(address _to, uint256 _value, bytes _data) external view returns (bool, bytes1, bytes32) {
        // Add a function to validate the `_data` parameter
        if (_balances[msg.sender] < _value)
            return (false, 0x52, bytes32(0));

        else if (_to == address(0))
            return (false, 0x57, bytes32(0));

        else if (!KindMath.checkAdd(_balances[_to], _value))
            return (false, 0x50, bytes32(0));
        return (true, 0x51, bytes32(0));
    }


    function canTransferFrom(address _from, address _to, uint256 _value, bytes _data) external view returns (bool, bytes1, bytes32) {
        // Add a function to validate the `_data` parameter
        if (_value > _allowed[_from][msg.sender])
            return (false, 0x53, bytes32(0));

        else if (_balances[_from] < _value)
            return (false, 0x52, bytes32(0));

        else if (_to == address(0))
            return (false, 0x57, bytes32(0));

        else if (!KindMath.checkAdd(_balances[_to], _value))
            return (false, 0x50, bytes32(0));
        return (true, 0x51, bytes32(0));
    }

}