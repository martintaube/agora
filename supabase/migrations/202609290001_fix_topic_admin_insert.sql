drop policy topics_admin_insert on public.topics;
create policy topics_admin_insert on public.topics
for insert to authenticated
with check (
  created_by = auth.uid()
  and public.is_community_admin(community_id)
);
