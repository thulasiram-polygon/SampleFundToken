import { Spinner, Flex } from "@chakra-ui/react";

const FullPageSpinner = () => {
	return (
		<Flex
			w='full'
			h='full'
			justify='center'
			align='center'
			bg='gray.900'
			position='fixed'
			top='0'
			left='0'
			zIndex='100'
		>
			<Spinner size='xl' color='purple.400' />
		</Flex>
	);
};

export default FullPageSpinner;
