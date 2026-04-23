import type { Knex } from 'knex';

export const up = async (knex: Knex) => {
  await knex.raw(`
    insert into analysis_dai (analysis_id, state, sent_at, sent_method, edi)
    select
        analysis.id,
        case
            when l.short_name in ('ANS 94a - LNR PEST', 'ANS 94a - LNR ETM') then 'SENT'
            else 'PENDING'
        end,
        case
            when l.short_name in ('ANS 94a - LNR PEST', 'ANS 94a - LNR ETM') then current_timestamp
            else null
        end,
        case
            when l.short_name in ('ANS 94a - LNR PEST', 'ANS 94a - LNR ETM') then 'EMAIL'
            else null
        end,
        case
            when l.short_name in ('ANS 94a - LNR PEST', 'ANS 94a - LNR ETM') then false
            else null
        end
    from public.analysis
        left join samples s on analysis.sample_id = s.id
        left join programming_plans on s.programming_plan_id = programming_plans.id
        left join sample_items si on si.sample_id = analysis.sample_id
            and si.item_number = analysis.item_number
            and si.copy_number = analysis.copy_number
        left join laboratories l on l.id = si.laboratory_id
    where year = 2026
      and programming_plan_kind <> 'PPV'
      and s.sent_at is not null
  `);
};

export const down = async (_knex: Knex) => {
  //Pas de down volontairement pour éviter de vider la table plus tard
};
