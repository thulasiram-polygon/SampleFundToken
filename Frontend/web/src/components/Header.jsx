import {
	Button,
	HStack,
	Heading,
	Spacer,
	Spinner,
	Text,
	Link,
} from "@chakra-ui/react";
import { useWeb3 } from "../context/Web3Context";
import { trimAddress } from "../helpers/index";
import NextLink from "next/link";

const Header = () => {
	const { account, connectWallet, contextLoading, wusdcBalance } = useWeb3();

	return (
		<HStack w='full' h='80px' bg='purple.800' p={4}>
			<Link as={NextLink} href='/'>
				<Heading size='lg' color='white'>
					Web3 FM
				</Heading>
			</Link>
			<Spacer />

			<HStack spacing={12}>
				<Link as={NextLink} href='/faucet'>
					<Text color='white'>Faucet</Text>
				</Link>
				<Link as={NextLink} href='/admin'>
					<Text color='white'>Admin</Text>
				</Link>
				{contextLoading ? (
					<Spinner color='white' />
				) : (
					<Button
						colorScheme='whiteAlpha'
						variant='outline'
						onClick={!account ? connectWallet : () => {}}
					>
						{account ? trimAddress(account) : "Connect Wallet"}
					</Button>
				)}
			</HStack>
		</HStack>
	);
};

export default Header;
