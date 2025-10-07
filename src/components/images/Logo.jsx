import Image from "next/image";
import LogoImg from "../../../public/Logo.png"

export default function Logo({className = "h-11"}) {
	return (
		<Image
			src={LogoImg}
			alt="Logo ets"
			placeholder="blur"
			className={`${className} w-auto`}
		/>
		
	);
}