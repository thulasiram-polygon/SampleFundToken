require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
	solidity: "0.8.18",
	networks: {
		mumbai: {
			url: process.env.POLYGON_MUMBAI_URL,
			accounts: [process.env.DEPLOYER_PRIVATE_KEY],
			saveDeployments: true,
		},
	},
};
