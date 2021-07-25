--
-- PostgreSQL database dump
--

-- Dumped from database version 13.3
-- Dumped by pg_dump version 13.3

-- Started on 2021-07-25 12:00:27

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

--
-- TOC entry 3 (class 3079 OID 16633)
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- TOC entry 3194 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- TOC entry 2 (class 3079 OID 16525)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 3195 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 281 (class 1255 OID 25425)
-- Name: add_article(text, text, text, text, text, text[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.add_article(slug text, title text, description text, body text, author text, tags text[]) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE id_article uuid = uuid_generate_v4();
BEGIN
INSERT INTO articles (id, slug, title, description, body, "authorId")
VALUES (
  id_article,
  slug,
  title,
  description,
  body,
  author::uuid
);
CALL set_tag_for_article(tags, id_article);
Return (SELECT article_json(id_article, author::uuid));
END;
$$;


ALTER FUNCTION public.add_article(slug text, title text, description text, body text, author text, tags text[]) OWNER TO postgres;

--
-- TOC entry 287 (class 1255 OID 33630)
-- Name: add_article_to_favorites(text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.add_article_to_favorites(slugtext text, user_id text) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE 
  id_article uuid;
BEGIN
SELECT id INTO id_article FROM articles WHERE articles.slug=slugText;

IF NOT EXISTS (
	SELECT 1 FROM users_favorites_articles
	WHERE users_favorites_articles."usersId"=user_id::uuid
	  AND users_favorites_articles."articlesId"=id_article
) THEN
  	INSERT INTO users_favorites_articles ("articlesId", "usersId")
  	VALUES (id_article, user_id::uuid);
END IF;

Return (SELECT article_json(id_article, user_id::uuid));
END;
$$;


ALTER FUNCTION public.add_article_to_favorites(slugtext text, user_id text) OWNER TO postgres;

--
-- TOC entry 291 (class 1255 OID 33641)
-- Name: add_comment(uuid, text, text, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.add_comment(id_user uuid, slug_text text, body text, id_parent uuid DEFAULT NULL::uuid) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE article_id uuid;
comment_id uuid;
BEGIN
  SELECT ID INTO article_id FROM articles
    WHERE slug = slug_text;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Article does not find';
  END IF;
  INSERT INTO comments ("id_parent", "body", "authorId", "articleId")
  VALUES (id_parent, body, id_user, article_id)
  RETURNING id INTO comment_id;
  RETURN (SELECT comment_json(comment_id, id_user));	
END;
$$;


ALTER FUNCTION public.add_comment(id_user uuid, slug_text text, body text, id_parent uuid) OWNER TO postgres;

--
-- TOC entry 283 (class 1255 OID 33616)
-- Name: article_by_slug(text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.article_by_slug(slugtext text, iduser text) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE id_article uuid;
BEGIN
  select id into id_article from articles WHERE articles.slug=slugtext;
  Return (SELECT article_json(id_article, iduser::uuid));
END;
$$;


ALTER FUNCTION public.article_by_slug(slugtext text, iduser text) OWNER TO postgres;

--
-- TOC entry 292 (class 1255 OID 25426)
-- Name: article_json(uuid, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.article_json(articleid uuid, userid uuid) RETURNS json
    LANGUAGE sql
    AS $$
select to_jsonb(artcl)
from (
    select slug,
      title,
      description,
      body,
      "createdAt",
      "updatedAt",
      (
        select
        array_to_json(array_agg(to_json(tags.name))) as tagList
        from tags,tags_in_articles_articles
        where tags_in_articles_articles."articlesId" = articles.id
          AND tags_in_articles_articles."tagsId" = tags.id
      ) AS "tagList",
      exists(
        SELECT 1
        FROM users_favorites_articles
        WHERE "articlesId" = articles.id
          AND "usersId" = userId
      ) AS favorited,
      (
        SELECT COUNT(*)
        FROM users_favorites_articles
        WHERE "articlesId" = articles.id
      ) AS "favoritesCount",
      (
        SELECT COUNT(*)
        FROM comments
        WHERE comments."articleId" = articleId
      ) AS "commentsCount",
      (
        SELECT to_jsonb(a)
        FROM (
            SELECT username,
              bio,
              image,
              EXISTS(
                SELECT 1
                FROM follows
                WHERE "followerId" = userId
                  AND "followingId" = articles."authorId"
              ) AS following
            FROM users
            WHERE users.id = articles."authorId"
          ) a
      ) AS author
    from articles
    WHERE id = articleId
  ) artcl
$$;


ALTER FUNCTION public.article_json(articleid uuid, userid uuid) OWNER TO postgres;

--
-- TOC entry 293 (class 1255 OID 33643)
-- Name: comment_json(uuid, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.comment_json(comment_id uuid, user_id uuid) RETURNS json
    LANGUAGE sql
    AS $$
  select to_jsonb(commnt)
  from (
      select id, "createdAt", "updatedAt", body, id_parent as "idParent",
        (
          SELECT to_jsonb(a)
          FROM (
              SELECT username,
                bio,
                image,
                EXISTS(
                  SELECT 1
                  FROM follows
                  WHERE "followerId" = user_id
                    AND "followingId" = comments."authorId"
                ) AS following
              FROM users
              WHERE users.id = comments."authorId"
            ) a
        ) AS author
      from comments
      WHERE id = comment_id
    ) commnt
  $$;


ALTER FUNCTION public.comment_json(comment_id uuid, user_id uuid) OWNER TO postgres;

--
-- TOC entry 285 (class 1255 OID 33627)
-- Name: delete_article(text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.delete_article(slugtext text, author text) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE 
  id_article uuid;
  can_delete boolean;
BEGIN
SELECT id INTO id_article FROM articles WHERE articles.slug=slugText AND articles."authorId"=author::uuid;
IF NOT FOUND THEN
  RAISE EXCEPTION 'Запись % невозможно удалить',slugText;
END IF;
DELETE FROM articles WHERE id=id_article;
RETURN true;
END;
$$;


ALTER FUNCTION public.delete_article(slugtext text, author text) OWNER TO postgres;

--
-- TOC entry 290 (class 1255 OID 33633)
-- Name: delete_article_from_favorites(text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.delete_article_from_favorites(slugtext text, user_id text) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE 
  id_article uuid;
BEGIN
SELECT id INTO id_article FROM articles WHERE articles.slug=slugText;

IF EXISTS (
	SELECT 1 FROM users_favorites_articles
	WHERE users_favorites_articles."usersId"=user_id::uuid
	  AND users_favorites_articles."articlesId"=id_article
) THEN
  	DELETE FROM users_favorites_articles
  	WHERE "usersId"=user_id::uuid AND "articlesId"=id_article;
END IF;

Return (SELECT article_json(id_article, user_id::uuid));
END;
$$;


ALTER FUNCTION public.delete_article_from_favorites(slugtext text, user_id text) OWNER TO postgres;

--
-- TOC entry 284 (class 1255 OID 33625)
-- Name: edit_article(text, text, text, text, text[], text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.edit_article(slugtext text, titletext text, descriptiontext text, bodytext text, tags text[], author text) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE 
  id_article uuid;
  can_edit boolean;
BEGIN
select id into id_article from articles WHERE articles.slug=slugText and articles."authorId"=author::uuid;
IF NOT FOUND THEN
	RAISE EXCEPTION 'Запись % невозможно редактировать',slugText;
END IF;
  UPDATE articles SET title=titleText, description=descriptionText, body=bodyText
    WHERE id=id_article;
  CALL set_tag_for_article(tags, id_article);
  Return (SELECT article_json(id_article, author::uuid) as articles);
END;
$$;


ALTER FUNCTION public.edit_article(slugtext text, titletext text, descriptiontext text, bodytext text, tags text[], author text) OWNER TO postgres;

--
-- TOC entry 289 (class 1255 OID 33636)
-- Name: follow_profile(uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.follow_profile(follower uuid, user_name text) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE user_id uuid;
BEGIN
  select id into user_id from users WHERE username=user_name;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile does not exist';
  END IF;
  IF follower=user_id THEN
    RAISE EXCEPTION 'Ты не можешь следить сам за собой';
  END IF;
  IF NOT EXISTS (
  SELECT id FROM follows
  WHERE follows."followerId"=follower
    AND follows."followingId"=user_id
  ) THEN
    INSERT INTO follows ("followerId", "followingId")
    VALUES (follower, user_id);
  END IF;
    
  Return (SELECT get_profile_by_username(follower, user_name));
END;
$$;


ALTER FUNCTION public.follow_profile(follower uuid, user_name text) OWNER TO postgres;

--
-- TOC entry 279 (class 1255 OID 25420)
-- Name: get_articles_json(character varying, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_articles_json(userid character varying, lmt integer, offst integer) RETURNS json
    LANGUAGE sql
    AS $$
Select to_jsonb(res) AS res
FROM (
SELECT COUNT(*) AS "articlesCount", (
select array_to_json(array_agg(to_jsonb(a4))) FROM (
	select slug, title, description, body, "createdAt", "updatedAt",

	(
      select array_to_json(array_agg(to_jsonb(tag)))
      from (
        select id, name
        from tags, tags_in_articles_articles
        where tags_in_articles_articles."articlesId"=articles.id
		  		AND tags_in_articles_articles."tagsId"=tags.id
        order by tags.name
      ) tag
   ) AS "tagList",	

	exists(SELECT 1 FROM users_favorites_articles WHERE "articlesId"=articles.id AND "usersId"=userId::uuid) AS favorited,

	(SELECT COUNT(*) FROM users_favorites_articles WHERE "articlesId"=articles.id) AS "favoritesCount",

	(
		SELECT to_jsonb(a) FROM (
			SELECT username, bio, image, EXISTS(
				SELECT 1 FROM follows 
				WHERE "followerId"=userId::uuid AND "followingId"=articles."authorId"
				) AS following FROM users WHERE users.id=articles."authorId"
		) a		
	) AS author

	from articles ORDER BY "createdAt" DESC LIMIT lmt OFFSET offst
) a4
) AS articles
from articles
) res
$$;


ALTER FUNCTION public.get_articles_json(userid character varying, lmt integer, offst integer) OWNER TO postgres;

--
-- TOC entry 294 (class 1255 OID 41830)
-- Name: get_comments_json(text, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_comments_json(slugtext text, userid uuid) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE article_id uuid;
BEGIN
  select id into article_id from articles WHERE slug=slugtext;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Article does not exist';
  END IF;	
  Return (	
    Select to_jsonb(res) AS res FROM (
    Select (select array_to_json(array_agg(to_jsonb(a4))) FROM (
      Select id, id_parent, body, "createdAt", "updatedAt",
      (
        SELECT to_jsonb(a)
        FROM (
          SELECT username,
          bio,
          image,
          EXISTS(
            SELECT 1 FROM follows
            WHERE "followerId" = userid AND "followingId" = comments_ordered."authorId"
          ) AS following
          FROM users
        WHERE users.id = comments_ordered."authorId"
            ) a
        ) AS author
    from comments_ordered where "articleId"=article_id
    ) a4
    ) as comments ) res);
END;
$$;


ALTER FUNCTION public.get_comments_json(slugtext text, userid uuid) OWNER TO postgres;

--
-- TOC entry 282 (class 1255 OID 33634)
-- Name: get_profile_by_username(text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_profile_by_username(follower text, user_name text) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE user_id uuid;
BEGIN
  select id into user_id from users WHERE username=user_name;  
  Return (SELECT to_jsonb(usr) FROM (
	  SELECT username, bio, image, active,
	  	exists (SELECT id FROM follows WHERE follows."followerId"=follower::uuid AND follows."followingId"=user_id) as following
	  FROM users WHERE id=user_id
  ) usr);
END;
$$;


ALTER FUNCTION public.get_profile_by_username(follower text, user_name text) OWNER TO postgres;

--
-- TOC entry 286 (class 1255 OID 33635)
-- Name: get_profile_by_username(uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_profile_by_username(follower uuid, user_name text) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE user_id uuid;
BEGIN
  select id into user_id from users WHERE username=user_name;  
  Return (SELECT to_jsonb(usr) FROM (
    SELECT username, bio, image, active,
      exists (SELECT id FROM follows WHERE follows."followerId"=follower AND follows."followingId"=user_id) as following
    FROM users WHERE id=user_id
  ) usr);
END;
$$;


ALTER FUNCTION public.get_profile_by_username(follower uuid, user_name text) OWNER TO postgres;

--
-- TOC entry 278 (class 1255 OID 17210)
-- Name: insert_tag(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.insert_tag(nametag character varying) RETURNS uuid
    LANGUAGE sql
    AS $$
      INSERT INTO tags (name) 
      SELECT nameTag
      WHERE
          NOT EXISTS (
              SELECT tags.id FROM tags WHERE tags.name = nameTag
          );
      select tags.id from tags WHERE tags.name = nameTag;	
      $$;


ALTER FUNCTION public.insert_tag(nametag character varying) OWNER TO postgres;

--
-- TOC entry 280 (class 1255 OID 25410)
-- Name: set_tag_for_article(character varying[], uuid); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.set_tag_for_article(tags character varying[], article uuid)
    LANGUAGE plpgsql
    AS $$
DECLARE                                                     
  n_tag character varying;
begin

  DELETE from tags_in_articles_articles WHERE "articlesId"=article;

  FOREACH n_tag IN ARRAY tags	LOOP
    INSERT INTO tags_in_articles_articles ("tagsId", "articlesId") 
    SELECT insert_tag(n_tag), article;
  END LOOP;
end;
$$;


ALTER PROCEDURE public.set_tag_for_article(tags character varying[], article uuid) OWNER TO postgres;

--
-- TOC entry 3196 (class 0 OID 0)
-- Dependencies: 280
-- Name: PROCEDURE set_tag_for_article(tags character varying[], article uuid); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON PROCEDURE public.set_tag_for_article(tags character varying[], article uuid) IS 'Установить тэги для статьи';


--
-- TOC entry 288 (class 1255 OID 33637)
-- Name: unfollow_profile(uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.unfollow_profile(follower uuid, user_name text) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE user_id uuid;
BEGIN
  select id into user_id from users WHERE username=user_name;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile does not exist';
  END IF;
  IF follower=user_id THEN
    RAISE EXCEPTION 'Ты не можешь следить сам за собой';
  END IF;
  
  DELETE FROM follows
  WHERE follows."followerId"=follower
    AND follows."followingId"=user_id;
    
  Return (SELECT get_profile_by_username(follower, user_name));
END;
$$;


ALTER FUNCTION public.unfollow_profile(follower uuid, user_name text) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 206 (class 1259 OID 17158)
-- Name: articles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.articles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    slug character varying NOT NULL,
    title character varying NOT NULL,
    description character varying DEFAULT ''::character varying NOT NULL,
    body character varying DEFAULT ''::character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "authorId" uuid
);


ALTER TABLE public.articles OWNER TO postgres;

--
-- TOC entry 209 (class 1259 OID 17213)
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    id_parent uuid,
    body character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "authorId" uuid NOT NULL,
    "articleId" uuid NOT NULL
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- TOC entry 3197 (class 0 OID 0)
-- Dependencies: 209
-- Name: COLUMN comments.body; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.comments.body IS 'Текст комментария';


--
-- TOC entry 211 (class 1259 OID 33654)
-- Name: comments_ordered; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.comments_ordered AS
 WITH RECURSIVE tree AS (
         SELECT comments.id,
            comments.id_parent,
            comments.body,
            comments."createdAt",
            comments."updatedAt",
            comments."authorId",
            comments."articleId",
            (comments.id)::text AS path
           FROM public.comments
          WHERE (comments.id_parent IS NULL)
        UNION
         SELECT f1.id,
            f1.id_parent,
            f1.body,
            f1."createdAt",
            f1."updatedAt",
            f1."authorId",
            f1."articleId",
            ((tree_1.path || '/'::text) || (f1.id)::text) AS path
           FROM (tree tree_1
             JOIN public.comments f1 ON ((f1.id_parent = tree_1.id)))
        )
 SELECT tree.id,
    tree.id_parent,
    tree.body,
    tree."createdAt",
    tree."updatedAt",
    tree."authorId",
    tree."articleId"
   FROM tree
  ORDER BY tree.path, tree."createdAt";


ALTER TABLE public.comments_ordered OWNER TO postgres;

--
-- TOC entry 210 (class 1259 OID 25411)
-- Name: follows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.follows (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "followerId" uuid NOT NULL,
    "followingId" uuid NOT NULL
);


ALTER TABLE public.follows OWNER TO postgres;

--
-- TOC entry 203 (class 1259 OID 17121)
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- TOC entry 202 (class 1259 OID 17119)
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.migrations_id_seq OWNER TO postgres;

--
-- TOC entry 3198 (class 0 OID 0)
-- Dependencies: 202
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- TOC entry 205 (class 1259 OID 17147)
-- Name: tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.tags OWNER TO postgres;

--
-- TOC entry 208 (class 1259 OID 17178)
-- Name: tags_in_articles_articles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags_in_articles_articles (
    "tagsId" uuid NOT NULL,
    "articlesId" uuid NOT NULL
);


ALTER TABLE public.tags_in_articles_articles OWNER TO postgres;

--
-- TOC entry 204 (class 1259 OID 17131)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    username character varying NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    bio character varying DEFAULT ''::character varying NOT NULL,
    image character varying DEFAULT ''::character varying NOT NULL,
    active boolean DEFAULT false NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 207 (class 1259 OID 17171)
-- Name: users_favorites_articles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users_favorites_articles (
    "usersId" uuid NOT NULL,
    "articlesId" uuid NOT NULL
);


ALTER TABLE public.users_favorites_articles OWNER TO postgres;

--
-- TOC entry 3007 (class 2604 OID 17124)
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- TOC entry 3035 (class 2606 OID 17170)
-- Name: articles PK_0a6e2c450d83e0b6052c2793334; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT "PK_0a6e2c450d83e0b6052c2793334" PRIMARY KEY (id);


--
-- TOC entry 3049 (class 2606 OID 25419)
-- Name: follows PK_8988f607744e16ff79da3b8a627; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT "PK_8988f607744e16ff79da3b8a627" PRIMARY KEY (id);


--
-- TOC entry 3047 (class 2606 OID 17223)
-- Name: comments PK_8bf68bc960f2b69e818bdb90dcb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY (id);


--
-- TOC entry 3023 (class 2606 OID 17129)
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- TOC entry 3025 (class 2606 OID 17139)
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- TOC entry 3045 (class 2606 OID 17182)
-- Name: tags_in_articles_articles PK_a705f9719c457941ebc83199e0c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags_in_articles_articles
    ADD CONSTRAINT "PK_a705f9719c457941ebc83199e0c" PRIMARY KEY ("tagsId", "articlesId");


--
-- TOC entry 3041 (class 2606 OID 17175)
-- Name: users_favorites_articles PK_aebb5070a5fa58957adae6d78af; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_favorites_articles
    ADD CONSTRAINT "PK_aebb5070a5fa58957adae6d78af" PRIMARY KEY ("usersId", "articlesId");


--
-- TOC entry 3031 (class 2606 OID 17155)
-- Name: tags PK_e7dc17249a1148a1970748eda99; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY (id);


--
-- TOC entry 3037 (class 2606 OID 17212)
-- Name: articles UQ_1123ff6815c5b8fec0ba9fec370; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT "UQ_1123ff6815c5b8fec0ba9fec370" UNIQUE (slug);


--
-- TOC entry 3027 (class 2606 OID 17143)
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- TOC entry 3033 (class 2606 OID 17157)
-- Name: tags UQ_d90243459a697eadb8ad56e9092; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT "UQ_d90243459a697eadb8ad56e9092" UNIQUE (name);


--
-- TOC entry 3029 (class 2606 OID 17141)
-- Name: users UQ_fe0bb3f6520ee0469504521e710; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE (username);


--
-- TOC entry 3038 (class 1259 OID 17177)
-- Name: IDX_61dc60abcf0035e5ce2aea013b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_61dc60abcf0035e5ce2aea013b" ON public.users_favorites_articles USING btree ("articlesId");


--
-- TOC entry 3042 (class 1259 OID 17184)
-- Name: IDX_644e1ee7f17bed955923c0876f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_644e1ee7f17bed955923c0876f" ON public.tags_in_articles_articles USING btree ("articlesId");


--
-- TOC entry 3039 (class 1259 OID 17176)
-- Name: IDX_b3bc5ca3e98f5f3858dbf626ad; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_b3bc5ca3e98f5f3858dbf626ad" ON public.users_favorites_articles USING btree ("usersId");


--
-- TOC entry 3043 (class 1259 OID 17183)
-- Name: IDX_bd9792857d9e7fe5eb8f51a523; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_bd9792857d9e7fe5eb8f51a523" ON public.tags_in_articles_articles USING btree ("tagsId");


--
-- TOC entry 3055 (class 2606 OID 17224)
-- Name: comments FK_4548cc4a409b8651ec75f70e280; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "FK_4548cc4a409b8651ec75f70e280" FOREIGN KEY ("authorId") REFERENCES public.users(id);


--
-- TOC entry 3052 (class 2606 OID 17195)
-- Name: users_favorites_articles FK_61dc60abcf0035e5ce2aea013bc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_favorites_articles
    ADD CONSTRAINT "FK_61dc60abcf0035e5ce2aea013bc" FOREIGN KEY ("articlesId") REFERENCES public.articles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3054 (class 2606 OID 17205)
-- Name: tags_in_articles_articles FK_644e1ee7f17bed955923c0876fc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags_in_articles_articles
    ADD CONSTRAINT "FK_644e1ee7f17bed955923c0876fc" FOREIGN KEY ("articlesId") REFERENCES public.articles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3050 (class 2606 OID 17185)
-- Name: articles FK_65d9ccc1b02f4d904e90bd76a34; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34" FOREIGN KEY ("authorId") REFERENCES public.users(id);


--
-- TOC entry 3056 (class 2606 OID 17229)
-- Name: comments FK_b0011304ebfcb97f597eae6c31f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "FK_b0011304ebfcb97f597eae6c31f" FOREIGN KEY ("articleId") REFERENCES public.articles(id);


--
-- TOC entry 3051 (class 2606 OID 17190)
-- Name: users_favorites_articles FK_b3bc5ca3e98f5f3858dbf626ad6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_favorites_articles
    ADD CONSTRAINT "FK_b3bc5ca3e98f5f3858dbf626ad6" FOREIGN KEY ("usersId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3053 (class 2606 OID 17200)
-- Name: tags_in_articles_articles FK_bd9792857d9e7fe5eb8f51a5236; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags_in_articles_articles
    ADD CONSTRAINT "FK_bd9792857d9e7fe5eb8f51a5236" FOREIGN KEY ("tagsId") REFERENCES public.tags(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3057 (class 2606 OID 33649)
-- Name: comments fk_tree_comments; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT fk_tree_comments FOREIGN KEY (id_parent) REFERENCES public.comments(id) ON DELETE CASCADE;


-- Completed on 2021-07-25 12:00:27

--
-- PostgreSQL database dump complete
--

