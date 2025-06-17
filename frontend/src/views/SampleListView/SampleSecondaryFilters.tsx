import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import { Region, RegionList, Regions } from 'maestro-shared/referential/Region';
import {
  Context,
  ContextLabels,
  ContextList
} from 'maestro-shared/schema/ProgrammingPlan/Context';
import {
  FindSampleOptions,
  SampleCompliance,
  SampleComplianceLabels
} from 'maestro-shared/schema/Sample/FindSampleOptions';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { z } from 'zod/v4';
import { DepartmentsSelect } from '../../components/DepartmentsSelect/DepartmentsSelect';

interface Props {
  filters: Partial<FindSampleOptions>;
  onChange: (filters: Partial<FindSampleOptions>) => void;
}

const SampleSecondaryFilters = ({ filters, onChange }: Props) => {
  const { hasNationalView } = useAuthentication();

  return (
    <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
      {hasNationalView && (
        <div className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}>
          <Select
            label="Région"
            nativeSelectProps={{
              value: filters.region || '',
              onChange: (e) =>
                onChange({
                  region: e.target.value as Region,
                  departments: undefined
                })
            }}
          >
            <option value="">Toutes les régions</option>
            {RegionList.map((region) => (
              <option key={`region-${region}`} value={region}>
                {Regions[region].name}
              </option>
            ))}
          </Select>
        </div>
      )}
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
      <div className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}>
        <Select
          label="Contexte"
          nativeSelectProps={{
            value: filters.context || '',
            onChange: (e) =>
              onChange({
                context: e.target.value as Context,
                matrix: undefined
              })
          }}
        >
          <option value="">Tous</option>
          {ContextList.map((context) => (
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
    </div>
  );
};

export default SampleSecondaryFilters;
