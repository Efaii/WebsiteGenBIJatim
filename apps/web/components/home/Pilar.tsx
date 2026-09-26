"use client";

import { Crown, Megaphone, Rocket, type LucideIcon } from "lucide-react";
import { FadeIn, StaggerContainer } from "@/components/MotionWrapper";

const pillars: {
	title: string;
	description: string;
	icon: LucideIcon;
}[] = [
	{
		title: "Front-liners",
		description:
			"Garda terdepan dalam mengomunikasikan kebijakan Bank Indonesia kepada masyarakat.",
		icon: Megaphone,
	},
	{
		title: "Agent of Change",
		description:
			"Agen perubahan yang membawa inovasi dan solusi bagi permasalahan sosial ekonomi.",
		icon: Rocket,
	},
	{
		title: "Future Leaders",
		description:
			"Calon pemimpin masa depan yang berintegritas dan berdedikasi untuk negeri.",
		icon: Crown,
	},
];

export function Pilar() {
	return (
		<section className="relative overflow-hidden bg-white py-16 text-slate-900 md:py-24">
			<div className="container relative z-10 mx-auto max-w-7xl px-6 lg:px-8 xl:px-12">
				<div className="mx-auto max-w-3xl text-center">
					<FadeIn>
						<p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
							Kenali Peran GenBI
						</p>
						<h2 className="mt-3 text-3xl font-bold font-heading tracking-tight text-blue-700 md:text-4xl">
							3 Pilar Peran Utama
						</h2>
						<p className="mt-5 text-base leading-relaxed text-slate-600 md:text-lg">
							Tiga fungsi strategis yang dijalankan setiap anggota GenBI sebagai mitra Bank Indonesia.
						</p>
					</FadeIn>
				</div>

				<StaggerContainer className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
					{pillars.map((pillar, index) => {
						const Icon = pillar.icon;

						return (
							<FadeIn key={pillar.title} delay={0.2 + index * 0.1}>
								<article className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-slate-50/70 p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-lg hover:shadow-blue-900/10">
									<div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
										<Icon className="h-9 w-9" strokeWidth={1.5} />
									</div>
									<h3 className="text-xl font-bold text-slate-900">{pillar.title}</h3>
									<p className="mt-5 max-w-sm text-base leading-relaxed text-slate-600">
										{pillar.description}
									</p>
								</article>
							</FadeIn>
						);
					})}
				</StaggerContainer>
			</div>
		</section>
	);
}
