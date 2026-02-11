"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Instagram, Linkedin, Mail } from "lucide-react";

export interface BPHMember {
  role: string;
  name: string;
  image: string;
  university: string; // Renamed from major (as it held uni names)
  major?: string; // New field for Academic Major (e.g. S1 Akuntansi)
  instagram?: string;
  linkedin?: string;
  email?: string;
  division?: string;
}

export const MemberDetailModal = ({
  member,
  onClose,
  contextTitle = "Pengurus GenBI Jawa Timur", // Default value
}: {
  member: BPHMember;
  onClose: () => void;
  contextTitle?: string;
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
        className="relative w-full max-w-sm bg-blue-950/80 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-cyan-900/40 to-transparent"></div>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-full transition-colors border border-white/5"
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
          <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-cyan-400 to-blue-600 mb-6 shadow-lg shadow-blue-500/20">
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-blue-950/50 relative bg-blue-950/30">
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
            <p className="text-white font-medium text-base mb-1">
              {contextTitle}
            </p>
            <div className="h-px w-12 bg-white/10 mx-auto my-3"></div>
            <p className="text-cyan-200 font-bold text-lg tracking-wide">
              {member.university}
            </p>
            {member.major && (
              <p className="text-blue-200/60 text-xs font-medium uppercase tracking-wider">
                {member.major}
              </p>
            )}
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
                className="p-3 bg-white/5 border border-white/10 rounded-full text-white/80 transition-all hover:bg-cyan-950/50 hover:border-cyan-500/50 hover:text-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center"
                title="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {member.linkedin && (
              <a
                href={`https://linkedin.com/in/${member.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-white/5 border border-white/10 rounded-full text-white/80 transition-all hover:bg-cyan-950/50 hover:border-cyan-500/50 hover:text-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center"
                title="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                className="p-3 bg-white/5 border border-white/10 rounded-full text-white/80 transition-all hover:bg-cyan-950/50 hover:border-cyan-500/50 hover:text-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center"
                title="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
