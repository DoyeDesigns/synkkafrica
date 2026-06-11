import type { Session } from "next-auth";

type UserAvatarProps = {
  session: Session;
};

export function UserAvatar({ session }: UserAvatarProps) {
  const { name, email, image } = session.user;

  return (
    <div className="flex items-center gap-2">
      {image ? (
        <img
          src={image}
          alt={name ?? email ?? "User avatar"}
          className="h-8 w-8 rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-700">
          {(name?.[0] ?? email?.[0] ?? "?").toUpperCase()}
        </div>
      )}
      <span className="hidden text-sm text-zinc-700 sm:inline">
        {name ?? email}
      </span>
    </div>
  );
}
