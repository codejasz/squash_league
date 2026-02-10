import { Trophy } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto flex items-center justify-between px-4 py-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Trophy className="h-4 w-4" />
          <span>Squash League &copy; {new Date().getFullYear()}</span>
        </div>
        <div className="text-sm text-gray-400">
          Liga squasha z systemem ELO
        </div>
      </div>
    </footer>
  );
}
