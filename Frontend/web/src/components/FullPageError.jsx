import { useWeb3 } from "@/context/Web3Context";
import { Heading, VStack, Text } from "@chakra-ui/react";
import { BiError } from "react-icons/bi";

const FullPageError = ({ mainText, subText }) => {
	return (
		<VStack w='full' h='full' justify='center' align='center' p={8}>
			<VStack
				w='50%'
				h='50%'
				border='2px'
				borderColor='whiteAlpha.500'
				borderRadius='2xl'
				p={8}
				shadow='lg'
				bg='white'
				spacing={4}
			>
				<BiError size='100px' color='red' />
				<Heading size='lg' color='red'>
					{`${mainText}`}
				</Heading>
				<Text fontSize='lg'>{`${subText}`}</Text>
			</VStack>
		</VStack>
	);
};

export default FullPageError;
