import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl';
import clsx from 'clsx';
import { t } from 'i18next';
import { FindSampleOptions } from 'shared/schema/Sample/FindSampleOptions';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import useWindowSize from 'src/hooks/useWindowSize';
import { getSampleListExportURL } from 'src/services/sample.service';
import samplesSlice from 'src/store/reducers/samplesSlice';

interface Props {
  findSampleOptions: Partial<FindSampleOptions>;
  changeFilter: (filters: Partial<FindSampleOptions>) => void;
  samplesCount?: number;
}

const SampleListHeader = ({
  findSampleOptions,
  changeFilter,
  samplesCount
}: Props) => {
  const dispatch = useAppDispatch();
  const { isMobile } = useWindowSize();

  const { programmingPlan } = useAppSelector((state) => state.programmingPlan);
  const { sampleListDisplay } = useAppSelector((state) => state.samples);

  const changeReference = (e: React.ChangeEvent<HTMLInputElement>) => {
    changeFilter({
      reference: e.target.value
    });
  };

  return (
    <>
      <div className={clsx('d-flex-align-center')}>
        <div className={cx('fr-text--bold')}>
          {t('sample', { count: samplesCount })}
        </div>
        <Input
          iconId="fr-icon-search-line"
          hideLabel
          label="N° de prélèvement"
          nativeInputProps={{
            type: 'search',
            placeholder: 'N° de prélèvement',
            value: findSampleOptions.reference ?? '',
            onChange: changeReference
          }}
          className={cx('fr-my-0', 'fr-ml-3w', 'fr-hidden', 'fr-unhidden-md')}
        />
      </div>
      <div>
        {!isMobile && (
          <SegmentedControl
            hideLegend
            legend="Légende"
            segments={[
              {
                label: 'Cartes',
                iconId: 'fr-icon-layout-grid-line',
                nativeInputProps: {
                  checked: sampleListDisplay === 'cards',
                  onChange: () =>
                    dispatch(samplesSlice.actions.changeListDisplay('cards'))
                }
              },
              {
                label: 'Tableau',
                iconId: 'fr-icon-table-line',
                nativeInputProps: {
                  checked: sampleListDisplay === 'table',
                  onChange: () =>
                    dispatch(samplesSlice.actions.changeListDisplay('table'))
                }
              }
            ]}
            className={cx('fr-mr-3w')}
          />
        )}
        <Button
          iconId="fr-icon-file-download-line"
          priority="secondary"
          onClick={() =>
            window.open(
              getSampleListExportURL({
                ...findSampleOptions,
                programmingPlanId: programmingPlan?.id as string,
                perPage: undefined,
                page: undefined
              })
            )
          }
          title="Exporter"
          children={isMobile ? undefined : 'Exporter'}
          size={isMobile ? 'small' : 'medium'}
        />
      </div>
      <Input
        iconId="fr-icon-search-line"
        hideLabel
        label="N° de prélèvement"
        nativeInputProps={{
          type: 'search',
          placeholder: 'N° de prélèvement',
          value: findSampleOptions.reference ?? '',
          onChange: changeReference
        }}
        className={clsx(cx('fr-hidden-md', 'fr-pt-2w'), 'flex-grow-1')}
      />
    </>
  );
};

export default SampleListHeader;
