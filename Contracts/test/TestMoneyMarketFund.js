const {
	time,
	loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
//const { ethers } = require("hardhat");

const INITAL_TOKEN_COUNT = "1000000000000000000000000";
const BASE_TOKEN_PRICE = "1000000000000000"; //0.01
// Roles
// const FUND_ADMIN_ROLE = ethers.utils.keccak256("FUND_ADMIN_ROLE");
// const SHAREHOLDER_ROLE = ethers.utils.keccak256("SHAREHOLDER_ROLE");

describe("Fund Token", function () {
	async function deployMarketFundFixture() {
		// Contracts are deployed using the first signer/account by default
		const [
			owner,
			fundManager,
			user1,
			user2,
			user3,
			user4,
			user5,
			user6,
			user7,
			user8,
			user9,
			user10,
		] = await ethers.getSigners();

		const wusdc = await ethers.deployContract(
			"WUSDC",
			[INITAL_TOKEN_COUNT],
			owner,
		);
		await wusdc.waitForDeployment();
		console.log("WUSDC Token deployed to:", wusdc.target);
		console.log("Check the wusdc token balance of the deployer:");
		const balance = await wusdc.balanceOf(owner.address);
		console.log(" Owner Balance:", balance.toString());
		const fundMarket = await ethers.deployContract(
			"FundMarket",
			[wusdc.target, BASE_TOKEN_PRICE, "Fund Token", "FTK"],
			owner,
		);
		await fundMarket.waitForDeployment();

		console.log("Fund Market Deployed to", fundMarket.target);
		//console.log("Owner & Fundmarket owner", owner, await fundMarket.owner());

		return {
			owner,
			fundManager,
			user1,
			user2,
			user3,
			user4,
			user5,
			user6,
			user7,
			user8,
			user9,
			user10,
			wusdc,
			fundMarket,
		};
	}
	// Test Deployment
	describe("Deployment", async function () {
		it("Should be able to deploy WUSDC, Fund Tokens & Mints WUSDC to Owner", async function () {
			const { owner, wusdc, fundMarket } = await loadFixture(
				deployMarketFundFixture,
			);

			expect(wusdc.balanceOf(owner)).not.eqls(0);
			expect(await fundMarket.getFundAdmin()).to.equal(owner.address);
		});
	});

	// Test Owner Can change the fund admin

	// Test Fund Manager Can Whitelist User

	// Whitelisted users can buy the fund token with WUSDC token

	// Whitelisted users can liquidate tokens and get WUSDC tokens

	// Whitelisted users can liquidate total fund

	// Fund manager can distribute dividents.

	// Can fetch Shareholders Info
});
