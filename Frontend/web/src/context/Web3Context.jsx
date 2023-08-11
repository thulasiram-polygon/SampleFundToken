import React, { useState, useEffect, useContext, createContext } from "react";
import { ethers } from "ethers";

import fundMarket from "../abi/fundMarket.json";
import wusdc from "../abi/wusdc.json";
import UserTransactionModal from "../../modals/UserTransactionModal";
const { FUND_MARKET_ADDRESS, FUND_MARKET_ABI } = fundMarket;
const { WUSDC_ADDRESS, WUSDC_ABI } = wusdc;

const Web3Context = createContext(null);
// This is the stnderd Price for now BUT it will be changed to the real price
const FTK_PRICE = 0.001;

export const Web3Provider = ({ children }) => {
	const [account, setAccount] = useState(null);
	const [contextLoading, setContextLoading] = useState(true);
	const [isUserWhitelisted, setIsUserWhitelisted] = useState(false);
	const [isUserFundManager, setIsUserFundManager] = useState(false);
	const [wusdcBalance, setWusdcBalance] = useState(0);
	const [ftkBalance, setFtkBalance] = useState();

	const getWUSDContract = async () => {
		const { ethereum } = window;
		if (!ethereum) return console.log("No Ethereum");
		const provider = new ethers.BrowserProvider(ethereum);
		const signer = await provider.getSigner();
		const contract = new ethers.Contract(WUSDC_ADDRESS, WUSDC_ABI, signer);
		return contract;
	};

	const getFundMarketContract = async () => {
		const { ethereum } = window;
		if (!ethereum) return console.log("No Ethereum");
		const provider = new ethers.BrowserProvider(ethereum);
		const signer = await provider.getSigner();
		const contract = new ethers.Contract(
			FUND_MARKET_ADDRESS,
			FUND_MARKET_ABI,
			signer,
		);
		return contract;
	};

	useEffect(() => {
		initContext();
	}, []);

	useEffect(() => {
		fetchUserStatus();
	}, [account]);

	const fetchUserStatus = async () => {
		const { ethereum } = window;
		if (!!ethereum && !!account) {
			setContextLoading(true);
			await checkWhitelist();
			await checkFundManager();
			await fetchUserWUSDCBalance();
			await fetchUserFundBalance();
			setContextLoading(false);
		}
	};

	const checkWhitelist = async () => {
		try {
			const contract = await getFundMarketContract();
			const isWhitelisted = await contract.isWhitelistedShareholder(account);
			console.log(`Account: ${account}`, `Whitelisted: ${isWhitelisted}`);
			setIsUserWhitelisted(isWhitelisted);
		} catch (error) {
			console.error(error);
		}
	};

	const checkFundManager = async () => {
		try {
			const contract = await getFundMarketContract();
			const fundAdmin = await contract.getFundAdmin();
			console.log(`Account: ${account}`, `Fund Admin: ${fundAdmin}`);
			setIsUserFundManager(account.toLowerCase() === fundAdmin.toLowerCase());
		} catch (error) {
			console.error(error);
		}
	};

	const initContext = async () => {
		if (window?.ethereum) {
			setContextLoading(true);
			try {
				const accounts = await window.ethereum.request({
					method: "eth_requestAccounts",
				});
				setAccount(accounts[0]);
				setContextLoading(false);
			} catch (err) {
				console.log(err);
				setContextLoading(false);
			}
		}
	};

	const connectWallet = async () => {
		const { ethereum } = window;
		if (!ethereum) {
			alert("Please install MetaMask!");
			return;
		}
		try {
			const result = await ethereum.request({ method: "eth_requestAccounts" });
			console.log("RESULT", result?.[0]);
			setAccount(result?.[0]);
			//getBalance();
		} catch (e) {
			console.log("ERROR", e);
		}
	};

	// WUSD Functions
	const fetchUserWUSDCBalance = async () => {
		try {
			const contract = await getWUSDContract();
			const balance = await contract.balanceOf(account);
			console.log(`Account: ${account}`, `WUSD Balance: ${balance}`);
			setWusdcBalance(ethers.formatEther(balance));
		} catch (error) {
			console.error(error);
		}
	};

	const mintWUSDC = async (amount) => {
		if (parseInt(amount) < 1) return alert("Amount must be greater than 0");

		try {
			const contract = await getWUSDContract();
			const amountInWei = ethers.parseEther(amount.toString());
			await contract.mintForMe(amountInWei);

			await fetchUserWUSDCBalance();
		} catch (error) {
			setContextLoading(false);
			console.error(error);
		}
	};

	const approveWUSDC = async (amount) => {
		if (parseInt(amount) < 1) return alert("Amount must be greater than 0");

		try {
			const contract = await getWUSDContract();
			await contract.approve(
				FUND_MARKET_ADDRESS,
				ethers.parseEther(amount.toString()),
			);
		} catch (error) {
			setContextLoading(false);
			console.error(error);
		}
	};

	// Fund Market Functions

	const fetchUserFundBalance = async () => {
		const contract = await getFundMarketContract();
		const balance = await contract.balanceOf(account);
		const balanceInEth = ethers.formatEther(balance);
		console.log(`Account: ${account}`, `FTK Balance: ${balanceInEth}`);

		if (!!balanceInEth && balanceInEth > 0) {
			return setFtkBalance(balanceInEth);
		}
		return setFtkBalance(0);
	};

	const buyFundTokens = async (amount) => {
		console.log("BUYING FUND TOKENS: Amount", amount);
		if (parseInt(amount) < 1) return alert("Amount must be greater than 0");
		try {
			const amountInWei = ethers.parseEther(amount.toString());
			console.log("BUYING FUND TOKENS: Amount in Wei", amountInWei);

			// Buy Fund Tokens
			const contract = await getFundMarketContract();
			await contract.purchaseFund(amountInWei);
			// Update balances
			await fetchUserFundBalance();
			await fetchUserWUSDCBalance();
		} catch (error) {
			console.error(error);
		}
	};

	const sellFundTokens = async (amount) => {
		if (parseInt(amount) < 1) return alert("Amount must be greater than 0");
		if (ftkBalance < parseInt(amount))
			return alert("Amount must be less than your balance");

		try {
			const amountInWei = ethers.parseEther(amount.toString());

			// Sell Fund Tokens
			const contract = await getFundMarketContract();
			await contract.liquidateFund(amountInWei);
			// Update balances
			await fetchUserFundBalance();
			await fetchUserWUSDCBalance();
		} catch (error) {
			console.error(error);
		}
	};

	const fetchShareholders = async () => {
		try {
			const contract = await getFundMarketContract();
			const whiteListedShareholders =
				await contract.getWhiteListedShareholders();
			console.log("WhiteListedShareholders", whiteListedShareholders);
			return whiteListedShareholders;
		} catch (error) {
			console.error(error);
			alert(`Error fetching shareholders: ${error.message}`);
			return [];
		}
	};

	const addShareholder = async (address) => {
		if (!address || address.length != 42)
			return alert("Please enter an address");
		try {
			const contract = await getFundMarketContract();
			await contract.addShareHolder(address);
		} catch (error) {
			console.error(error);
		}
	};

	const distributeDividends = async (rate, price) => {
		console.log("DISTRIBUTING DIVIDENDS", rate, price);
		if (!rate || !price) return alert("Please enter a rate and price");

		try {
			const contract = await getFundMarketContract();
			await contract.distributeDividend(
				ethers.parseEther(rate.toString()),
				ethers.parseEther(price.toString()),
			);
		} catch (error) {
			console.error(error);
		}
	};

	const isWUSDCApproved = async (amount) => {
		try {
			const contract = await getWUSDContract();
			const approvedAmount = await contract.allowance(
				account,
				FUND_MARKET_ADDRESS,
			);
			console.log("APPROVED AMOUNT", approvedAmount);
			return ethers.formatEther(approvedAmount) >= parseInt(amount);
		} catch (error) {
			console.error(error);
			return false;
		}
	};

	const getBaseTokenPrice = async () => {
		try {
			const contract = await getFundMarketContract();
			const baseTokenPrice = await contract.baseTokenPrice();
			const tokenPrice = ethers.formatEther(baseTokenPrice);
			console.log("Base Token Price", tokenPrice);
			return tokenPrice;
		} catch (error) {
			console.error(error);
		}
	};

	const getFTKAmountForWUSDC = async (amount) => {
		if (parseInt(amount) < 1) return;
		const amountInWei = ethers.parseEther(amount.toString());
		try {
			const contract = await getFundMarketContract();
			const ftkAmount = await contract.getTokensAmountForGivenWUSDC(
				amountInWei,
			);

			const ftkAmountInEth = ethers.formatEther(ftkAmount);

			return ftkAmountInEth;
		} catch (error) {
			console.error(error);
		}
	};

	const fullLiquidateFund = async () => {
		try {
			const contract = await getFundMarketContract();
			await contract.fullLiquidationOfFund();
		} catch (error) {
			console.error(error);
		}
	};

	const getShareholderBalance = async (shareholder) => {
		try {
			const contract = await getFundMarketContract();
			const balance = await contract.balanceOf(shareholder);
			const balanceInEth = ethers.formatEther(balance);
			console.log(`Account: ${shareholder}`, `FTK Balance: ${balanceInEth}`);

			if (!!balanceInEth && balanceInEth > 0) {
				return balanceInEth;
			}
			return 0;
		} catch (error) {
			console.error(error);
			return 0;
		}
	};

	const getUserTransactions = async (address) => {
		if (!address || address.length != 42) return;
		console.log("GETTING TRANSACTIONS");
		try {
			const contract = await getFundMarketContract();
			const raw_txs = await contract.getShareholderTransactions(address);
			console.log("RAW TXS", raw_txs);
			const tranactions = [];

			for (let i = 0; i < raw_txs.length; i++) {
				tranactions.push(new UserTransactionModal(raw_txs[i]));
			}

			console.log("TRANSACTIONS", tranactions);
			return tranactions;
		} catch (error) {
			console.error(error);
			return [];
		}
	};

	const getAdminDetails = async () => {
		try {
			// Get total supply
			const contract = await getFundMarketContract();
			const totalSupply = await contract.totalSupply();
			console.log("Total Supply", totalSupply);
			// Get total WUSDC in contract
			const wusdcContract = await getWUSDContract();

			const totalWUSDCInContract = await wusdcContract.balanceOf(
				FUND_MARKET_ADDRESS,
			);
			console.log("Total WUSDC in contract", totalWUSDCInContract);

			return {
				totalFTKSupply: ethers.formatEther(totalSupply.toString()),
				totalWUSDCInContract: ethers.formatEther(
					totalWUSDCInContract.toString(),
				),
			};
		} catch (error) {
			console.error(error);
			return;
		}
	};

	// const fetchShareholdersWithBalances = async () => {
	// 	try {
	// 		const shareholders = await fetchShareholders();
	// 		if (shareholders.length === 0) return [];
	// 		const balances = await Promise.all(
	// 			shareholders.map(async (shareholder) => {
	// 				const balance = await getShareholderBalance(shareholder);
	// 				return {
	// 					shareholder,
	// 					balance,
	// 				};
	// 			}),
	// 		);
	// 		return balances;
	// 	} catch (error) {
	// 		console.error(error);
	// 		return [];
	// 	}
	// };

	return (
		<Web3Context.Provider
			value={{
				account,
				contextLoading,
				isUserWhitelisted,
				isUserFundManager,
				wusdcBalance,
				ftkBalance,
				FTK_PRICE,
				isWUSDCApproved,
				connectWallet,
				fetchUserWUSDCBalance,
				mintWUSDC,
				fetchUserFundBalance,
				buyFundTokens,
				fetchShareholders,
				addShareholder,
				sellFundTokens,
				distributeDividends,
				approveWUSDC,
				getBaseTokenPrice,
				getFTKAmountForWUSDC,
				fullLiquidateFund,
				getShareholderBalance,
				getUserTransactions,
				getAdminDetails,
			}}
		>
			{children}
		</Web3Context.Provider>
	);
};

export const useWeb3 = () => {
	const context = useContext(Web3Context);
	if (!context) {
		throw new Error("useWeb3 must be used within a Web3Provider");
	}
	return context;
};
