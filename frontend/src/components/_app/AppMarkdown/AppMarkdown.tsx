import clsx from 'clsx';
import type { FunctionComponent } from 'react';
import ReactMarkdown from 'react-markdown';
import { assert, type Equals } from 'tsafe';
import './AppMarkdown.scss';

type Props = {
  children: string;
};

export const AppMarkdown: FunctionComponent<Props> = ({
  children,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  return (
    <ReactMarkdown
      components={{
        p: 'span',
        ul: ({ children }) => <span className="markdown-list">{children}</span>,
        ol: ({ children }) => (
          <span className={clsx('markdown-list', 'markdown-list--ordered')}>
            {children}
          </span>
        ),
        li: ({ children }) => (
          <span className="markdown-list-item">{children}</span>
        ),
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noreferrer">
            {children}
          </a>
        )
      }}
      disallowedElements={[
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'img',
        'hr',
        'pre',
        'blockquote'
      ]}
      unwrapDisallowed
    >
      {children}
    </ReactMarkdown>
  );
};
