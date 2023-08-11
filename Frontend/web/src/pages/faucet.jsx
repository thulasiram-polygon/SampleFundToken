import { useEffect, useState } from "react";
import { Button, Heading, Input, VStack, Text } from "@chakra-ui/react";
import { useWeb3 } from "../context/Web3Context";
import RootLayout from "@/layout/RootLayout";

const Faucet = () => {
	const { mintWUSDC, wusdcBalance, fetchUserWUSDCBalance } = useWeb3();
	const [loading, setLoading] = useState(false);
	const [amount, setAmount] = useState();

	const handleMint = async () => {
		if (!amount) return alert("Please enter an amount");
		setLoading(true);
		await mintWUSDC(amount);
		setTimeout(async () => {
			setLoading(false);
			await fetchUserWUSDCBalance();
			setAmount(0);
		}, 5000);
	};

	useEffect(() => {
		fetchUserWUSDCBalance();
	}, []);

	const handleAmountChange = (e) => {
		const amount = parseInt(e.target.value);
		if (!amount || amount < 0) return setAmount(0);

		setAmount(amount);
	};
	return (
		<VStack w='full' h='full' justify='center' align='center' p={8} spacing={8}>
			<Heading size='lg' padding='20px'>
				Faucet
			</Heading>
			<Text size='lg' fontWeight='bold'>
				{`WUSDC: ${wusdcBalance}`}
			</Text>
			<VStack w='50%' justify='center' spacing={8}>
				<Input
					placeholder='Enter amount'
					borderColor='purple.400'
					borderWidth='2px'
					borderRadius='xl'
					focusBorderColor='purple.600'
					value={amount}
					onChange={handleAmountChange}
				/>
				<Button colorScheme='purple' isLoading={loading} onClick={handleMint}>
					Get WUSDC
				</Button>
			</VStack>
		</VStack>
	);
};

Faucet.getLayout = (page) => {
	return <RootLayout>{page}</RootLayout>;
};

export default Faucet;
