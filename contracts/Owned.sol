pragma solidity ^0.4.4;

// 所有者管理用コントラクト
contract Owned {
    address public owner; // オーナーアドレス

    // オーナー移転時のイベント
    event TransferOwnership(address old_addr, address new_addr);

    // オーナー限定メソッド用の修飾子
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    /**
     * コンストラクタ
     */
    function Owned() {
        owner = msg.sender; // コントラクト作成アドレスをオーナーとする
    }

    /**
     * オーナーを移転
     * @param new_addr 移転先のアドレス
     */
    function transferOwnership(address new_addr) onlyOwner {
        address old_addr = owner;
        owner = new_addr;
        TransferOwnership(old_addr, owner);
    }
}
