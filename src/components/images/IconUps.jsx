import Image from "next/image";
import LogoImg from "../../../public/IconUps.png"

export default function Logo() {
	return (
		<Image
			src={LogoImg}
			alt="UPS"
			placeholder="blur"
			className="object-contain -rotate-90"
		/>
		
	);
}