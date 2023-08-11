import {
	VStack,
	Text,
	Heading,
	HStack,
	Input,
	Button,
	Spinner,
} from "@chakra-ui/react";
import AdminLayout from "../../layout/AdminLayout";
import RootLayout from "../../layout/RootLayout";
import { useEffect, useState } from "react";
import { useWeb3 } from "@/context/Web3Context";
const Shareholders = () => {
	const { fetchShareholders, addShareholder } = useWeb3();
	const [loading, setLoading] = useState(false);
	const [shareholders, setShareholders] = useState([]);
	const [shareholder, setShareholder] = useState("");

	// Fetch Shareholders from  contract
	// and present them

	useEffect(() => {
		fetchShareholdersList();
	}, []);

	const fetchShareholdersList = async () => {
		setLoading(true);

		const shareholders = await fetchShareholders();
		setShareholders(shareholders);

		setLoading(false);
	};

	const onChangeShareholder = (e) => {
		const shareholder = e.target.value;
		if (!shareholder) {
			setShareholder("");
		} else {
			setShareholder(shareholder);
		}
	};

	const handleAddShareholder = async () => {
		setLoading(true);
		await addShareholder(shareholder);
		setTimeout(() => {
			setLoading(false);

			fetchShareholdersList();
		}, 6000);
	};

	const shareHolderlsListArea = () => {
		if (loading) return <Spinner />;
		if (shareholders.length === 0) {
			return (
				<Heading size='md' color='gray.400'>
					No Whitelisted Shareholders
				</Heading>
			);
		}

		return (
			<VStack w='80%' spacing={8} overflowY='scroll' overflowX='hidden'>
				<Heading size='md'>
					Whitelisted Shareholders: {`${shareholders?.length}`}
				</Heading>

				<VStack w='full' h='90%'>
					{shareholders.map((shareholder, index) => (
						<HStack h='40px' spacing={4} key={shareholder}>
							<Text>{index + 1}</Text>
							<Text size='lg' fontWeight='semibold'>
								{shareholder}
							</Text>
						</HStack>
					))}
				</VStack>
			</VStack>
		);
	};

	const addShareholderArea = () => {
		// Add a new shareholder to the contract
		// and update the list
		return (
			<VStack w='full' h='20%' p={4}>
				<HStack w='full' h='full' spacing={4} w='60%'>
					<Input
						placeholder='Add New Shareholder Address. Ex: 0x123...'
						size='lg'
						borderColor='black'
						onChange={onChangeShareholder}
						value={!!shareholder ? shareholder : ""}
						onCh
					/>
					<Button
						colorScheme='purple'
						size='lg'
						onClick={handleAddShareholder}
						isDisabled={shareholder.length !== 42}
						isLoading={loading}
					>{`+ Add `}</Button>
				</HStack>
			</VStack>
		);
	};

	return (
		<VStack h='full' w='full' p={8} spacing={8} align='center' mb={8}>
			<Heading size='lg'> Manage Shareholders</Heading>
			{addShareholderArea()}
			{shareHolderlsListArea()}
		</VStack>
	);
};

Shareholders.getLayout = function getLayout(page) {
	return (
		<RootLayout>
			<AdminLayout>{page}</AdminLayout>
		</RootLayout>
	);
};

export default Shareholders;
