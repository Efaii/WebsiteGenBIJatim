"use client";

import { useState } from "react";
import { Users, Briefcase } from "lucide-react";
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from "@/components/MotionWrapper";
import { SectionHeader } from "@/components/SectionHeader";
import { ProfileCard } from "./ProfileCard";
import { Member as BPHMember } from "@repo/types";

interface Division {
  id: string;
  title: string;
  subtitle?: string;
  accent: string;
  members: BPHMember[];
}

interface OrganizationStructureProps {
  bph: BPHMember[];
  divisions: Division[];
  isKomisariat?: boolean;
}

export function OrganizationStructure({ bph, divisions, isKomisariat }: OrganizationStructureProps) {
  // Find a division that matches BPH to get its dynamic subtitle/tagline from Admin
  const bphDivision = divisions.find(d => 
    d.title.toLowerCase().includes("harian") || 
    d.title.toLowerCase().includes("inti") ||
    d.title.toUpperCase() === "BPH"
  );
  
  // Filter out the BPH division from the rest of the list to avoid duplication
  const otherDivisions = divisions.filter(d => d.id !== bphDivision?.id);

  const allSections = [
    { 
      id: "bph",
      title: bphDivision?.title, 
      subtitle: bphDivision?.subtitle, 
      members: bph, 
      accent: bphDivision?.accent || "blue" 
    },
    ...otherDivisions.map(div => ({
      ...div,
      members: isKomisariat && div.members.length > 0 ? [div.members[0]] : div.members
    }))
  ];

  const renderTitle = (title: string) => {
    // Priority 1: Handle hyphen - (Media Komunikasi, etc)
    if (title.includes(" - ")) {
      const parts = title.split(" - ");
      return (
        <>
          {parts[0]} <span className="text-blue-600">- {parts.slice(1).join(" - ")}</span>
        </>
      );
    }
    
    // Priority 2: Handle " dan " (Pengembangan dan Pendidikan, etc)
    if (title.includes(" dan ")) {
      const parts = title.split(" dan ");
      return (
        <>
          {parts[0]} <span className="text-blue-600">dan {parts.slice(1).join(" dan ")}</span>
        </>
      );
    }

    // Default: Last word split (BPH, Sinergi, etc)
    const words = title.split(" ");
    if (words.length <= 1) return title;
    const lastWord = words.pop();
    return (
      <>
        {words.join(" ")} <span className="text-blue-600">{lastWord}</span>
      </>
    );
  };

  return (
    <div className="flex flex-col gap-24 py-16 md:py-24">
      {allSections.map((section: any, idx) => (
        section.members && section.members.length > 0 && (
          <section key={section.id || idx} className="container mx-auto px-6 lg:px-8 xl:px-12 max-w-7xl relative z-10">
            <div className="w-full lg:px-6 xl:px-10">
              <SlideUp once amount={0.1}>
                <SectionHeader
                  title={renderTitle(section.title)}
                  description={section.subtitle}
                  align="center"
                  variant="light"
                  className="mb-12"
                />
              </SlideUp>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {section.members.map((member: any, i: number) => (
                <FadeIn 
                  key={`${section.title}-${i}`} 
                  delay={0.2 + i * 0.08}
                  duration={1.5}
                  once
                  amount={0.1}
                >
                  <ProfileCard member={member} />
                </FadeIn>
              ))}
            </div>
            </div>
          </section>
        )
      ))}
    </div>
  );
}
