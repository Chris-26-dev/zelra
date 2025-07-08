import { format } from "date-fns";

interface Props {
  name: string;
  creationTime: number;
}

export const ChannelHero = ({ name, creationTime }: Props) => {
  return (
    <div className="mt-[88px] mx-6 mb-6">
      <div className="flex items-center gap-2 text-3xl font-semibold text-gray-900">
        <span className="text-slate-700">#</span>
        <h1>{name}</h1>
      </div>

      <div className="mt-2 text-sm text-muted-foreground leading-relaxed">
        <p>
          This channel was created on{" "}
          <span className="font-medium text-gray-900">
            {format(creationTime, "MMMM do, yyyy")}
          </span>
          . This is the very beginning of the <strong className="text-gray-900">{name}</strong> channel.
        </p>
      </div>
    </div>
  );
};
