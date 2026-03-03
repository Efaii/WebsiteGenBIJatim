import Image from "next/image";

const COMMISSARIATS = [
  { id: 1, name: "UNESA", logo: "/assets/logos/unesa.svg" },
  { id: 2, name: "UPN Veteran Jatim", logo: "/assets/logos/upnvjt.svg" },
  { id: 3, name: "UNAIR", logo: "/assets/logos/unair.svg" },
  { id: 4, name: "ITS", logo: "/assets/logos/its.svg" },
  { id: 5, name: "UINSA", logo: "/assets/logos/uinsa.svg" },
  { id: 6, name: "UNUGIRI", logo: "/assets/logos/unugiri.svg" },
  { id: 7, name: "UTM", logo: "/assets/logos/utm.svg" },
  { id: 8, name: "PENS", logo: "/assets/logos/pens.svg" },
  { id: 9, name: "UIN Madura", logo: "/assets/logos/uinMadura.svg" },
];

export const LogoTicker = () => {
  return (
    <div className="w-full py-12 bg-white border-b border-slate-50">
      <div className="container mx-auto text-center mb-8">
        <p className="text-slate-500 text-sm font-semibold tracking-widest uppercase">
          Menaungi Mahasiswa Terbaik dari 9 Perguruan Tinggi Mitra
        </p>
      </div>
      <div className="container mx-auto">
        <div className="flex relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)] group">
          <div className="flex flex-none gap-16 md:gap-24 pr-16 md:pr-24 items-center animate-ticker will-change-transform transform-gpu group-hover:[animation-play-state:paused]">
            {[...COMMISSARIATS, ...COMMISSARIATS].map((comm, index) => (
              <div key={index} className="flex-none relative">
                <div className="h-16 md:h-20 w-auto flex items-center justify-center">
                  <Image
                    src={comm.logo}
                    alt={`Logo ${comm.name}`}
                    width={180}
                    height={80}
                    loading="eager"
                    className="h-full w-auto object-contain max-w-[150px] md:max-w-[180px] opacity-100"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
