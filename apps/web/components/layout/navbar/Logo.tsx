import Link from "next/link";
import Image from "next/image";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="relative h-8 w-8 md:h-9 md:w-9">
        <Image
          src="/assets/logos/genbi.svg"
          alt="GenBI Logo"
          fill
          className="object-contain brightness-0 invert"
        />
      </div>
      <span className="text-lg md:text-xl font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
        GenBI Jatim
      </span>
    </Link>
  );
}
