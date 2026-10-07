BEGIN;

SECURITY LABEL FOR anon ON COLUMN users.email
  IS 'MASKED WITH FUNCTION anon.seeded_email(users.email)';
SECURITY LABEL FOR anon ON COLUMN users.name
  IS 'MASKED WITH FUNCTION anon.seeded_last_name(users.name)';

SECURITY LABEL FOR anon ON COLUMN samples.owner_email
  IS 'MASKED WITH FUNCTION anon.seeded_email(samples.owner_email)';
SECURITY LABEL FOR anon ON COLUMN samples.owner_first_name
  IS 'MASKED WITH FUNCTION anon.seeded_first_name(samples.owner_first_name)';
SECURITY LABEL FOR anon ON COLUMN samples.owner_last_name
  IS 'MASKED WITH FUNCTION anon.seeded_last_name(samples.owner_last_name)';
SECURITY LABEL FOR anon ON COLUMN sample_items.carrier
  IS 'MASKED WITH FUNCTION anon.seeded_company(sample_items.carrier)';

SECURITY LABEL FOR anon ON COLUMN users.logged_secrets
  IS 'MASKED WITH VALUE ''{}''::uuid[]';

SECURITY LABEL FOR anon ON COLUMN laboratories.sacha_recipient_email
  IS 'MASKED WITH VALUE NULL';
SECURITY LABEL FOR anon ON COLUMN laboratories.sacha_gpg_email
  IS 'MASKED WITH VALUE NULL';
SECURITY LABEL FOR anon ON COLUMN laboratories.sacha_gpg_public_key
  IS 'MASKED WITH VALUE NULL';
SECURITY LABEL FOR anon ON COLUMN laboratories.sacha_sftp_login
  IS 'MASKED WITH VALUE NULL';

SECURITY LABEL FOR anon ON COLUMN laboratories.emails
  IS 'MASKED WITH VALUE ''{}''::text[]';
SECURITY LABEL FOR anon ON COLUMN laboratories.emails_analysis_result
  IS 'MASKED WITH VALUE ''{}''::text[]';

SECURITY LABEL FOR anon ON COLUMN companies.siret
  IS 'MASKED WITH FUNCTION anon.seeded_siret(companies.siret)';
SECURITY LABEL FOR anon ON COLUMN samples.company_siret
  IS 'MASKED WITH FUNCTION anon.seeded_siret(samples.company_siret)';
SECURITY LABEL FOR anon ON COLUMN user_companies.company_siret
  IS 'MASKED WITH FUNCTION anon.seeded_siret(user_companies.company_siret)';
SECURITY LABEL FOR anon ON COLUMN local_prescriptions.company_siret
  IS 'MASKED WITH FUNCTION anon.seeded_siret(local_prescriptions.company_siret)';
SECURITY LABEL FOR anon ON COLUMN local_prescription_changes.company_siret
  IS 'MASKED WITH FUNCTION anon.seeded_siret(local_prescription_changes.company_siret)';
SECURITY LABEL FOR anon ON COLUMN local_prescription_comments.company_siret
  IS 'MASKED WITH FUNCTION anon.seeded_siret(local_prescription_comments.company_siret)';

SECURITY LABEL FOR anon ON COLUMN companies.name
  IS 'MASKED WITH FUNCTION anon.seeded_company(companies.name)';
SECURITY LABEL FOR anon ON COLUMN companies.trade_name
  IS 'MASKED WITH FUNCTION anon.seeded_company(companies.trade_name)';
SECURITY LABEL FOR anon ON COLUMN companies.address
  IS 'MASKED WITH VALUE NULL';
SECURITY LABEL FOR anon ON COLUMN companies.postal_code
  IS 'MASKED WITH VALUE NULL';
SECURITY LABEL FOR anon ON COLUMN companies.city
  IS 'MASKED WITH VALUE NULL';
SECURITY LABEL FOR anon ON COLUMN companies.geolocation
  IS 'MASKED WITH VALUE NULL';

SECURITY LABEL FOR anon ON COLUMN samples.geolocation
  IS 'MASKED WITH VALUE NULL';
SECURITY LABEL FOR anon ON COLUMN samples.parcel
  IS 'MASKED WITH VALUE NULL';

SECURITY LABEL FOR anon ON COLUMN samples.company_offline
  IS 'MASKED WITH VALUE NULL';
SECURITY LABEL FOR anon ON COLUMN samples.notes_on_creation
  IS 'MASKED WITH VALUE NULL';
SECURITY LABEL FOR anon ON COLUMN samples.notes_on_matrix
  IS 'MASKED WITH VALUE NULL';
SECURITY LABEL FOR anon ON COLUMN samples.notes_on_items
  IS 'MASKED WITH VALUE NULL';
SECURITY LABEL FOR anon ON COLUMN samples.notes_on_compliance
  IS 'MASKED WITH VALUE NULL';
SECURITY LABEL FOR anon ON COLUMN samples.notes_on_owner_agreement
  IS 'MASKED WITH VALUE NULL';

SECURITY LABEL FOR anon ON COLUMN sample_items.notes_on_admissibility
  IS 'MASKED WITH VALUE NULL';
SECURITY LABEL FOR anon ON COLUMN sample_items.budget_notes
  IS 'MASKED WITH VALUE NULL';

SECURITY LABEL FOR anon ON COLUMN analysis.notes_on_compliance
  IS 'MASKED WITH VALUE NULL';

SECURITY LABEL FOR anon ON COLUMN analysis_residues.notes_on_result
  IS 'MASKED WITH VALUE NULL';
SECURITY LABEL FOR anon ON COLUMN analysis_residues.notes_on_pollution_risk
  IS 'MASKED WITH VALUE NULL';
SECURITY LABEL FOR anon ON COLUMN analysis_residues.notes_on_contamination_sources
  IS 'MASKED WITH VALUE NULL';
SECURITY LABEL FOR anon ON COLUMN analysis_residues.unknown_label
  IS 'MASKED WITH VALUE NULL';

SECURITY LABEL FOR anon ON COLUMN prescriptions.notes
  IS 'MASKED WITH VALUE NULL';
SECURITY LABEL FOR anon ON COLUMN prescriptions.programming_instruction
  IS 'MASKED WITH VALUE NULL';

SECURITY LABEL FOR anon ON COLUMN local_prescription_comments.comment
  IS 'MASKED WITH VALUE NULL';

SECURITY LABEL FOR anon ON COLUMN notifications.message
  IS 'MASKED WITH VALUE NULL';
SECURITY LABEL FOR anon ON COLUMN notifications.link
  IS 'MASKED WITH VALUE NULL';

SECURITY LABEL FOR anon ON COLUMN documents.name
  IS 'MASKED WITH VALUE NULL';
SECURITY LABEL FOR anon ON COLUMN documents.legend
  IS 'MASKED WITH VALUE NULL';
SECURITY LABEL FOR anon ON COLUMN documents.notes
  IS 'MASKED WITH VALUE NULL';
SECURITY LABEL FOR anon ON COLUMN documents.filename
  IS 'MASKED WITH VALUE NULL';

SECURITY LABEL FOR anon ON COLUMN sample_specific_data_values.value
  IS 'MASKED WITH VALUE NULL';

SECURITY LABEL FOR anon ON COLUMN analysis_errors.residues
  IS 'MASKED WITH VALUE NULL';
SECURITY LABEL FOR anon ON COLUMN analysis_rai.payload
  IS 'MASKED WITH VALUE NULL';
SECURITY LABEL FOR anon ON COLUMN samples.seves
  IS 'MASKED WITH VALUE NULL';

SECURITY LABEL FOR anon ON COLUMN samples.resytal_id
  IS 'MASKED WITH VALUE NULL';
SECURITY LABEL FOR anon ON COLUMN sample_items.invoice_number
  IS 'MASKED WITH VALUE NULL';
SECURITY LABEL FOR anon ON COLUMN analysis_rai.message
  IS 'MASKED WITH VALUE NULL';
SECURITY LABEL FOR anon ON COLUMN analysis_dai.message
  IS 'MASKED WITH VALUE NULL';

COMMIT;
