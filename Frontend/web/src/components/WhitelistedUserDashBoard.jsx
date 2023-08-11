import {
	HStack,
	Heading,
	VStack,
	Text,
	Tabs,
	TabList,
	TabPanels,
	Tab,
	TabPanel,
	Image,
} from "@chakra-ui/react";
import BuyFundComponent from "./BuyFundComponent";
import SellFundComponent from "./SellFundComponent";
import { useWeb3 } from "../context/Web3Context";
import { useEffect, useState } from "react";

const WhitelistedUserDashBoard = () => {
	const { ftkBalance, getBaseTokenPrice, wusdcBalance } = useWeb3();
	const [baseTokenPrice, setBaseTokenPrice] = useState(0);

	const returnProfileImageArea = () => {
		return (
			<VStack w='35%' justify='center' spacing={8}>
				<VStack w='full' h='200px' shadow='md' borderRadius={9}>
					<Image w='full' h='full' src='./avatar.jpg' />
				</VStack>
			</VStack>
		);
	};

	const returnProfileDetailsArea = () => {
		return (
			<VStack h='200px' align='start' justify='center' pl={8}>
				<Text fontWeight='semibold'>Name: xxxxxxxxxxxx</Text>
				<Text
					fontWeight='semibold'
					textShadow='2xl'
				>{`WUSDC: ${wusdcBalance} `}</Text>
				<Text fontWeight='semibold'>{`Fund Balance: ${ftkBalance} FTK`}</Text>
			</VStack>
		);
	};

	const returnFundFunctionsArea = () => {
		return (
			<Tabs minW='50%'>
				<TabList justifyContent='center'>
					<Tab>Buy Fund</Tab>
					<Tab>Liquidate Fund</Tab>
				</TabList>

				<TabPanels w='full'>
					<TabPanel>
						<BuyFundComponent />
					</TabPanel>
					<TabPanel>
						<SellFundComponent />
					</TabPanel>
				</TabPanels>
			</Tabs>
		);
	};

	return (
		<VStack w='full' h='full' align='center' p={8} spacing={10}>
			<HStack w='50%' spacing='0' p={8}>
				{returnProfileImageArea()}
				{returnProfileDetailsArea()}
			</HStack>
			{returnFundFunctionsArea()}
		</VStack>
	);
};

export default WhitelistedUserDashBoard;
