import Image from "next/image";
import LogoImg from "../../../public/vema.png"

export default function Vema() {
	return (
		<Image
			src={LogoImg}
			alt="vema logo"
			placeholder="blur"
			className="inline"
			width={150}
		/>
		
	);
}