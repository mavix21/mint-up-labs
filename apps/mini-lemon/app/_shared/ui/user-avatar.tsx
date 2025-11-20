"use client";

import { User } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@mint-up/ui/components/avatar";

interface UserAvatarProps {
  username?: string;
  avatarUrl?: string;
  displayName?: string;
}

export function UserAvatar({
  username = "marcevizcarra",
  avatarUrl = "/lemmy.png",
  displayName,
}: UserAvatarProps) {
  return (
    <div className="bg-card flex items-center gap-3 rounded-lg px-3 py-1.5">
      <Avatar className="size-8">
        <AvatarImage src={avatarUrl} alt={username} />
        <AvatarFallback className="bg-primary/10">
          <User className="text-primary h-5 w-5" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-foreground text-base leading-tight font-semibold">
          ${username}
        </span>
      </div>
    </div>
  );
}
