"use client";

import { FadeIn, SlideUp } from "@/components/MotionWrapper";

const milestones = [
	{
		year: "2011",
		title: "Inisiasi Nasional",
		description:
			"Program Beasiswa Bank Indonesia resmi diluncurkan secara nasional sebagai wujud dedikasi untuk negeri.",
	},
	{
		year: "2022",
		title: "GenBI Surabaya",
		description:
			"GenBI Surabaya mulai terorganisir, menyatukan visi dari berbagai kampus mitra.",
	},
	{
		year: "2023",
		title: "GenBI Koordinator Komisariat Suramadu-Bojonegoro",
		description:
			"GenBI Surabaya berubah nama menjadi GenBI Korkom Suramadu-Bojonegoro.",
	},
	{
		year: "2024",
		title: "GenBI Koordinator Komisariat Jawa Timur",
		description:
			"GenBI Korkom Suramadu-Bojonegoro berubah nama menjadi GenBI Korkom Jawa Timur.",
	},
];

export function Story() {
	return (
		<section className="relative overflow-hidden bg-[#203866] py-16 text-white md:py-24">
			<div className="absolute bottom-0 left-1/2 top-40 hidden w-px -translate-x-1/2 bg-cyan-400/10 md:block" />

			<div className="container relative z-10 mx-auto max-w-7xl px-6 lg:px-8 xl:px-12">
				<FadeIn>
					<header className="mx-auto max-w-3xl text-center">
						<h2 className="text-3xl font-bold tracking-tight md:text-4xl">
							Sejarah Perjalanan
						</h2>
						<p className="mt-5 text-base leading-relaxed text-blue-200/80 md:text-lg">
							Rekam jejak dedikasi GenBI Jawa Timur dari masa ke masa.
						</p>
					</header>
				</FadeIn>

				<div className="relative mt-12 space-y-10 md:mt-14 md:space-y-0">
					{milestones.map((milestone, index) => {
						const isEven = index % 2 === 0;

						return (
							<SlideUp
								key={milestone.year}
								delay={index * 0.1}
								className={`relative flex flex-col md:min-h-[156px] md:flex-row md:items-start ${
									!isEven ? "md:flex-row-reverse" : ""
								}`}
							>
								<div
									className={`w-full px-4 text-center md:w-1/2 ${
										isEven
											? "md:pr-12 md:text-right"
											: "md:pl-12 md:text-left"
									}`}
								>
									<p className="text-lg font-bold tracking-[0.16em] text-cyan-400">
										{milestone.year}
									</p>
									<h3 className="mt-2 text-xl font-bold md:text-2xl">
										{milestone.title}
									</h3>
									<p
										className={`mx-auto mt-3 max-w-sm text-sm leading-relaxed text-blue-200/70 md:mx-0 md:text-base ${
											isEven ? "md:ml-auto md:text-right" : ""
										}`}
									>
										{milestone.description}
									</p>
								</div>

								<div className="absolute left-1/2 top-1 hidden h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border border-cyan-500 bg-[#203866] shadow-[0_0_15px_rgba(6,182,212,0.5)] md:flex">
									<div className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
								</div>

								<div className="hidden w-1/2 md:block" />
							</SlideUp>
						);
					})}
				</div>
			</div>
		</section>
	);
}
