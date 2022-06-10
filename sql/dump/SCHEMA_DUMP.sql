--
-- PostgreSQL database dump
--

-- Dumped from database version 14.1
-- Dumped by pg_dump version 14.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP POLICY IF EXISTS "users can update their own profile" ON "public"."profile";
DROP POLICY IF EXISTS "users can delete their own profile" ON "public"."profile";
DROP POLICY IF EXISTS "users can create their own profile" ON "public"."profile";
DROP POLICY IF EXISTS "invitations update" ON "public"."invitations";
DROP POLICY IF EXISTS "invitations select" ON "public"."invitations";
DROP POLICY IF EXISTS "invitations insert - must be group admin" ON "public"."invitations";
DROP POLICY IF EXISTS "invitations delete" ON "public"."invitations";
DROP POLICY IF EXISTS "group update" ON "public"."groups";
DROP POLICY IF EXISTS "group select" ON "public"."groups";
DROP POLICY IF EXISTS "group insert" ON "public"."groups";
DROP POLICY IF EXISTS "group delete" ON "public"."groups";
DROP POLICY IF EXISTS "authenticated users can read any profile" ON "public"."profile";
ALTER TABLE IF EXISTS ONLY "public"."profile" DROP CONSTRAINT IF EXISTS "profile_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."invitations" DROP CONSTRAINT IF EXISTS "invitations_user_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."invitations" DROP CONSTRAINT IF EXISTS "invitations_invited_by_fkey";
ALTER TABLE IF EXISTS ONLY "public"."invitations" DROP CONSTRAINT IF EXISTS "invitations_group_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."groups" DROP CONSTRAINT IF EXISTS "groups_root_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."groups_access" DROP CONSTRAINT IF EXISTS "group_access_user_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."groups_access" DROP CONSTRAINT IF EXISTS "group_access_group_id_fkey";
DROP TRIGGER IF EXISTS "groups_insert_trigger" ON "public"."groups";
DROP TRIGGER IF EXISTS "groups_insert_root_trigger" ON "public"."groups";
ALTER TABLE IF EXISTS ONLY "public"."profile" DROP CONSTRAINT IF EXISTS "profile_pkey";
ALTER TABLE IF EXISTS ONLY "public"."invitations" DROP CONSTRAINT IF EXISTS "invitations_pkey";
ALTER TABLE IF EXISTS ONLY "public"."groups" DROP CONSTRAINT IF EXISTS "group_pkey";
ALTER TABLE IF EXISTS ONLY "public"."groups_access" DROP CONSTRAINT IF EXISTS "group_access_pkey";
DROP VIEW IF EXISTS "public"."members";
DROP TABLE IF EXISTS "public"."profile";
DROP TABLE IF EXISTS "public"."invitations";
DROP TABLE IF EXISTS "public"."groups_access";
DROP TABLE IF EXISTS "public"."groups";
DROP FUNCTION IF EXISTS "public"."invitations_reject"("target" "uuid");
DROP FUNCTION IF EXISTS "public"."invitations_accept"("target" "uuid");
DROP FUNCTION IF EXISTS "public"."handle_new_user"();
DROP FUNCTION IF EXISTS "public"."groups_update_root_id"();
DROP FUNCTION IF EXISTS "public"."groups_is_admin"("target" "uuid", "uid" "uuid");
DROP FUNCTION IF EXISTS "public"."groups_insert_add_admin_trigger_function"();
DROP FUNCTION IF EXISTS "public"."groups_get_tree_for_group"("target_group_id" "uuid");
DROP FUNCTION IF EXISTS "public"."groups_get_root_id"("target" "uuid");
DROP FUNCTION IF EXISTS "public"."groups_get_root_groups_for_user"("target_user_id" "uuid");
DROP FUNCTION IF EXISTS "public"."groups_get_groups_for_user"("target_user_id" "uuid");
DROP FUNCTION IF EXISTS "public"."groups_delete"("target" "uuid");
DROP FUNCTION IF EXISTS "public"."get_group_access"("group_id_var" "uuid", "user_id_var" "uuid");
DROP SCHEMA IF EXISTS "public";
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA "public";


ALTER SCHEMA "public" OWNER TO "postgres";

--
-- Name: SCHEMA "public"; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA "public" IS 'standard public schema';


--
-- Name: get_group_access("uuid", "uuid"); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION "public"."get_group_access"("group_id_var" "uuid", "user_id_var" "uuid") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE retval text;
BEGIN

  SELECT access FROM groups_access WHERE group_id = group_id_var AND user_id = user_id_var INTO retval;

    RETURN COALESCE(retval, '');
END;
$$;


ALTER FUNCTION "public"."get_group_access"("group_id_var" "uuid", "user_id_var" "uuid") OWNER TO "supabase_admin";

--
-- Name: groups_delete("uuid"); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION "public"."groups_delete"("target" "uuid") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
   IF (SELECT count(*) from groups where parent_id = target) > 0 THEN
      RAISE EXCEPTION 'children exist, cannot delete'; 
   END IF;
   IF NOT groups_is_admin(target,auth.uid()) THEN
      RAISE EXCEPTION 'admin access required to delete'; 
   END IF;
   DELETE FROM groups_access WHERE group_id = target;
   DELETE FROM groups WHERE id = target;
   RETURN 'OK';
END
$$;


ALTER FUNCTION "public"."groups_delete"("target" "uuid") OWNER TO "supabase_admin";

--
-- Name: groups_get_groups_for_user("uuid"); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION "public"."groups_get_groups_for_user"("target_user_id" "uuid") RETURNS TABLE("id" "uuid", "parent_id" "uuid", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "name" "text", "description" "text", "banner" "text", "icon" "text", "info" "jsonb", "root_id" "uuid", "level" integer, "access" "text")
    LANGUAGE "sql"
    AS $$

SELECT g.id,parent_id,g.created_at,g.updated_at,g.name,g.description,g.banner,g.icon,g.info,g.root_id,g.level,a.access from groups as g
join groups_access as a on g.id = a.group_id WHERE a.user_id = target_user_id order by g.name;

$$;


ALTER FUNCTION "public"."groups_get_groups_for_user"("target_user_id" "uuid") OWNER TO "supabase_admin";

--
-- Name: groups_get_root_groups_for_user("uuid"); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION "public"."groups_get_root_groups_for_user"("target_user_id" "uuid") RETURNS TABLE("id" "uuid", "parent_id" "uuid", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "name" "text", "description" "text", "banner" "text", "icon" "text", "info" "jsonb", "root_id" "uuid", "level" integer, "access" "text")
    LANGUAGE "sql"
    AS $$

SELECT g.id,parent_id,g.created_at,g.updated_at,g.name,g.description,g.banner,g.icon,g.info,g.root_id,g.level,a.access from groups as g
join groups_access as a on g.id = a.group_id WHERE a.user_id = target_user_id and g.parent_id is null order by g.name;

$$;


ALTER FUNCTION "public"."groups_get_root_groups_for_user"("target_user_id" "uuid") OWNER TO "supabase_admin";

--
-- Name: groups_get_root_id("uuid"); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION "public"."groups_get_root_id"("target" "uuid") RETURNS "uuid"
    LANGUAGE "sql"
    AS $$
WITH RECURSIVE hierarchy( id, parent_id ) 
AS (
  -- get child
  SELECT id, parent_id
  FROM groups
  WHERE id = target

  UNION ALL

  -- get parents
  SELECT t.id, t.parent_id
  FROM hierarchy p
  JOIN groups t
  ON t.id = p.parent_id
)
SELECT id AS root_id
FROM hierarchy
WHERE parent_id IS NULL;
$$;


ALTER FUNCTION "public"."groups_get_root_id"("target" "uuid") OWNER TO "supabase_admin";

--
-- Name: groups_get_tree_for_group("uuid"); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION "public"."groups_get_tree_for_group"("target_group_id" "uuid") RETURNS TABLE("id" "uuid", "parent_id" "uuid", "name" "text", "description" "text", "level" numeric)
    LANGUAGE "sql"
    AS $$
WITH RECURSIVE tree AS (
    SELECT
        groups.id as id,
        groups.parent_id as parent_id,
        COALESCE(groups.name, '') as name, 
        COALESCE(groups.description, '') as description, 
        0 as level,
        TO_CHAR(COALESCE(groups.sort_order, 0), 'fm000000') || COALESCE(groups.name, '') || groups.id::text as path 
    FROM
        groups join groups_access on groups_access.group_id = groups.id
    WHERE
        groups.id = target_group_id
    UNION ALL
    SELECT
        groups.id as id,
        groups.parent_id as parent_id,
        COALESCE(groups.name, '') as name, 
        COALESCE(groups.description, '') as description, 
        tree.level + 1 as level,
        tree.path || '~' || TO_CHAR(COALESCE(groups.sort_order, 0), 'fm000000') || COALESCE(groups.name, '') || groups.id::text as path 
    FROM
        tree
        JOIN groups ON groups.parent_id = tree.id
)

SELECT DISTINCT ON (path) id,parent_id,name,description,level FROM tree ORDER BY path;

$$;


ALTER FUNCTION "public"."groups_get_tree_for_group"("target_group_id" "uuid") OWNER TO "supabase_admin";

--
-- Name: groups_insert_add_admin_trigger_function(); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION "public"."groups_insert_add_admin_trigger_function"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
   
         INSERT INTO groups_access(group_id,user_id,access)
         VALUES(NEW.id,auth.uid(),'admin');
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."groups_insert_add_admin_trigger_function"() OWNER TO "supabase_admin";

--
-- Name: groups_is_admin("uuid", "uuid"); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION "public"."groups_is_admin"("target" "uuid", "uid" "uuid") RETURNS boolean
    LANGUAGE "sql"
    AS $$
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
$$;


ALTER FUNCTION "public"."groups_is_admin"("target" "uuid", "uid" "uuid") OWNER TO "supabase_admin";

--
-- Name: groups_update_root_id(); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION "public"."groups_update_root_id"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.root_id = COALESCE(groups_get_root_id(COALESCE(NEW.parent_id, NEW.id)), NEW.id);
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."groups_update_root_id"() OWNER TO "supabase_admin";

--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profile (id, email)
  values (new.id, new.email);
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "supabase_admin";

--
-- Name: invitations_accept("uuid"); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION "public"."invitations_accept"("target" "uuid") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
   IF (SELECT count(*) from invitations where id = target) < 1 THEN
      RAISE EXCEPTION 'invitation id not found'; 
   END IF;
   IF (SELECT LOWER(email) from invitations where id = target) <> LOWER(auth.email()) THEN
      RAISE EXCEPTION 'unauthorized email'; 
   END IF;
   INSERT INTO groups_access (group_id, user_id, access)
      SELECT group_id, auth.uid(), access from invitations where id = target;
   UPDATE invitations set user_id = auth.uid(), result = 'ACCEPTED', closed_at = NOW() where id = target;
   RETURN 'OK';
END
$$;


ALTER FUNCTION "public"."invitations_accept"("target" "uuid") OWNER TO "supabase_admin";

--
-- Name: invitations_reject("uuid"); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION "public"."invitations_reject"("target" "uuid") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
   IF (SELECT count(*) from invitations where id = target) < 1 THEN
      RAISE EXCEPTION 'invitation id not found'; 
   END IF;
   IF (SELECT LOWER(email) from invitations where id = target) <> LOWER(auth.email()) THEN
      RAISE EXCEPTION 'unauthorized email'; 
   END IF;
   UPDATE invitations set user_id = auth.uid(), result = 'REJECTED', closed_at = NOW() where id = target;
   RETURN 'OK';
END
$$;


ALTER FUNCTION "public"."invitations_reject"("target" "uuid") OWNER TO "supabase_admin";

SET default_tablespace = '';

SET default_table_access_method = "heap";

--
-- Name: groups; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE "public"."groups" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "parent_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "name" "text" NOT NULL,
    "description" "text",
    "banner" "text",
    "icon" "text",
    "info" "jsonb",
    "root_id" "uuid",
    "level" integer DEFAULT 0 NOT NULL,
    "sort_order" integer DEFAULT 0
);


ALTER TABLE "public"."groups" OWNER TO "supabase_admin";

--
-- Name: TABLE "groups"; Type: COMMENT; Schema: public; Owner: supabase_admin
--

COMMENT ON TABLE "public"."groups" IS 'organizational groups';


--
-- Name: groups_access; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE "public"."groups_access" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "group_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "access" "text" NOT NULL
);


ALTER TABLE "public"."groups_access" OWNER TO "supabase_admin";

--
-- Name: invitations; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE "public"."invitations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "group_id" "uuid" NOT NULL,
    "invited_by" "uuid",
    "result" "text",
    "closed_at" timestamp with time zone,
    "email" "text" NOT NULL,
    "user_id" "uuid",
    "access" "text" DEFAULT 'user'::"text" NOT NULL
);


ALTER TABLE "public"."invitations" OWNER TO "supabase_admin";

--
-- Name: TABLE "invitations"; Type: COMMENT; Schema: public; Owner: supabase_admin
--

COMMENT ON TABLE "public"."invitations" IS 'invitations to join a group';


--
-- Name: COLUMN "invitations"."access"; Type: COMMENT; Schema: public; Owner: supabase_admin
--

COMMENT ON COLUMN "public"."invitations"."access" IS 'access level';


--
-- Name: profile; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE "public"."profile" (
    "id" "uuid" NOT NULL,
    "email" "text",
    "firstname" "text",
    "lastname" "text",
    "phone" "text",
    "address" "text",
    "city" "text",
    "state" "text",
    "postal_code" "text",
    "bio" "text",
    "photo_url" "text",
    "xtra" "jsonb"
);


ALTER TABLE "public"."profile" OWNER TO "supabase_admin";

--
-- Name: members; Type: VIEW; Schema: public; Owner: supabase_admin
--

CREATE VIEW "public"."members" AS
 SELECT "groups_access"."group_id",
    "groups_access"."access",
    "profile"."id",
    "profile"."email",
    "profile"."firstname",
    "profile"."lastname",
    "profile"."phone",
    "profile"."address",
    "profile"."city",
    "profile"."state",
    "profile"."postal_code",
    "profile"."bio",
    "profile"."photo_url",
    "profile"."xtra"
   FROM ("public"."groups_access"
     JOIN "public"."profile" ON (("profile"."id" = "groups_access"."user_id")));


ALTER TABLE "public"."members" OWNER TO "supabase_admin";

--
-- Name: groups_access group_access_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY "public"."groups_access"
    ADD CONSTRAINT "group_access_pkey" PRIMARY KEY ("id");


--
-- Name: groups group_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "group_pkey" PRIMARY KEY ("id");


--
-- Name: invitations invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_pkey" PRIMARY KEY ("id");


--
-- Name: profile profile_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_pkey" PRIMARY KEY ("id");


--
-- Name: groups groups_insert_root_trigger; Type: TRIGGER; Schema: public; Owner: supabase_admin
--

CREATE TRIGGER "groups_insert_root_trigger" BEFORE INSERT OR UPDATE ON "public"."groups" FOR EACH ROW EXECUTE FUNCTION "public"."groups_update_root_id"();


--
-- Name: groups groups_insert_trigger; Type: TRIGGER; Schema: public; Owner: supabase_admin
--

CREATE TRIGGER "groups_insert_trigger" AFTER INSERT ON "public"."groups" FOR EACH ROW EXECUTE FUNCTION "public"."groups_insert_add_admin_trigger_function"();


--
-- Name: groups_access group_access_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY "public"."groups_access"
    ADD CONSTRAINT "group_access_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id");


--
-- Name: groups_access group_access_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY "public"."groups_access"
    ADD CONSTRAINT "group_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");


--
-- Name: groups groups_root_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_root_id_fkey" FOREIGN KEY ("root_id") REFERENCES "public"."groups"("id");


--
-- Name: invitations invitations_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id");


--
-- Name: invitations invitations_invited_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "auth"."users"("id");


--
-- Name: invitations invitations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");


--
-- Name: profile profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");


--
-- Name: profile authenticated users can read any profile; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "authenticated users can read any profile" ON "public"."profile" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));


--
-- Name: groups group delete; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "group delete" ON "public"."groups" FOR DELETE USING (false);


--
-- Name: groups group insert; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "group insert" ON "public"."groups" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));


--
-- Name: groups group select; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "group select" ON "public"."groups" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));


--
-- Name: groups group update; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "group update" ON "public"."groups" FOR UPDATE USING ((("auth"."role"() = 'authenticated'::"text") AND ("public"."get_group_access"("id", "auth"."uid"()) = 'admin'::"text"))) WITH CHECK ((("auth"."role"() = 'authenticated'::"text") AND ("public"."get_group_access"("id", "auth"."uid"()) = 'admin'::"text")));


--
-- Name: groups; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--

ALTER TABLE "public"."groups" ENABLE ROW LEVEL SECURITY;

--
-- Name: invitations; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--

ALTER TABLE "public"."invitations" ENABLE ROW LEVEL SECURITY;

--
-- Name: invitations invitations delete; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "invitations delete" ON "public"."invitations" FOR DELETE USING (false);


--
-- Name: invitations invitations insert - must be group admin; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "invitations insert - must be group admin" ON "public"."invitations" FOR INSERT WITH CHECK ((("auth"."role"() = 'authenticated'::"text") AND ("public"."get_group_access"("group_id", "auth"."uid"()) = 'admin'::"text")));


--
-- Name: invitations invitations select; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "invitations select" ON "public"."invitations" FOR SELECT USING ((("auth"."role"() = 'authenticated'::"text") AND (("invited_by" = "auth"."uid"()) OR ("email" = "auth"."email"()))));


--
-- Name: invitations invitations update; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "invitations update" ON "public"."invitations" FOR UPDATE USING (false) WITH CHECK (false);


--
-- Name: profile; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--

ALTER TABLE "public"."profile" ENABLE ROW LEVEL SECURITY;

--
-- Name: profile users can create their own profile; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "users can create their own profile" ON "public"."profile" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));


--
-- Name: profile users can delete their own profile; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "users can delete their own profile" ON "public"."profile" FOR DELETE USING (("auth"."uid"() = "id"));


--
-- Name: profile users can update their own profile; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "users can update their own profile" ON "public"."profile" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));


--
-- Name: SCHEMA "public"; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


--
-- Name: FUNCTION "get_group_access"("group_id_var" "uuid", "user_id_var" "uuid"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."get_group_access"("group_id_var" "uuid", "user_id_var" "uuid") TO "postgres";
GRANT ALL ON FUNCTION "public"."get_group_access"("group_id_var" "uuid", "user_id_var" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_group_access"("group_id_var" "uuid", "user_id_var" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_group_access"("group_id_var" "uuid", "user_id_var" "uuid") TO "service_role";


--
-- Name: FUNCTION "groups_delete"("target" "uuid"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."groups_delete"("target" "uuid") TO "postgres";
GRANT ALL ON FUNCTION "public"."groups_delete"("target" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."groups_delete"("target" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."groups_delete"("target" "uuid") TO "service_role";


--
-- Name: FUNCTION "groups_get_groups_for_user"("target_user_id" "uuid"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."groups_get_groups_for_user"("target_user_id" "uuid") TO "postgres";
GRANT ALL ON FUNCTION "public"."groups_get_groups_for_user"("target_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."groups_get_groups_for_user"("target_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."groups_get_groups_for_user"("target_user_id" "uuid") TO "service_role";


--
-- Name: FUNCTION "groups_get_root_groups_for_user"("target_user_id" "uuid"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."groups_get_root_groups_for_user"("target_user_id" "uuid") TO "postgres";
GRANT ALL ON FUNCTION "public"."groups_get_root_groups_for_user"("target_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."groups_get_root_groups_for_user"("target_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."groups_get_root_groups_for_user"("target_user_id" "uuid") TO "service_role";


--
-- Name: FUNCTION "groups_get_root_id"("target" "uuid"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."groups_get_root_id"("target" "uuid") TO "postgres";
GRANT ALL ON FUNCTION "public"."groups_get_root_id"("target" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."groups_get_root_id"("target" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."groups_get_root_id"("target" "uuid") TO "service_role";


--
-- Name: FUNCTION "groups_get_tree_for_group"("target_group_id" "uuid"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."groups_get_tree_for_group"("target_group_id" "uuid") TO "postgres";
GRANT ALL ON FUNCTION "public"."groups_get_tree_for_group"("target_group_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."groups_get_tree_for_group"("target_group_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."groups_get_tree_for_group"("target_group_id" "uuid") TO "service_role";


--
-- Name: FUNCTION "groups_insert_add_admin_trigger_function"(); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."groups_insert_add_admin_trigger_function"() TO "postgres";
GRANT ALL ON FUNCTION "public"."groups_insert_add_admin_trigger_function"() TO "anon";
GRANT ALL ON FUNCTION "public"."groups_insert_add_admin_trigger_function"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."groups_insert_add_admin_trigger_function"() TO "service_role";


--
-- Name: FUNCTION "groups_is_admin"("target" "uuid", "uid" "uuid"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."groups_is_admin"("target" "uuid", "uid" "uuid") TO "postgres";
GRANT ALL ON FUNCTION "public"."groups_is_admin"("target" "uuid", "uid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."groups_is_admin"("target" "uuid", "uid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."groups_is_admin"("target" "uuid", "uid" "uuid") TO "service_role";


--
-- Name: FUNCTION "groups_update_root_id"(); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."groups_update_root_id"() TO "postgres";
GRANT ALL ON FUNCTION "public"."groups_update_root_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."groups_update_root_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."groups_update_root_id"() TO "service_role";


--
-- Name: FUNCTION "handle_new_user"(); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "postgres";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";


--
-- Name: FUNCTION "invitations_accept"("target" "uuid"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."invitations_accept"("target" "uuid") TO "postgres";
GRANT ALL ON FUNCTION "public"."invitations_accept"("target" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."invitations_accept"("target" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."invitations_accept"("target" "uuid") TO "service_role";


--
-- Name: FUNCTION "invitations_reject"("target" "uuid"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."invitations_reject"("target" "uuid") TO "postgres";
GRANT ALL ON FUNCTION "public"."invitations_reject"("target" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."invitations_reject"("target" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."invitations_reject"("target" "uuid") TO "service_role";


--
-- Name: TABLE "groups"; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE "public"."groups" TO "postgres";
GRANT ALL ON TABLE "public"."groups" TO "anon";
GRANT ALL ON TABLE "public"."groups" TO "authenticated";
GRANT ALL ON TABLE "public"."groups" TO "service_role";


--
-- Name: TABLE "groups_access"; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE "public"."groups_access" TO "postgres";
GRANT ALL ON TABLE "public"."groups_access" TO "anon";
GRANT ALL ON TABLE "public"."groups_access" TO "authenticated";
GRANT ALL ON TABLE "public"."groups_access" TO "service_role";


--
-- Name: TABLE "invitations"; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE "public"."invitations" TO "postgres";
GRANT ALL ON TABLE "public"."invitations" TO "anon";
GRANT ALL ON TABLE "public"."invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."invitations" TO "service_role";


--
-- Name: TABLE "profile"; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE "public"."profile" TO "postgres";
GRANT ALL ON TABLE "public"."profile" TO "anon";
GRANT ALL ON TABLE "public"."profile" TO "authenticated";
GRANT ALL ON TABLE "public"."profile" TO "service_role";


--
-- Name: TABLE "members"; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE "public"."members" TO "postgres";
GRANT ALL ON TABLE "public"."members" TO "anon";
GRANT ALL ON TABLE "public"."members" TO "authenticated";
GRANT ALL ON TABLE "public"."members" TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";


--
-- PostgreSQL database dump complete
--

