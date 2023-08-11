// pages/_app.js
import { ChakraProvider } from "@chakra-ui/react";
import { Web3Provider } from "../context/Web3Context";
import { extendTheme } from "@chakra-ui/react";

const config = {
	initialColorMode: "light",
	useSystemColorMode: false,
};

const theme = extendTheme({ config });

export default function MyApp({ Component, pageProps }) {
	// Use the layout defined at the page level, if available
	const getLayout = Component.getLayout || ((page) => page);
	return (
		<ChakraProvider theme={theme}>
			<Web3Provider>{getLayout(<Component {...pageProps} />)}</Web3Provider>
		</ChakraProvider>
	);
}
