import { VStack, Spinner } from "@chakra-ui/react";

const ShareHoldersTransactions = ({ loading }) => {
	if (loading) {
		return (
			<VStack w='full' h='full' p={10}>
				<Spinner />
			</VStack>
		);
	}

	return (
		<div>
			<h1>ShareHoldersTransactions</h1>
		</div>
	);
};

export default ShareHoldersTransactions;
