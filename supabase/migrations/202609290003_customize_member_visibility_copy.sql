alter table public.communities
  add column member_visibility_help_text text not null
  default 'nur für angemeldete Mitglieder dieser Gemeinschaft lesbar.',
  add constraint communities_member_visibility_help_text_length
    check (char_length(member_visibility_help_text) between 1 and 200);

update public.communities
set
  member_visibility_label = 'Nur für Mitglieder',
  member_visibility_help_text = 'nur für angemeldete Mitglieder des LTC lesbar.'
where slug = 'ltc';
