import Link from "next/link";
import Image from "next/image";
import { Clock, MapPin, BadgeCheck } from "lucide-react";
import UserAvatar from "@/assets/avatar.jpg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ISTTime } from "../molecules/time";
import { ProfileStats } from "../molecules/profile-stats";
import * as Fade from "@/components/motion/fade";

const PROFILE = {
  name: "Abhay Bhardwaj",
  initials: "AB",
  role: "Software Engineer",
  company: "HROne",
  bio: "Software Engineer based in India, building user interfaces & enhancing experiences.",
  location: "Noida, India",
  github: "https://github.com/iamabhay17",
  mail: "mailto:hello@abhaybhardwaj.in",
  bannerUrl:
    "https://images.unsplash.com/photo-1627112155394-379b880d5080?q=80&w=1472&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
} as const;

const ProfileBanner = () => (
  <div className="group relative h-40 w-full overflow-hidden sm:h-52 md:h-60">
    <Image
      src={PROFILE.bannerUrl}
      alt="Profile banner"
      fill
      className="object-cover transition-transform duration-500 group-hover:scale-105"
      priority
    />
    {/* Gradient overlay for better text contrast */}
    <div className="absolute inset-0 bg-linear-to-t from-card/80 via-transparent to-transparent" />
  </div>
);

const ProfileAvatar = () => (
  <div className="relative -mt-16 sm:-mt-20">
    <div className="relative">
      <Avatar className="size-28 border-4 border-card sm:size-36">
        <AvatarImage
          src={UserAvatar.src}
          alt={PROFILE.name}
          className="object-cover"
        />
        <AvatarFallback className="bg-muted text-foreground text-2xl font-semibold">
          {PROFILE.initials}
        </AvatarFallback>
      </Avatar>
      {/* Online status indicator */}
      <span
        className="absolute bottom-2 right-4 size-5 rounded-full border-[3px] border-card bg-emerald-500"
        aria-label="Online"
      />
    </div>
  </div>
);

const ProfileActions = () => (
  <div className="flex gap-2 md:gap-3 pb-1">
    <Link
      href={PROFILE.github}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonVariants({
        variant: "default",
        className: "gap-2 rounded-full px-6 py-4 font-semibold",
      })}
    >
      Follow
    </Link>
    <Link
      href={PROFILE.mail}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonVariants({
        variant: "outline",
        className:
          "gap-2 rounded-full px-6 py-4 font-semibold hover:bg-muted/50",
      })}
    >
      Message
    </Link>
  </div>
);

const ProfileHeader = () => (
  <div className="flex flex-col items-start gap-4 px-4 sm:flex-row sm:items-end sm:justify-between sm:px-6 md:px-8">
    <ProfileAvatar />
    <ProfileActions />
  </div>
);

const ProfileInfo = () => (
  <div className="px-4 sm:px-6 md:px-8">
    <div className="flex items-center gap-2">
      <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground text-pretty">
        {PROFILE.name}
      </h1>
    </div>
    <p className="mt-1 text-sm lg:text-base text-primary/80">
      {PROFILE.role} at{" "}
      <span className="text-foreground font-medium">{PROFILE.company}</span>
    </p>
    <p className="text-sm lg:text-base text-muted-foreground leading-relaxed max-w-xl mt-4">
      {PROFILE.bio}
    </p>
    <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1">
        <MapPin className="size-3.5 text-primary/70" />
        {PROFILE.location}
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1">
        <Clock className="size-3.5 text-primary/70" />
        <ISTTime />
      </span>
    </div>
  </div>
);

export const HeroSection = () => (
  <Fade.Item>
    <header className="w-full overflow-hidden rounded-lg border border-border bg-card">
      <ProfileBanner />
      <div className="pt-2">
        <ProfileHeader />
      </div>
      <div className="mt-4 mb-8">
        <ProfileInfo />
      </div>
    </header>
  </Fade.Item>
);
