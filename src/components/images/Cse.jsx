import Image from "next/image";
import LogoImg from "../../../public/cse.png"

export default function Cse() {
	return (
		<Image
			src={LogoImg}
			alt="cse logo"
			placeholder="blur"
			className="inline"
			width={150}
		/>
		
	);
}