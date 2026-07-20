-- Games get a name per locale. Existing English names are copied into
-- name_ru so old rows stay valid; the UI also falls back to name_en.
alter table games rename column name to name_en;
alter table games add column name_ru text not null default '';
update games set name_ru = name_en;
alter table games alter column name_ru drop default;
