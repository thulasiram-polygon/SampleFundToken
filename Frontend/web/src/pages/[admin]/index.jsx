import AdminDashboard from "@/components/AdminDashboard";
import { useWeb3 } from "@/context/Web3Context";
import FullPageError from "@/components/FullPageError";
import FullPageSpinner from "@/components/FulllPageSpinner";
import AdminLayout from "../../layout/AdminLayout";
import RootLayout from "@/layout/RootLayout";

const AdminPage = () => {
	const { isUserFundManager, contextLoading } = useWeb3();

	if (contextLoading) {
		return <FullPageSpinner />;
	}
	if (isUserFundManager) {
		return <AdminDashboard />;
	} else {
		return (
			<FullPageError
				mainText='Sorry, you are not allowed to access this page'
				subText='Only Fund Manager access this page'
			/>
		);
	}
};

AdminPage.getLayout = function getLayout(page) {
	return (
		<RootLayout>
			<AdminLayout>{page}</AdminLayout>
		</RootLayout>
	);
};

export default AdminPage;
