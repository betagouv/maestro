import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Quote from '@codegouvfr/react-dsfr/Quote';
import clsx from 'clsx';
import { Brand } from 'maestro-shared/constants';
import { FunctionComponent } from 'react';
import { Link } from 'react-router';
import { assert, type Equals } from 'tsafe';
import manon from '../../assets/manon.jpg';
import config from '../../utils/config';
import './DashboardNotice.scss';

type Props = {
  className: string;
  description: string;
  fullWidth?: boolean;
};
export const DashboardNotice: FunctionComponent<Props> = ({
  description,
  className,
  fullWidth = false,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  return (
    <div
      className={clsx(className, fullWidth && 'dashboard-notice-full-width')}
    >
      <div
        className={clsx(
          cx('fr-callout', 'fr-callout--green-emeraude', 'fr-mb-0'),
          'white-container',
          'full-height'
        )}
      >
        <Quote
          author={
            <>
              <span>
                <img
                  className="fr-responsive-img"
                  alt=""
                  src={manon}
                  data-fr-js-ratio="true"
                />
              </span>
              <span className="manon">
                <span className={cx('fr-text--lead', 'fr-mb-0')}>Manon</span>
                <span
                  className={clsx(
                    cx('fr-text--regular', 'fr-text--light'),
                    'no-wrap'
                  )}
                >
                  de l'équipe {Brand}
                </span>
              </span>
            </>
          }
          size="xlarge"
          accentColor="green-emeraude"
          text={description}
          className={fullWidth ? 'quote-fullwidth' : undefined}
        />
      </div>
      <div
        className={clsx(
          'links-container',
          fullWidth && 'links-container-vertical'
        )}
      >
        <div>
          <div className={cx('fr-text--bold')}>Centre d'aide</div>
          <Link
            to={`${config.websiteUrl}/aides`}
            target="_blank"
            className={cx('fr-link', 'fr-link--sm')}
          >
            Foire aux questions
          </Link>
        </div>
        <div>
          <div className={cx('fr-text--bold')}>Tutos {Brand}</div>
          <Link
            to={`${config.websiteUrl}/suivez-le-guide`}
            target="_blank"
            className={cx('fr-link', 'fr-link--sm')}
          >
            Tutoriels vidéos
          </Link>
        </div>
        <div>
          <div className={cx('fr-text--bold')}>Quoi de neuf ?</div>
          <Link
            to={`${config.websiteUrl}/nouveautes`}
            target="_blank"
            className={cx('fr-link', 'fr-link--sm')}
          >
            Nouveau sur {Brand}
          </Link>
        </div>
      </div>
    </div>
  );
};
