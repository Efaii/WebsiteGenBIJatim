"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export interface BPHMember {
  role: string;
  name: string;
  image: string;
  major?: string;
  instagram?: string;
  linkedin?: string;
  email?: string;
}

export const MemberDetailModal = ({
  member,
  onClose,
}: {
  member: BPHMember;
  onClose: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-sm bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-cyan-900/40 to-transparent"></div>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white/70 hover:text-white rounded-full transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-center pt-12 pb-8 px-6 text-center relative z-0">
          {/* Image */}
          <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-cyan-400 to-blue-600 mb-6 shadow-lg">
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#0f172a] relative bg-gray-800">
              <Image
                src={member.image}
                alt={member.name}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Info */}
          <h3 className="text-2xl font-bold text-white mb-1">{member.name}</h3>
          <p className="text-cyan-400 font-medium text-sm tracking-wide uppercase mb-4 px-3 py-1 bg-cyan-950/30 border border-cyan-500/20 rounded-full">
            {member.role}
          </p>

          <div className="space-y-1 mb-8 text-blue-100/80 text-sm">
            {member.major && (
              <p className="font-semibold text-white">{member.major}</p>
            )}
            {/* Note: University name is currently hardcoded in the component copy, 
                might want to make it prop if needed later. For now leaving as is or making generic. 
                Original had "Universitas Airlangga". I should probably make it generic or pass university name.
                For now I'll change it to be generic or removed if strictly specific to data.
                Actually, the original design had it. I'll make it generic "GenBI Jawa Timur" or pass it as prop.
                Let's add `university` to props or just use "GenBI Jawa Timur" for generic/About page use.
                In commissariat page it has "Universitas Airlangga" hardcoded.
                I will add `university` prop optional, default to "GenBI Jawa Timur".
             */}
            <p>GenBI Jawa Timur</p>
          </div>

          {/* Socials */}
          <div className="flex items-center gap-4">
            {member.instagram && (
              <a
                href={`https://instagram.com/${member.instagram.replace(
                  "@",
                  ""
                )}`}
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-white/5 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 border border-white/10 rounded-full text-white transition-all group"
                title="Instagram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:scale-110 transition-transform"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
            )}
            {member.linkedin && (
              <a
                href={`https://linkedin.com/in/${member.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-white/5 hover:bg-[#0077b5] border border-white/10 rounded-full text-white transition-all group"
                title="LinkedIn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:scale-110 transition-transform"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            )}
            <a
              href={`mailto:${member.email || "email@example.com"}`}
              className="p-3 bg-white/5 hover:bg-green-600 border border-white/10 rounded-full text-white transition-all group"
              title="Email"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:scale-110 transition-transform"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
