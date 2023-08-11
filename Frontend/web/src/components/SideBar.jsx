import { VStack, Text, Link, Heading } from "@chakra-ui/react";
import NextLink from "next/link";

const SideBar = () => {
	return (
		<VStack w='15%' h='full' bg='purple.200' p={8}>
			<VStack pt={20} spacing={8} w='full'>
				<Link as={NextLink} href='/admin'>
					<Heading size='md' w='full'>
						Home
					</Heading>
				</Link>
				<Link as={NextLink} href='/admin/shareholders'>
					<Heading size='md'>Shareholders</Heading>
				</Link>
				<Link as={NextLink} href='/admin/dividends'>
					<Heading size='md'>Dividends</Heading>
				</Link>
			</VStack>
		</VStack>
	);
};

export default SideBar;
