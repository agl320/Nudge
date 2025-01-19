import { AlertCircle } from "lucide-react";

interface Participant {
  id: number;
  name: string;
  speaking: boolean;
  offTopic: boolean;
}

interface VideoGridProps {
  participants: Participant[];
}

export default function VideoGrid({ participants }: VideoGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {participants.map((participant) => (
        <div
          key={participant.id}
          className={`bg-zinc-800/50 rounded-xl aspect-video p-4 relative overflow-hidden backdrop-blur-sm
            ${participant.speaking ? "ring-2 ring-emerald-500 ring-opacity-60" : ""}
            ${participant.offTopic ? "ring-2 ring-amber-500 ring-opacity-60" : ""}`}
        >
          {/* Video placeholder - in a real app, this would be the video stream */}
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl text-zinc-600">{participant.name[0].toUpperCase()}</span>
            </div>
          </div>

          {/* Participant info overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full">
              <span className="text-xs">{participant.name}</span>
              {participant.speaking && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
            </div>
            {participant.offTopic && (
              <div className="bg-amber-500/20 px-2 py-1 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-500" />
                <span className="text-xs text-amber-500">Off Topic</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
