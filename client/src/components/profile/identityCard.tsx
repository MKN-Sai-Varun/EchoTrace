"use client";

import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

type UserInfo = {
  username: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  createdAt: string;
};

type IdentityCardProps = {
  user: UserInfo | null;
};

export default function IdentityCard({ user }: IdentityCardProps) {
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 flex flex-col items-center text-center relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-violet-500" />
      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-black shadow-lg mb-4">
        {user?.username?.charAt(0).toUpperCase() ?? "?"}
      </div>
      <h2 className="text-xl font-black text-slate-800 mb-0.5">
        {user?.firstName
          ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
          : user?.username}
      </h2>
      <p className="text-sm text-slate-500 font-medium mb-1">
        @{user?.username}
      </p>
      {user?.email && <p className="text-xs text-slate-400">{user.email}</p>}
      <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-400 font-medium">
        <Calendar className="w-3.5 h-3.5" /> Member since {joinDate}
      </div>
    </motion.div>
  );
}
