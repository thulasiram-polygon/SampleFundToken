import { ethers } from "ethers";

class UserTransactionModal {
	constructor(transaction) {
		const tx = transaction.toString().split(",");
		this.txId = parseInt(tx[0]);
		this.txType = this.getType(parseInt(tx[1]));
		this.wusdc_amount = ethers.formatEther(tx[2]);
		this.fund_tokens = ethers.formatEther(tx[3]);
		this.timestamp = new Date(parseInt(tx[4]) * 1000).toGMTString();
	}

	getType(num) {
		switch (num) {
			case 0:
				return "PURCHASE";
			case 1:
				return "LIQUIDATION";
			case 2:
				return "DIVIDEND_DISTRIBUTION";
			case 3:
				return "FULL_LIQUIDATION";
			default:
				return "UNKNOWN";
		}
	}
}

export default UserTransactionModal;
