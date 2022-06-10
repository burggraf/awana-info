DROP FUNCTION IF EXISTS groups_is_admin;

/* go up the heirarchy to see if this user is an admin at this level or any higher level */
CREATE OR REPLACE FUNCTION groups_is_admin(target uuid, uid uuid)
RETURNS boolean as
$$
WITH RECURSIVE hierarchy( id, parent_id ) 
AS (
  -- get child
  SELECT id, parent_id, name
  FROM groups
  WHERE id = target

  UNION ALL

  -- get parents
  SELECT t.id, t.parent_id, t.name
  FROM hierarchy p
  JOIN groups t
  ON t.id = p.parent_id
)
select (select count(*) FROM hierarchy as h 
  LEFT OUTER JOIN groups_access as g
  ON g.group_id = h.id AND g.user_id = uid
  WHERE g.access = 'admin') > 0;
$$
LANGUAGE sql;
