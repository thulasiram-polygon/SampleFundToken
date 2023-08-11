import { HStack, VStack } from "@chakra-ui/react";
import SidBar from "../components/SideBar";
const AdminLayout = ({ children }) => {
	return (
		<HStack h='100vh' w='full' p={0} margin={-2}>
			<SidBar />
			<VStack w='full' h='full' p={10}>
				{children}
			</VStack>
		</HStack>
	);
};

export default AdminLayout;
