pragma solidity ^0.4.4;

import "./ConvertLib.sol";

contract UTCoin {
    uint256 public totalSupply = 10000; // トークンの総量
    address public owner; // オーナーアドレス
    mapping (address => uint) balances; // 各アドレスの残高
    mapping (address => bool) public blacklist; // ブラックリスト

    // オーナーアドレスからのみ実行可能
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    // イベント通知
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Blacklisted(address indexed target);
    event DeleteFromBlacklist(address indexed target);

    /**
     * コンストラクタ
     */
    function UTCoin() {
        balances[tx.origin] = totalSupply;
        owner = msg.sender;
    }

    /**
     * アドレスをブラックリストに登録
     * @param addr 対象のアドレス
     */
    function blacklisting(address addr) onlyOwner {
        blacklist[addr] = true;
        Blacklisted(addr);
    }

    /**
     * アドレスをブラックリストから削除
     * @param addr 対象のアドレス
     */
    function deleteFromBlacklist(address addr) onlyOwner {
        blacklist[addr] = false;
        DeleteFromBlacklist(addr);
    }

    /**
     * 送金
     * @param receiver 受信アドレス
     * @param amount 送金量
     * @return sufficient
     */
    function sendCoin(address receiver, uint amount) returns(bool sufficient) {
        // 不正送金チェック
        require(balances[msg.sender] >= amount);
        require(balances[receiver] + amount >= balances[receiver]);

        // ブラックリストチェック
        require(blacklist[msg.sender] == false);
        require(blacklist[receiver] == false);

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
