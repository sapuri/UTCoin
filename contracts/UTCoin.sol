pragma solidity ^0.4.4;

import "./ConvertLib.sol";

// This is just a simple example of a coin-like contract.
// It is not standards compatible and cannot be expected to talk to other
// coin/token contracts. If you want to create a standards-compliant
// token, see: https://github.com/ConsenSys/Tokens. Cheers!

contract UTCoin {
    // EVM上にstorage領域を定義。key => value になっていて address : uint 型で array balances を作る。
    mapping (address => uint) balances;

    // Transfer eventlog を定義
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    // コンストラクタ
    function UTCoin() {
        balances[tx.origin] = 10000;
    }

    // 送信に成功した場合 Transfer Event が呼ばれる。
    function sendCoin(address receiver, uint amount) returns(bool sufficient) {
        if (balances[msg.sender] < amount) return false;
        balances[msg.sender] -= amount;
        balances[receiver] += amount;
        Transfer(msg.sender, receiver, amount);
        return true;
    }

    // address の持っている UTCoin balance を2倍にして返す。この時 ConvertLib contract が呼ばれる。
    function getBalanceInEth(address addr) returns(uint){
        return ConvertLib.convert(getBalance(addr),2);
    }

    // addressが持っている UTCoin balance を返す。
    function getBalance(address addr) returns(uint) {
        return balances[addr];
    }
}
