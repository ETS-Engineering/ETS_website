import Image from "next/image";
import LogoImg from "../../../public/gtec.png"

export default function Gtec() {
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