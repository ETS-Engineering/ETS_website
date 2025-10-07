import Image from "next/image";
import LogoImg from "../../../public/newton.png"

export default function Newton() {
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