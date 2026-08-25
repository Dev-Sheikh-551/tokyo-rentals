"use client";

interface CollectionHeaderProps {
  className?: string;
}

export default function CollectionHeader({ className }: CollectionHeaderProps) {
  return (
    <div className={`flex flex-col select-none ${className || ""}`}>
      <h2 className="font-serif-display font-light text-2xl sm:text-3xl md:text-4xl text-warm-ivory tracking-tight leading-none">
        The Collection
      </h2>
    </div>
  );
}
