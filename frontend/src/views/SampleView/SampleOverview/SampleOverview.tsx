import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
import Tabs from '@codegouvfr/react-dsfr/Tabs';
import clsx from 'clsx';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import food from 'src/assets/illustrations/food.svg';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import SupportDocumentSelect from 'src/components/SupportDocumentSelect/SupportDocumentSelect';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useSamplesLink } from 'src/hooks/useSamplesLink';
import { pluralize } from 'src/utils/stringUtils';
import SampleAnalysis from 'src/views/SampleView/SampleAnalysis/SampleAnalysis';
import SampleOverviewContextTab from 'src/views/SampleView/SampleOverview/SampleOverviewContextTab';
import { SampleStepTitles } from 'src/views/SampleView/SampleView';
import ItemsStepSummary from 'src/views/SampleView/StepSummary/ItemsStepSummary';
import MatrixStepSummary from 'src/views/SampleView/StepSummary/MatrixStepSummary';
import './SampleOverview.scss';
interface Props {
  sample: Sample;
}

const SampleOverview = ({ sample }: Props) => {
  useDocumentTitle(`Prélèvement ${sample.reference}`);

  const { navigateToSamples } = useSamplesLink();

  return (
    <section
      className={clsx(cx('fr-container'), 'main-section', 'sample-overview')}
    >
      <SectionHeader
        title={<>Prélèvement {sample.reference}</>}
        subtitle="Consultez le récapitulatif du prélèvement réalisé"
        illustration={food}
        action={
          <SupportDocumentSelect
            sample={sample}
            renderButtons={(onClick) =>
              sample.items.length === 1 ? (
                <Button
                  priority="secondary"
                  iconId="fr-icon-file-download-line"
                  onClick={onClick}
                >
                  Document d'accompagnement
                </Button>
              ) : (
                <Button
                  iconId="fr-icon-file-download-line"
                  onClick={onClick}
                  title="Télécharger"
                />
              )
            }
          />
        }
      />
      <Tabs
        tabs={[
          {
            label: 'Suivi du prélèvement',
            content: <SampleAnalysis sample={sample} />
          },
          {
            label: SampleStepTitles(sample)[0],
            content: <SampleOverviewContextTab sample={sample} />
          },
          {
            label: SampleStepTitles(sample)[1],
            content: <MatrixStepSummary sample={sample} showLabel={false} />
          },
          {
            label: SampleStepTitles(sample)[2],
            content: (
              <>
                <ItemsStepSummary sample={sample} showLabel={false} />
                <hr />
                <h3 className={cx('fr-m-0')}>Consentement par le détenteur</h3>
                <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
                  <div className={cx('fr-col-12')}>
                    <RadioButtons
                      legend="Le détenteur accepte les informations portées au présent procès verbal"
                      options={[
                        {
                          label: 'Oui',
                          nativeInputProps: {
                            checked: sample.ownerAgreement,
                            disabled: true
                          }
                        },
                        {
                          label: 'Non',
                          nativeInputProps: {
                            checked: !sample.ownerAgreement,
                            disabled: true
                          }
                        }
                      ]}
                      orientation="horizontal"
                      classes={{
                        root: cx('fr-px-0', 'fr-my-0')
                      }}
                    />
                  </div>
                </div>
                <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
                  <div className={cx('fr-col-12')}>
                    <Input
                      textArea
                      label="Déclaration du détenteur"
                      hintText="Champ facultatif pour spécifier une éventuelle déclaration du détenteur"
                      disabled
                      nativeTextAreaProps={{
                        value: sample.notesOnOwnerAgreement ?? '',
                        rows: 1
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
                    <div className={cx('fr-col-12', 'fr-mb-1w')}>
                      <h6 className={cx('fr-mb-0')}>
                        Envoi du procès verbal au détenteur de la marchandise
                      </h6>
                      {sample.items.length}{' '}
                      {pluralize(sample.items.length)(
                        "document d'accompagnement"
                      )}
                    </div>
                  </div>
                  <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
                    <div className={cx('fr-col-6', 'fr-col-sm-3')}>
                      <Input
                        label="Identité du détenteur"
                        hintText="Nom"
                        disabled
                        nativeInputProps={{
                          value: sample.ownerLastName ?? ''
                        }}
                      />
                    </div>
                    <div className={cx('fr-col-6', 'fr-col-sm-3')}>
                      <Input
                        label={' '}
                        hintText="Prénom"
                        disabled
                        nativeInputProps={{
                          disabled: true,
                          value: sample.ownerFirstName ?? ''
                        }}
                      />
                    </div>
                    <div className={cx('fr-col-12', 'fr-col-sm-6')}>
                      <Input
                        label="E-mail du détenteur"
                        hintText="Le détenteur a reçu une copie du procès verbal"
                        disabled
                        nativeInputProps={{
                          disabled: true,
                          value: sample.ownerEmail ?? ''
                        }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )
          }
        ]}
        classes={{
          panel: 'white-container'
        }}
      />
      <div className="back">
        <Button
          priority="secondary"
          onClick={navigateToSamples}
          iconId="fr-icon-arrow-left-line"
        >
          Retour aux prélèvements
        </Button>
      </div>
    </section>
  );
};

export default SampleOverview;
