-- Two corrections, both to rows 0008 (and earlier) left in a state the code has
-- since moved past.
--
-- Run in SQL Editor after 0008.

-- ---------------------------------------------------------------------------
-- 1. Point the /om-oss image slots at the optimised derivatives.
--
-- 0008 set these to the originals the client supplied. They have since been
-- resized and re-encoded, and cms.ts's FALLBACK_CONTENT already names the new
-- files — so until this runs the two disagree, and the DB wins once the fetch
-- resolves. The visible symptom is the page loading the light images and then
-- swapping to the heavy ones a moment later:
--
--   intro       IMG_8906-scaled.jpg   477 KB  ->  omoss-butik.jpg   229 KB
--   philosophy  IMG_8965-scaled.jpg   736 KB  ->  omoss-poke.jpg     65 KB
--   vision      (empty — nothing shown)       ->  omoss-sushi.jpg   175 KB
--
-- omoss-poke.jpg is the client's transparent cut-out flattened onto #f6f6f4,
-- the exact background of the section it sits in. If that background ever
-- changes, the file has to be regenerated or it will show as a grey box.
--
-- Unconditional updates, not the `where value = ''` guards 0008 used: the point
-- is to replace whatever is there with the optimised path.
-- ---------------------------------------------------------------------------
update public.site_content set value = '/assets/omoss-butik.jpg' where key = 'omoss.intro_image';
update public.site_content set value = '/assets/omoss-poke.jpg'  where key = 'omoss.philosophy_image';
update public.site_content set value = '/assets/omoss-sushi.jpg' where key = 'omoss.vision_image';

-- ---------------------------------------------------------------------------
-- 2. One restaurant, not three.
--
-- Only Caroli on Östergatan is still trading. The other two rows were seeded in
-- 0002 and nothing on the site renders them any more, but they remain active, so
-- they would surface in the admin UI and in anything that lists the table later.
--
-- is_active = false rather than delete: reversible from the dashboard with a
-- single flip, and it keeps the order_url for Västra Hamnen on record.
--
-- fetchRows() in cms.ts filters on is_active, so this removes them from every
-- read. Index.tsx picks its map row by matching "östergatan" and falls back to
-- the first row, so it is unaffected either way.
-- ---------------------------------------------------------------------------
update public.locations set is_active = false
  where address1 ilike 'Einar Hansens Esplanad%'   -- Västra Hamnen
     or address1 ilike 'Kyrkogatan%';              -- Caroli, Lund

-- The subheading still invited a choice between locations ("Välj din favorit").
-- Rewritten for one restaurant and pointed at the two actions the site exists
-- for. Editable afterwards at /admin/edit — change the text here before running
-- if you would rather word it differently.
update public.site_content
   set value = 'Vi finns på Östergatan 21 i Malmö. Beställ online, ring oss eller kom förbi.'
 where key = 'locations.subheading';

insert into public.schema_migrations (version, name)
values ('0009', 'optimised_media_single_location') on conflict (version) do nothing;
