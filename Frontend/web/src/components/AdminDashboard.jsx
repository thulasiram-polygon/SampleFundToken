import { VStack, Text, Heading, Spinner, HStack } from "@chakra-ui/react";
import ShareHoldersTransactions from "./ShareHoldersTransactions";
import ShareHolderInfo from "./ShareHolderInfo";
import { useWeb3 } from "@/context/Web3Context";
import { useEffect, useState } from "react";
import UserDetailsSearch from "./UserDetailsSearch";
const AdminDashboard = () => {
	const { getAdminDetails } = useWeb3();
	const [loading, setLoading] = useState(false);
	const [adminDetails, setAdminDetails] = useState({});

	useEffect(() => {
		getAdminData();
	}, []);

	const FTK = 0;
	const WUSDC = 0;

	const getAdminData = async () => {
		setLoading(true);
		const adminDetails = await getAdminDetails();
		console.log(`adminDetails: ${adminDetails}`);
		setAdminDetails(adminDetails);
		setLoading(false);
	};

	// const getShareHoldersTransactions = async () => {
	// 	setLoading(true);
	// 	const transactions = await getTransactions();
	// 	console.log(`transactions: ${transactions}`);
	// 	if (!!transactions && transactions.length > 0) {
	// 		setShareHoldersTransactions([...transactions]);
	// 	}
	// 	setLoading(false);
	// };

	// const getActionTabs = () => {
	// 	return (
	// 		<Tabs w='70%' h='full'>
	// 			<TabList justifyContent='center'>
	// 				<Tab>Transactions</Tab>
	// 				<Tab>ShareHolders Info</Tab>
	// 			</TabList>

	// 			<TabPanels w='full' h='full'>
	// 				<TabPanel>
	// 					<ShareHoldersTransactions
	// 						loading={loading}
	// 						shareHoldersTransactions={shareHoldersTransactions}
	// 					/>
	// 				</TabPanel>
	// 				<TabPanel>
	// 					<ShareHolderInfo />
	// 				</TabPanel>
	// 			</TabPanels>
	// 		</Tabs>
	// 	);
	// };

	if (loading) return <Spinner />;

	return (
		<VStack w='90%' h='full'>
			<Heading size='lg'>Admin Dashboard</Heading>
			<VStack p={10} w='80%'>
				<HStack w='full' justify='space-between'>
					<Text fontWeight='bold' fontSize='xl' color='gray.500'>
						Total FTK:
					</Text>

					<Text fontWeight='bold' fontSize='xl' color='gray.700'>
						{`${adminDetails ? adminDetails.totalFTKSupply : FTK}`}
					</Text>
				</HStack>

				<HStack w='full' justify='space-between'>
					<Text fontWeight='bold' fontSize='xl' color='gray.500'>
						Total WUSDC:
					</Text>

					<Text fontWeight='bold' fontSize='xl' color='gray.700'>
						{`${adminDetails ? adminDetails.totalWUSDCInContract : WUSDC}`}
					</Text>
				</HStack>
			</VStack>

			<UserDetailsSearch />
		</VStack>
	);
};

export default AdminDashboard;
