import Image from "next/image";
import LogoImg from "../../../public/provin.png"

export default function Provin() {
	return (
		<Image
			src={LogoImg}
			alt="provin logo"
			placeholder="blur"
			className="inline"
			width={150}
		/>
		
	);
}