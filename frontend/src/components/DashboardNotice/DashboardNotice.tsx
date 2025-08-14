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
};
export const DashboardNotice: FunctionComponent<Props> = ({
  description,
  className,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  return (
    <div className={className}>
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
                <span className={cx('fr-text--regular', 'fr-text--light')}>
                  de l'équipe {Brand}
                </span>
              </span>
            </>
          }
          size="xlarge"
          accentColor="green-emeraude"
          text={description}
        />
      </div>
      <div className="links-container">
        <div className="d-flex-align-center">
          <span className={clsx(cx('fr-icon-question-line'), 'icon-grey')} />
          <div>
            <div className={cx('fr-text--bold')}>Questions fréquentes</div>
            <Link
              to={`${config.websiteUrl}/aides`}
              target="_blank"
              className={cx('fr-link', 'fr-link--sm')}
            >
              Consulter notre FAQ
            </Link>
          </div>
        </div>
        <div className="d-flex-align-center">
          <span className={clsx(cx('fr-icon-sparkling-2-line'), 'icon-grey')} />
          <div>
            <div className={cx('fr-text--bold')}>
              Quoi de neuf sur Maestro ?
            </div>
            <Link
              to={`${config.websiteUrl}/nouveautes`}
              target="_blank"
              className={cx('fr-link', 'fr-link--sm')}
            >
              Consulter les nouveautés
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
