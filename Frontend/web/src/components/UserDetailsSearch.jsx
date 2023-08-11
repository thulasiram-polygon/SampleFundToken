import { useWeb3 } from "@/context/Web3Context";
import {
	VStack,
	HStack,
	Input,
	Button,
	Text,
	Table,
	Thead,
	Tbody,
	Tfoot,
	Tr,
	Th,
	Td,
	TableCaption,
	TableContainer,
} from "@chakra-ui/react";
import { useState } from "react";

const UserDetailsSearch = () => {
	const { getUserTransactions } = useWeb3();
	const [shareHoldersTransactions, setShareHoldersTransactions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searchAddress, setSearchAddress] = useState("");
	const [fetched, setFetched] = useState(false);

	const handleInputChange = (e) => {
		const value = e.target.value;
		if (value) {
			setSearchAddress(value);
			setFetched(false);
		} else {
			setSearchAddress("");
		}
	};

	const handleSearch = async () => {
		if (searchAddress.length != 42)
			return alert("Please enter a valid address");
		setLoading(true);
		// fetch transactions
		const transactions = await getUserTransactions(searchAddress);
		console.log(`Ts: ${transactions}`);
		if (transactions) {
			setShareHoldersTransactions(transactions);
		}

		setFetched(true);
		setLoading(false);
	};

	const userTransactionsInTable = (shareHoldersTransactions) => {
		return (
			<TableContainer w='full'>
				<Table variant='simple'>
					<Thead>
						<Tr>
							<Th>ID</Th>
							<Th>TX TYPE</Th>
							<Th>WUSDC AMOUNT</Th>
							<Th>FTK AMOUNT</Th>
							<Th>TIMESTAMP</Th>
						</Tr>
					</Thead>
					<Tbody>
						{shareHoldersTransactions.map((transaction, index) => (
							<Tr key={index}>
								<Td>{transaction.txId}</Td>
								<Td>{transaction.txType}</Td>
								<Td>{transaction.wusdc_amount}</Td>
								<Td>{transaction.fund_tokens}</Td>
								<Td>{transaction.timestamp}</Td>
							</Tr>
						))}
					</Tbody>
				</Table>
			</TableContainer>
		);
	};
	return (
		<VStack w='full' spacing={8} p={8}>
			<HStack w='full' justify='space-between'>
				<Input
					w='full'
					size='lg'
					placeholder='Search by address'
					borderColor='black'
					value={searchAddress}
					onChange={handleInputChange}
				/>

				<Button
					size='lg'
					colorScheme='purple'
					onClick={handleSearch}
					isDisabled={searchAddress.length != 42}
				>
					Search
				</Button>
			</HStack>

			{shareHoldersTransactions.length > 0 &&
				userTransactionsInTable(shareHoldersTransactions)}

			{/* <VStack spacing={4} p={8}>
				{shareHoldersTransactions.length > 0 &&
					shareHoldersTransactions.map((transaction) => (
						<HStack w='full' justify='space-between'>
							<Text>{`ID: ${transaction.txId}`}</Text>
							<Text>{`TYPE: ${transaction.txType}`}</Text>
							<Text>{`WUSDC Amount: ${transaction.wusdc_amount}`}</Text>
							<Text>{`FTK Amount: ${transaction.fund_tokens}`}</Text>
							<Text>{`Timestamp: ${transaction.timestamp}`}</Text>
						</HStack>
					))}
			</VStack> */}

			{/* {!loading && fetched && shareHoldersTransactions.length == 0 && (
				<Text>No transactions found</Text>
			)} */}
		</VStack>
	);
};

export default UserDetailsSearch;
