const { ethers } = require("hardhat");
const INITAL_TOKEN_COUNT = "1000000000000000000000000";
const BASE_TOKEN_PRICE = "100000000000000000"; //0.01
/**
 * Deploying contracts with the account: 0x883C1dEb5691cBC54FFeE0e08401485D9770243c
WUSDC Token deployed to: 0xCA98CCb1c944Bd5eF1997f5C69c8a0724f8E643A
Check the token balance of the deployer....
Balance: 1000000000000000000000000
Fund Market Deployed to 0x7FA0b86D6FddB9215fCc398dE3DFF3ea320d9222
ram@Thulasirams-MacBook-Pro-14 Contracts % 
 */
async function main() {
	const [deployer] = await ethers.getSigners();
	console.log("Deploying contracts with the account:", deployer.address);
	const token = await ethers.deployContract(
		"WUSDC",
		[INITAL_TOKEN_COUNT],
		deployer,
	);
	await token.waitForDeployment();
	console.log("WUSDC Token deployed to:", token.target);
	console.log("Check the token balance of the deployer....");
	const balance = await token.balanceOf(deployer.address);
	console.log("Balance:", balance.toString());
	const fundMarket = await ethers.deployContract(
		"FundMarket",
		[token.target, BASE_TOKEN_PRICE, "Fund Token", "FTK"],
		deployer,
	);
	await fundMarket.waitForDeployment();

	console.log("Fund Market Deployed to", fundMarket.target);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
