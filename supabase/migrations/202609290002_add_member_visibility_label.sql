alter table public.communities
add column member_visibility_label text not null default 'Community'
check (char_length(btrim(member_visibility_label)) between 1 and 40);

update public.communities
set member_visibility_label = 'Vereinsweit'
where slug = 'ltc';
