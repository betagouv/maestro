import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import Select from '@codegouvfr/react-dsfr/Select';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import { t } from 'i18next';
import {
  type Context,
  ContextLabels,
  ContextList
} from 'maestro-shared/schema/ProgrammingPlan/Context';
import type { FindSampleOptions } from 'maestro-shared/schema/Sample/FindSampleOptions';
import {
  SampleCompliance,
  SampleComplianceLabels
} from 'maestro-shared/schema/Sample/SampleCompliance';
import { useAuthentication } from 'src/hooks/useAuthentication';
import type { z } from 'zod';
import { DepartmentsSelect } from '../../components/DepartmentsSelect/DepartmentsSelect';
import LaboratorySelect from '../../components/LaboratorySelect/LaboratorySelect';
import { RegionsFilter } from '../../components/RegionsFilter/RegionsFilter';

interface Props {
  year: number;
  filters: Partial<FindSampleOptions>;
  programmingPlanId: string | undefined;
  onChange: (filters: Partial<FindSampleOptions>) => void;
}

const SampleSecondaryFilters = ({
  year,
  filters,
  programmingPlanId,
  onChange
}: Props) => {
  const { hasNationalView, hasRegionalView, hasRole } = useAuthentication();

  return (
    <>
      {hasNationalView && (
        <div className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}>
          <RegionsFilter
            values={filters.regions ?? []}
            onChange={(region) => {
              onChange({
                regions: [...(filters.regions ?? []), region],
                departments: undefined
              });
            }}
          />
        </div>
      )}
      {hasRegionalView && (
        <div className={cx('fr-col-12', 'fr-col-md-3')}>
          <DepartmentsSelect
            filters={filters}
            id={'filter-departments'}
            onSelect={(d) =>
              onChange({
                departments: [...(filters.departments ?? []), d]
              })
            }
          />
        </div>
      )}
      <div className={cx('fr-col-12', 'fr-col-md-3')}>
        <Input
          label="Date"
          nativeInputProps={{
            type: 'date',
            value: filters.sampledDate ?? '',
            min: `${year}-01-01`,
            max: `${year}-12-31`,
            onChange: (e) => onChange({ sampledDate: e.target.value })
          }}
        />
      </div>
      <div className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}>
        <Select
          label="Contexte"
          nativeSelectProps={{
            value: '',
            onChange: (e) =>
              onChange({
                contexts: [
                  ...(filters.contexts ?? []),
                  e.target.value as Context
                ],
                matrices: (filters.contexts ?? []).includes(
                  e.target.value as Context
                )
                  ? filters.matrices
                  : undefined
              })
          }}
        >
          <option value="">
            {filters.contexts?.length
              ? t('context', {
                  count: filters.contexts?.length
                })
              : 'Tous'}
          </option>
          {ContextList.filter(
            (context) => !filters.contexts?.includes(context)
          ).map((context) => (
            <option key={`context-${context}`} value={context}>
              {ContextLabels[context]}
            </option>
          ))}
        </Select>
      </div>
      <div className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}>
        <Select
          label="Conformité"
          nativeSelectProps={{
            value: filters.compliance || '',
            onChange: (e) =>
              onChange({
                compliance: e.target.value as z.infer<typeof SampleCompliance>
              })
          }}
        >
          <option value="">Tous</option>
          {SampleCompliance.options.map((compliance) => (
            <option key={`compliance-${compliance}`} value={compliance}>
              {SampleComplianceLabels[compliance]}
            </option>
          ))}
        </Select>
      </div>
      <div className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}>
        <LaboratorySelect
          programmingPlanId={programmingPlanId}
          laboratoryIds={filters.laboratoryIds ?? undefined}
          onSelect={(laboratoryId) =>
            onChange({
              laboratoryIds: laboratoryId
                ? [...(filters.laboratoryIds ?? []), laboratoryId]
                : undefined
            })
          }
          withAllOption={true}
        />
      </div>
      <div className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}>
        <ToggleSwitch
          label="Avec au moins un résidu"
          labelPosition="left"
          inputTitle="filtre les prélèvements qui ont au moins un résidu"
          defaultChecked={filters.withAtLeastOneResidue ?? false}
          onChange={(checked) =>
            onChange({ withAtLeastOneResidue: checked || undefined })
          }
        ></ToggleSwitch>
      </div>
      {hasRole(
        'Administrator',
        'NationalObserver',
        'RegionalObserver',
        'DepartmentalObserver'
      ) && (
        <div className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}>
          <ToggleSwitch
            label="Avec plusieurs exemplaires"
            labelPosition="left"
            inputTitle="filtre les prélèvements qui ont au moins un échantillon avec plusieurs exemplaires"
            defaultChecked={filters.withAtLeastOneCopiedItem ?? false}
            onChange={(checked) =>
              onChange({ withAtLeastOneCopiedItem: checked || undefined })
            }
          ></ToggleSwitch>
        </div>
      )}
    </>
  );
};

export default SampleSecondaryFilters;
