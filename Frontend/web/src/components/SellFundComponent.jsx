import { useEffect, useState } from "react";
import { VStack, Text, Input, Button, ButtonGroup } from "@chakra-ui/react";
import { useWeb3 } from "../context/Web3Context";

const SellFundComponent = () => {
	const { sellFundTokens, ftkBalance, getBaseTokenPrice, fullLiquidateFund } =
		useWeb3();
	const [ftkAmount, setFtkAmount] = useState(0);
	const [loading, setLoading] = useState(false);

	const [baseTokenPrice, setBaseTokenPrice] = useState(0);

	useEffect(() => {
		fetchBaseTokenPrice();
	}, []);

	const fetchBaseTokenPrice = async () => {
		setLoading(true);
		const baseTokenPrice = await getBaseTokenPrice();
		setBaseTokenPrice(baseTokenPrice);
		setLoading(false);
	};

	const handleFTKAmountChange = (e) => {
		const ftk = parseInt(e.target.value);
		if (!ftk) {
			setFtkAmount(0);
			return;
		}
		setFtkAmount(ftk);
	};

	const handleSellFundTokens = async () => {
		setLoading(true);

		await sellFundTokens(ftkAmount);
		setTimeout(() => {
			setLoading(false);
		}, 5000);
	};

	const handleSellFullLiquidation = async () => {
		setLoading(true);

		await fullLiquidateFund();
		setTimeout(() => {
			setLoading(false);
		}, 5000);
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
				{`WUSDC: ${ftkAmount * baseTokenPrice}`}
			</Text>
			<VStack w='80%' h='full' justify='center' align='center' spacing={4}>
				<Input
					w='full'
					size='lg'
					placeholder='Please enter the FTK amount that you want to liquidate'
					value={ftkAmount > 0 ? ftkAmount : ""}
					onChange={handleFTKAmountChange}
				/>
				<ButtonGroup spacing={4}>
					<Button
						size='lg'
						colorScheme='purple'
						isDisabled={ftkBalance <= 0}
						isLoading={loading}
						variant='outline'
						onClick={handleSellFullLiquidation}
					>
						Full Liquidate
					</Button>
					<Button
						size='lg'
						colorScheme='purple'
						isDisabled={ftkAmount <= 0}
						isLoading={loading}
						onClick={handleSellFundTokens}
					>
						Liquidate FTK
					</Button>
				</ButtonGroup>
			</VStack>
		</VStack>
	);
};
export default SellFundComponent;
