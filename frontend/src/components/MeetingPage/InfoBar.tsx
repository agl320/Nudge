interface MeetingHeaderProps {
  meetingId: string;
  participantCount: number;
}

export default function InfoBar({ meetingId, participantCount }: MeetingHeaderProps) {
  return (
    <div className="bg-zinc-800/50 rounded-lg p-3 mb-6 backdrop-blur-sm flex justify-between items-center">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold">
          Meeting ID: <span className="text-emerald-400">{meetingId}</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-400">Active Participants: {participantCount}</span>
      </div>
    </div>
  );
}
