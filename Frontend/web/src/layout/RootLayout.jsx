import { VStack } from "@chakra-ui/react";
import Header from "../components/Header";

const RootLayout = ({ children }) => {
	return (
		<VStack h='100vh' bg='gray.100' w='full' overflow='hidden'>
			<Header />
			{children}
		</VStack>
	);
};

export default RootLayout;
