import Image from "next/image";
import { Member as BPHMember } from "@repo/types";
import { Instagram, Linkedin, GraduationCap } from "lucide-react";
import { getAssetUrl } from "@/lib/utils";

interface ProfileCardProps {
  member: BPHMember;
}

export function ProfileCard({ member }: ProfileCardProps) {
  return (
    <div className="group relative bg-white rounded-[2rem] flex flex-col items-stretch shadow-sm hover:shadow-xl border border-slate-100 hover:border-blue-200 transition-all duration-700 ease-[cubic-bezier(0.33,1,0.68,1)] transform-gpu overflow-hidden">
      {/* Photo Section - Timeless Clean Layout */}
      <div className="relative w-full aspect-[4/4.5] bg-slate-50 overflow-hidden shrink-0">
        <Image
          src={getAssetUrl(member.image) || "/assets/images/individu.jpg"}
          alt={member.name || "Member Photo"}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover transition-transform duration-[1000ms] ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors duration-500" />
      </div>

      {/* Content Section - Stable Height for Uniform Grid */}
      <div className="relative p-4 md:p-5 flex-1 flex flex-col min-h-[6.5rem] sm:min-h-[7.5rem] md:min-h-[8rem]">
        <div>
          <h4 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors duration-400 line-clamp-2 mb-1">
            {member.name}
          </h4>

          {/* Role - Clearer Blue Accent Style */}
          <span className="block text-[11px] sm:text-xs font-semibold text-blue-600 transition-colors group-hover:text-blue-700">
            {member.role}
          </span>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-300 flex items-center justify-between">
          {/* University - Clearer Metadata */}
          {member.university ? (
            <div className="flex items-center gap-2 text-slate-600 group-hover:text-blue-600 transition-colors">
               <GraduationCap size={16} className="text-blue-600" />
               <span className="text-[11px] font-semibold tracking-tight truncate max-w-[130px]">
                  {member.university}
               </span>
            </div>
          ) : <div />}

          {/* Social Links - Connected Style (Match Footer) */}
          <div className="flex items-center gap-2">
            {member.linkedin && (
              <a 
                href={member.linkedin}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-100 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:border-blue-600 hover:text-white hover:shadow-md transition-all duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]"
                aria-label="LinkedIn"
              >
                <Linkedin size={16} strokeWidth={2} />
              </a>
            )}
            
            {member.instagram && (
              <a 
                href={member.instagram.startsWith('http') ? member.instagram : `https://instagram.com/${member.instagram.replace('@', '')}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-100 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:border-blue-600 hover:text-white hover:shadow-md transition-all duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]"
                aria-label="Instagram"
              >
                <Instagram size={16} strokeWidth={2} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
