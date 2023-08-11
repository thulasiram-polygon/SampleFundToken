import { useState, useEffect, useContext } from "react";
import WhitelistedUserDashBoard from "../components/WhitelistedUserDashBoard";
import FullPageError from "@/components/FullPageError";
import { useWeb3 } from "@/context/Web3Context";
import RootLayout from "@/layout/RootLayout";

const UserPage = () => {
	const { isUserWhitelisted } = useWeb3();

	if (isUserWhitelisted) {
		return <WhitelistedUserDashBoard />;
	} else {
		return (
			<FullPageError
				mainText="Sorry, yourn't listed as a shareholder"
				subText='TIP: Ask the fund manager to whitelist you.'
			/>
		);
	}
};

UserPage.getLayout = function getLayout(page) {
	return <RootLayout>{page}</RootLayout>;
};

export default UserPage;
