import { Cse, Provin, Vema, Newton, Gtec } from "./images/Export";

const partners = [
	Cse, Provin, Vema, Newton, Gtec
];

export default function HeroSection() {
  return (
		<>
			<section className="text-center pt-10">
				<h1 className="font-display px-55 text-6xl text-raisin font-bold mb-6">
					Esperienza e Innovazione nei Sistemi di Continuità dal 2006
				</h1>
				<p className="text-lg text-raisin mb-6">
					Soluzioni personalizzate per energia, industria, Networking e molto altro.
				</p>
			</section>
			<section className="relative overflow-hidden w-full outline-black outline-2">
				<div className="flex items-center animate-sliding p-3.5 gap-12">
					{
						partners.concat(partners).map((Partner, i) => (
							<div key={i} className="flex items-center justify-center min-w-[160px]">
								<Partner />
							</div>
						))
					}
				</div>
			</section>
		</>
  );
}