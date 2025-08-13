import { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';

type Props = {
  sizePx: number;
  progress: number;
  colors?: string[];
} & (
  | { type: 'percentage'; values?: never; total?: never }
  | { type: 'total'; values: number[]; total: number }
);
export const CircleProgress: FunctionComponent<Props> = ({
  sizePx,
  type,
  progress,
  values,
  total,
  colors,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const radius = 70;
  const width = 20;

  const circumference = Math.floor(2 * Math.PI * radius);

  type Segment = { length: number; offset: number; color: string };

  let segments: Segment[] = [];

  if (type === 'percentage') {
    segments = [
      {
        length:
          (Math.max(0, Math.min(100, progress ?? 0)) / 100) * circumference,
        offset: 0,
        color: colors?.[0] ?? '#00A95F'
      }
    ];
  } else {
    const _colors = colors ?? ['#00A95F', '#E4794A', '#F3EDE5'];
    segments = values.reduce((acc, step, index) => {
      const length = Math.floor((step / total) * circumference);
      const offset =
        index === 0 ? 0 : acc[index - 1].offset - acc[index - 1].length;
      return [
        ...acc,
        {
          length: Math.abs(offset) >= circumference ? 0 : length,
          offset,
          color: _colors[index % _colors.length]
        }
      ];
    }, [] as Segment[]);
  }

  return (
    <div style={{ height: sizePx, width: sizePx }}>
      <span
        style={{
          position: 'absolute',
          zIndex: 2,
          width: sizePx,
          height: sizePx
        }}
      >
        <span
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: 'bold',
            fontSize: sizePx / 5
          }}
        >
          {progress}%
        </span>
      </span>
      <svg
        width={sizePx}
        height={sizePx}
        viewBox={`0 0 ${(radius + width) * 2} ${(radius + width) * 2}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          r={radius}
          cx={radius + width}
          cy={radius + width}
          fill="transparent"
          stroke="#F3EDE5"
          strokeWidth={width}
        ></circle>
        {segments.map((segment, index) => (
          <circle
            key={index}
            r={radius}
            cx={radius + width}
            cy={radius + width}
            fill="transparent"
            stroke={segment.color}
            strokeWidth={width}
            strokeDasharray={`${segment.length} ${circumference - segment.length}`}
            strokeDashoffset={segment.offset}
          />
        ))}
      </svg>
    </div>
  );
};
