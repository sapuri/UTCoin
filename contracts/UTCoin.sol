pragma solidity ^0.4.4;

import "./ConvertLib.sol";

contract UTCoin {
    uint256 public totalSupply = 10000; // トークンの総量

    // EVM上にstorage領域を定義。key => value になっていて address: uint 型で array balances を作る。
    mapping (address => uint) balances; // 各アドレスの残高

    /**
     * Transfer eventlog を定義
     * @param _from 受信アドレス
     * @param _to 送信アドレス
     * @param _value 送金額
     */
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    /**
     * コンストラクタ
     */
    function UTCoin() {
        balances[tx.origin] = totalSupply;
    }

    /**
     * 送金
     * @param receiver 受信アドレス
     * @param amount 送金量
     * @return sufficient
     */
    function sendCoin(address receiver, uint amount) returns(bool sufficient) {
        // 不正送金チェック
        if (balances[msg.sender] < amount) return false;
        if (balances[receiver] + amount < balances[receiver]) return false;

        // 送信アドレスと受信アドレスの残高を更新
        balances[msg.sender] -= amount;
        balances[receiver] += amount;

        // イベント通知
        Transfer(msg.sender, receiver, amount);

        return true;
    }

    /**
     * ETH balance を返す
     * address の持っている UTCoin balance を2倍にして返す。この時 ConvertLib contract が呼ばれる。
     * @param addr アドレス
     * @return ETH balance
     */
    function getBalanceInEth(address addr) returns(uint){
        return ConvertLib.convert(getBalance(addr),2);
    }

    /**
     * UTCoin balance を返す
     * @param addr アドレス
     * @return UTCoin balance
     */
    function getBalance(address addr) returns(uint) {
        return balances[addr];
    }
}
