--
-- PostgreSQL database dump
--

-- Dumped from database version 13.3
-- Dumped by pg_dump version 13.3

-- Started on 2021-07-12 11:28:24

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
-- TOC entry 8 (class 2615 OID 17239)
-- Name: yourschema; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA yourschema;


ALTER SCHEMA yourschema OWNER TO postgres;

--
-- TOC entry 3 (class 3079 OID 16633)
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- TOC entry 3166 (class 0 OID 0)
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
-- TOC entry 3167 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 277 (class 1255 OID 17210)
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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 207 (class 1259 OID 17158)
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
    "authorId" uuid,
    "commentId" uuid
);


ALTER TABLE public.articles OWNER TO postgres;

--
-- TOC entry 210 (class 1259 OID 17213)
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    id_parent uuid,
    comment character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "authorId" uuid,
    "articleId" uuid
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- TOC entry 3168 (class 0 OID 0)
-- Dependencies: 210
-- Name: COLUMN comments.comment; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.comments.comment IS 'Текст комментария';


--
-- TOC entry 204 (class 1259 OID 17121)
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- TOC entry 203 (class 1259 OID 17119)
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
-- TOC entry 3169 (class 0 OID 0)
-- Dependencies: 203
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- TOC entry 206 (class 1259 OID 17147)
-- Name: tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.tags OWNER TO postgres;

--
-- TOC entry 209 (class 1259 OID 17178)
-- Name: tags_in_articles_articles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags_in_articles_articles (
    "tagsId" uuid NOT NULL,
    "articlesId" uuid NOT NULL
);


ALTER TABLE public.tags_in_articles_articles OWNER TO postgres;

--
-- TOC entry 205 (class 1259 OID 17131)
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
-- TOC entry 208 (class 1259 OID 17171)
-- Name: users_favorites_articles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users_favorites_articles (
    "usersId" uuid NOT NULL,
    "articlesId" uuid NOT NULL
);


ALTER TABLE public.users_favorites_articles OWNER TO postgres;

--
-- TOC entry 2983 (class 2604 OID 17124)
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- TOC entry 3010 (class 2606 OID 17170)
-- Name: articles PK_0a6e2c450d83e0b6052c2793334; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT "PK_0a6e2c450d83e0b6052c2793334" PRIMARY KEY (id);


--
-- TOC entry 3022 (class 2606 OID 17223)
-- Name: comments PK_8bf68bc960f2b69e818bdb90dcb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY (id);


--
-- TOC entry 2998 (class 2606 OID 17129)
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- TOC entry 3000 (class 2606 OID 17139)
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- TOC entry 3020 (class 2606 OID 17182)
-- Name: tags_in_articles_articles PK_a705f9719c457941ebc83199e0c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags_in_articles_articles
    ADD CONSTRAINT "PK_a705f9719c457941ebc83199e0c" PRIMARY KEY ("tagsId", "articlesId");


--
-- TOC entry 3016 (class 2606 OID 17175)
-- Name: users_favorites_articles PK_aebb5070a5fa58957adae6d78af; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_favorites_articles
    ADD CONSTRAINT "PK_aebb5070a5fa58957adae6d78af" PRIMARY KEY ("usersId", "articlesId");


--
-- TOC entry 3006 (class 2606 OID 17155)
-- Name: tags PK_e7dc17249a1148a1970748eda99; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY (id);


--
-- TOC entry 3012 (class 2606 OID 17212)
-- Name: articles UQ_1123ff6815c5b8fec0ba9fec370; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT "UQ_1123ff6815c5b8fec0ba9fec370" UNIQUE (slug);


--
-- TOC entry 3002 (class 2606 OID 17143)
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- TOC entry 3008 (class 2606 OID 17157)
-- Name: tags UQ_d90243459a697eadb8ad56e9092; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT "UQ_d90243459a697eadb8ad56e9092" UNIQUE (name);


--
-- TOC entry 3004 (class 2606 OID 17141)
-- Name: users UQ_fe0bb3f6520ee0469504521e710; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE (username);


--
-- TOC entry 3013 (class 1259 OID 17177)
-- Name: IDX_61dc60abcf0035e5ce2aea013b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_61dc60abcf0035e5ce2aea013b" ON public.users_favorites_articles USING btree ("articlesId");


--
-- TOC entry 3017 (class 1259 OID 17184)
-- Name: IDX_644e1ee7f17bed955923c0876f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_644e1ee7f17bed955923c0876f" ON public.tags_in_articles_articles USING btree ("articlesId");


--
-- TOC entry 3014 (class 1259 OID 17176)
-- Name: IDX_b3bc5ca3e98f5f3858dbf626ad; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_b3bc5ca3e98f5f3858dbf626ad" ON public.users_favorites_articles USING btree ("usersId");


--
-- TOC entry 3018 (class 1259 OID 17183)
-- Name: IDX_bd9792857d9e7fe5eb8f51a523; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_bd9792857d9e7fe5eb8f51a523" ON public.tags_in_articles_articles USING btree ("tagsId");


--
-- TOC entry 3029 (class 2606 OID 17224)
-- Name: comments FK_4548cc4a409b8651ec75f70e280; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "FK_4548cc4a409b8651ec75f70e280" FOREIGN KEY ("authorId") REFERENCES public.users(id);


--
-- TOC entry 3026 (class 2606 OID 17195)
-- Name: users_favorites_articles FK_61dc60abcf0035e5ce2aea013bc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_favorites_articles
    ADD CONSTRAINT "FK_61dc60abcf0035e5ce2aea013bc" FOREIGN KEY ("articlesId") REFERENCES public.articles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3028 (class 2606 OID 17205)
-- Name: tags_in_articles_articles FK_644e1ee7f17bed955923c0876fc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags_in_articles_articles
    ADD CONSTRAINT "FK_644e1ee7f17bed955923c0876fc" FOREIGN KEY ("articlesId") REFERENCES public.articles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3023 (class 2606 OID 17185)
-- Name: articles FK_65d9ccc1b02f4d904e90bd76a34; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34" FOREIGN KEY ("authorId") REFERENCES public.users(id);


--
-- TOC entry 3024 (class 2606 OID 17234)
-- Name: articles FK_712708472f44a600c8bf9b7e02e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT "FK_712708472f44a600c8bf9b7e02e" FOREIGN KEY ("commentId") REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- TOC entry 3030 (class 2606 OID 17229)
-- Name: comments FK_b0011304ebfcb97f597eae6c31f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "FK_b0011304ebfcb97f597eae6c31f" FOREIGN KEY ("articleId") REFERENCES public.articles(id);


--
-- TOC entry 3025 (class 2606 OID 17190)
-- Name: users_favorites_articles FK_b3bc5ca3e98f5f3858dbf626ad6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_favorites_articles
    ADD CONSTRAINT "FK_b3bc5ca3e98f5f3858dbf626ad6" FOREIGN KEY ("usersId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3027 (class 2606 OID 17200)
-- Name: tags_in_articles_articles FK_bd9792857d9e7fe5eb8f51a5236; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags_in_articles_articles
    ADD CONSTRAINT "FK_bd9792857d9e7fe5eb8f51a5236" FOREIGN KEY ("tagsId") REFERENCES public.tags(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2021-07-12 11:28:25

--
-- PostgreSQL database dump complete
--

