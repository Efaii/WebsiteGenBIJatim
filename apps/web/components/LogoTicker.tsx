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
    <div className="w-full py-10 overflow-hidden">
      <div className="container mx-auto">
        <div className="flex relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)] py-8">
          <div className="flex flex-none gap-24 pr-24 items-center animate-ticker will-change-transform transform-gpu">
            {[...COMMISSARIATS, ...COMMISSARIATS].map((comm, index) => (
              <div
                key={index}
                className="flex-none group relative transition-all duration-500"
              >
                <div className="h-24 w-auto flex items-center justify-center">
                  <Image
                    src={comm.logo}
                    alt={`Logo ${comm.name}`}
                    width={200}
                    height={96}
                    loading="eager"
                    className="h-full w-auto object-contain max-w-[200px] brightness-0 invert grayscale opacity-80 transition-all duration-300 group-hover:brightness-100 group-hover:invert-0 group-hover:grayscale-0 group-hover:opacity-100"
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
