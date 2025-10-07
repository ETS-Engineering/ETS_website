import Image from "next/image";
import LogoImg from "../../../public/LogoB.png"

export default function LogoB({className = "h-12"}) {
	return (
		<Image
			src={LogoImg}
			alt="Logo ets"
			placeholder="blur"
			className={`${className} w-auto`}
		/>
		
	);
}