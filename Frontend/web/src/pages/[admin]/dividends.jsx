import {
	VStack,
	Text,
	Heading,
	HStack,
	Input,
	Button,
	Spinner,
	Spacer,
} from "@chakra-ui/react";
import AdminLayout from "../../layout/AdminLayout";
import RootLayout from "../../layout/RootLayout";
import { useWeb3 } from "@/context/Web3Context";
import { useEffect, useState } from "react";

const Dividends = () => {
	const {
		distributeDividends,
		fetchShareholders,
		getShareholderBalance,
		getBaseTokenPrice,
	} = useWeb3();
	const [rate, setRate] = useState();
	const [loading, setLoading] = useState(false);
	const [baseTokenPrice, setBaseTokenPrice] = useState(0);
	const [shareHolders, setShareHolders] = useState([]);

	const [shareholdersWithBalances, setShareholdersWithBalances] = useState([]);

	useEffect(() => {
		fetchBaseTokenPrice();
		const getSharehoders = async () => {
			const shareholders = await fetchShareholders();

			setShareHolders(shareholders);
		};
		getSharehoders();
	}, []);

	const fetchBaseTokenPrice = async () => {
		const price = await getBaseTokenPrice();
		setBaseTokenPrice(price);
	};

	useEffect(() => {
		getBalances();
	}, [shareHolders]);

	const getBalances = async () => {
		if (shareHolders.length === 0) return;
		setLoading(true);
		const balances = await Promise.all(
			shareHolders.map(async (address) => {
				const balance = await getShareholderBalance(address);
				console.log(`balance: ${balance}`);
				return {
					address,
					balance,
				};
			}),
		);

		setShareholdersWithBalances(balances);
		setLoading(false);
	};

	const distribute = async () => {
		if (!rate || rate <= 0 || rate > 100) {
			return alert("Please enter a valid rate");
		}

		setLoading(true);
		await distributeDividends(rate, baseTokenPrice);
		setTimeout(() => {
			getBalances();
			setLoading(false);
		}, 10000);
	};

	const updateRate = (e) => {
		const rate = parseInt(e.target.value);
		if (rate < 1 || rate > 100) return;
		setRate(rate);
	};

	const returnDistributionArea = () => {
		return (
			<VStack w='full' h='30%' p={8}>
				<Text fontWeight='semibold'>FTK Price: {`$${baseTokenPrice} `}</Text>
				<HStack w='full' h='full' justify='center'>
					<Input
						placeholder='Enter Distribution Rate'
						size='lg'
						borderColor='black'
						width='50%'
						onChange={updateRate}
						value={!rate ? "" : rate}
					/>
					<Button
						colorScheme='purple'
						isDisabled={!rate || parseInt(rate) < 1}
						onClick={distribute}
					>
						Distribute
					</Button>
				</HStack>
			</VStack>
		);
	};

	const returnShareholdersInfoArea = () => {
		if (loading) return <Spinner />;

		if (shareholdersWithBalances.length === 0)
			return <Text>No Data Available</Text>;

		return (
			<VStack w='90%' h='80%' p={8} borderRadius='md' overflowY='scroll'>
				{shareholdersWithBalances.map((shareholder, index) => {
					return (
						<HStack
							h='40px'
							spacing={10}
							key={index}
							w='full'
							justify='center'
							p={2}
						>
							<Text size='lg' fontWeight='semibold' textAlign='left'>
								{shareholder.address}
							</Text>
							<Spacer />
							<Text size='lg' fontWeight='semibold'>
								{shareholder.balance}
							</Text>
						</HStack>
					);
				})}
			</VStack>
		);
	};

	return (
		<VStack h='full' w='full' p={8}>
			<Heading>Dividends</Heading>
			{returnDistributionArea()}
			{returnShareholdersInfoArea()}
		</VStack>
	);
};
Dividends.getLayout = function getLayout(page) {
	return (
		<RootLayout>
			<AdminLayout>{page}</AdminLayout>
		</RootLayout>
	);
};
export default Dividends;
