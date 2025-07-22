import { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';

type Props = {
  count: number;
  sizePx: number;
} & ({ type: 'percentage'; total?: never } | { type: 'total'; total: number });
export const CircleProgress: FunctionComponent<Props> = ({
  count,
  sizePx,
  type,
  total,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const progress =
    type === 'percentage' ? count : Math.round((count / total) * 100);

  const radius = 70;
  const width = 20;

  const circumference = 2 * Math.PI * radius;
  const offset = circumference * ((100 - progress) / 100);

  return (
    <div style={{ height: sizePx, width: sizePx }}>
      <span
        style={{
          position: 'fixed',
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
          {progress}
          {type === 'percentage' ? `%` : null}
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
          stroke="#f6f6f6"
          strokeWidth={width}
        ></circle>
        <circle
          r={radius}
          cx={radius + width}
          cy={radius + width}
          fill="transparent"
          stroke="#4B9F6C"
          strokeWidth={width}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        ></circle>
      </svg>
    </div>
  );
};
