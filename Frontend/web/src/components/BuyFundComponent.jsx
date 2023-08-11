import { useEffect, useState } from "react";
import { VStack, Text, Input, Button } from "@chakra-ui/react";
import { useWeb3 } from "../context/Web3Context";

const BuyFundComponent = () => {
	const {
		buyFundTokens,
		approveWUSDC,
		isWUSDCApproved,
		getBaseTokenPrice,
		getFTKAmountForWUSDC,
	} = useWeb3();
	const [wusdcAmount, setWusdcAmount] = useState(0);
	const [loading, setLoading] = useState(false);
	const [approved, setApproved] = useState(false);
	const [baseTokenPrice, setBaseTokenPrice] = useState(0);
	const [ftkEstimate, setFtkEstimate] = useState(0);

	useEffect(() => {
		checkWUSDCApproval();
		fetchBaseTokenPrice();
		setFtkEstimate(0);
	}, []);

	const fetchBaseTokenPrice = async () => {
		setLoading(true);
		const baseTokenPrice = await getBaseTokenPrice();
		setBaseTokenPrice(baseTokenPrice);
		setLoading(false);
	};

	const checkWUSDCApproval = async () => {
		setLoading(true);
		const isApproved = await isWUSDCApproved(wusdcAmount);

		setApproved(isApproved);

		setLoading(false);
	};

	const checkFTKEstimate = async (amount) => {
		setLoading(true);
		const ftkAmount = await getFTKAmountForWUSDC(amount);

		setFtkEstimate(ftkAmount);
		setLoading(false);
	};

	const handleWusdcAmountChange = (e) => {
		const wusdc = parseInt(e.target.value);
		if (!wusdc || wusdc <= 0) {
			setWusdcAmount(0);
			setFtkEstimate(0);
			return;
		}
		setWusdcAmount(wusdc);
		checkWUSDCApproval();
		checkFTKEstimate(wusdc);
	};

	const setApproveWUSDC = async () => {
		setLoading(true);

		await approveWUSDC(wusdcAmount);
		setTimeout(() => {
			setLoading(false);
		}, 5000);
	};

	const proceedBuyingFundTokens = async () => {
		setLoading(true);

		await buyFundTokens(wusdcAmount);
		setTimeout(() => {
			setLoading(false);
		}, 5000);
	};

	const handleBuyFundTokens = async () => {
		if (!approved) {
			await setApproveWUSDC();
		} else {
			await proceedBuyingFundTokens();
		}
	};
	return (
		<VStack
			w='full'
			bg='white'
			h='300px'
			borderRadius='xl'
			shadow='xl'
			padding={8}
		>
			<Text size='lg' fontWeight='bold'>
				{`Base Price: ${baseTokenPrice}`}
			</Text>
			<Text size='lg' fontWeight='bold'>
				{`FTK: ${ftkEstimate > 0 ? ftkEstimate : 0}`}
			</Text>

			<VStack w='80%' h='full' justify='center' align='center' spacing={4}>
				<Input
					w='full'
					size='lg'
					placeholder='Please enter the WUSDC amount'
					value={wusdcAmount > 0 ? wusdcAmount : ""}
					onChange={handleWusdcAmountChange}
				/>
				<Button
					size='lg'
					colorScheme='purple'
					onClick={handleBuyFundTokens}
					isDisabled={wusdcAmount <= 0}
					isLoading={loading}
				>
					{approved ? `Buy FTK` : `Approve WUSDC`}
				</Button>
			</VStack>
		</VStack>
	);
};
export default BuyFundComponent;
