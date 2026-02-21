import Link from "next/link";
import Image from "next/image";
import { Clock, MapPin } from "lucide-react";
import UserAvatar from "@/assets/avatar.jpg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ISTTime } from "../molecules/time";
import { ProfileStats } from "../molecules/profile-stats";

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
  <div className="relative h-40 w-full overflow-hidden rounded-t-sm sm:h-52 md:h-60">
    <Image
      src={PROFILE.bannerUrl}
      alt="Profile banner"
      fill
      className="object-cover"
      priority
    />
  </div>
);

const ProfileAvatar = () => (
  <div className="relative -mt-14 sm:-mt-16">
    <Avatar className="size-28 border-4 border-card shadow-md sm:size-32">
      <AvatarImage src={UserAvatar.src} alt={PROFILE.name} />
      <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
        {PROFILE.initials}
      </AvatarFallback>
    </Avatar>
    <span
      className="absolute bottom-2 right-2 size-4 rounded-full border-2 border-card bg-emerald-500"
      aria-label="Online"
    />
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
        className: "gap-2",
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
        className: "gap-2",
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
    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground text-pretty">
      {PROFILE.name}
    </h1>
    <p className="mt-1 text-sm lg:text-base text-primary/80 font-medium">
      {PROFILE.role} at {PROFILE.company}
    </p>
    <p className="text-sm lg:text-base text-muted-foreground leading-relaxed max-w-xl mt-4 mb-8">
      {PROFILE.bio}
    </p>
    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <MapPin className="size-3.5" />
        {PROFILE.location}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Clock className="size-3.5" />
        <ISTTime />
      </span>
    </div>
  </div>
);

export const HeroSection = () => (
  <header className="w-full overflow-hidden rounded-md border border-border bg-card mb-10">
    <ProfileBanner />
    <div className="pt-2">
      <ProfileHeader />
    </div>
    <div className="mt-4">
      <ProfileInfo />
    </div>
    <div className="mt-6 px-4 sm:px-6 md:px-8">
      <Separator />
    </div>
    <ProfileStats />
  </header>
);
