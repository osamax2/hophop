--
-- PostgreSQL database dump
--


-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO hophop;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accounts (
    id integer NOT NULL,
    user_id integer NOT NULL,
    username character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    last_login timestamp without time zone,
    access_tokens text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.accounts OWNER TO hophop;

--
-- Name: accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.accounts_id_seq OWNER TO hophop;

--
-- Name: accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.accounts_id_seq OWNED BY public.accounts.id;


--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_logs (
    id integer NOT NULL,
    user_id integer,
    action character varying(100) NOT NULL,
    entity_type character varying(50),
    entity_id integer,
    details jsonb,
    ip_address character varying(45),
    user_agent text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.activity_logs OWNER TO hophop;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activity_logs_id_seq OWNER TO hophop;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;


--
-- Name: booking_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.booking_options (
    id integer NOT NULL,
    transport_type_id integer NOT NULL,
    code character varying(50) NOT NULL,
    label character varying(100) NOT NULL,
    description text
);


ALTER TABLE public.booking_options OWNER TO hophop;

--
-- Name: booking_options_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.booking_options_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.booking_options_id_seq OWNER TO hophop;

--
-- Name: booking_options_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.booking_options_id_seq OWNED BY public.booking_options.id;


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookings (
    id integer NOT NULL,
    user_id integer NOT NULL,
    trip_id integer NOT NULL,
    booking_status character varying(50) NOT NULL,
    seats_booked integer NOT NULL,
    total_price numeric(10,2) NOT NULL,
    currency character varying(10) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.bookings OWNER TO hophop;

--
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bookings_id_seq OWNER TO hophop;

--
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- Name: cities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cities (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    country_code character varying(10),
    address character varying(255),
    latitude numeric(9,6),
    longitude numeric(9,6)
);


ALTER TABLE public.cities OWNER TO hophop;

--
-- Name: cities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cities_id_seq OWNER TO hophop;

--
-- Name: cities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cities_id_seq OWNED BY public.cities.id;


--
-- Name: ratings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ratings (
    id integer NOT NULL,
    user_id integer NOT NULL,
    transport_company_id integer NOT NULL,
    punctuality_rating integer NOT NULL,
    friendliness_rating integer NOT NULL,
    cleanliness_rating integer NOT NULL,
    comment text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT ratings_cleanliness_rating_check CHECK (((cleanliness_rating >= 1) AND (cleanliness_rating <= 5))),
    CONSTRAINT ratings_friendliness_rating_check CHECK (((friendliness_rating >= 1) AND (friendliness_rating <= 5))),
    CONSTRAINT ratings_punctuality_rating_check CHECK (((punctuality_rating >= 1) AND (punctuality_rating <= 5)))
);


ALTER TABLE public.ratings OWNER TO hophop;

--
-- Name: company_ratings_summary; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.company_ratings_summary AS
 SELECT transport_company_id,
    count(*) AS total_ratings,
    round(avg(punctuality_rating), 2) AS avg_punctuality,
    round(avg(friendliness_rating), 2) AS avg_friendliness,
    round(avg(cleanliness_rating), 2) AS avg_cleanliness,
    round((((avg(punctuality_rating) + avg(friendliness_rating)) + avg(cleanliness_rating)) / (3)::numeric), 2) AS overall_average
   FROM public.ratings
  GROUP BY transport_company_id;


ALTER VIEW public.company_ratings_summary OWNER TO hophop;

--
-- Name: fare_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fare_categories (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    label character varying(100) NOT NULL,
    description text,
    is_extra boolean DEFAULT false NOT NULL
);


ALTER TABLE public.fare_categories OWNER TO hophop;

--
-- Name: fare_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fare_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.fare_categories_id_seq OWNER TO hophop;

--
-- Name: fare_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fare_categories_id_seq OWNED BY public.fare_categories.id;


--
-- Name: favorites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.favorites (
    id integer NOT NULL,
    user_id integer NOT NULL,
    trip_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.favorites OWNER TO hophop;

--
-- Name: favorites_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.favorites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.favorites_id_seq OWNER TO hophop;

--
-- Name: favorites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.favorites_id_seq OWNED BY public.favorites.id;


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    id integer NOT NULL,
    booking_id integer NOT NULL,
    invoice_number character varying(100) NOT NULL,
    issue_date date NOT NULL,
    due_date date,
    amount numeric(10,2) NOT NULL,
    currency character varying(10) NOT NULL,
    status character varying(50),
    payment_method character varying(50),
    payment_date date,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.invoices OWNER TO hophop;

--
-- Name: invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.invoices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invoices_id_seq OWNER TO hophop;

--
-- Name: invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.invoices_id_seq OWNED BY public.invoices.id;


--
-- Name: media; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media (
    id integer NOT NULL,
    file_url character varying(500) NOT NULL,
    mime_type character varying(100),
    tag character varying(100),
    uploaded_by_user_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.media OWNER TO hophop;

--
-- Name: media_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.media_id_seq OWNER TO hophop;

--
-- Name: media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.media_id_seq OWNED BY public.media.id;


--
-- Name: media_relations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media_relations (
    id integer NOT NULL,
    media_id integer NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id integer NOT NULL,
    is_primary boolean DEFAULT false NOT NULL
);


ALTER TABLE public.media_relations OWNER TO hophop;

--
-- Name: media_relations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.media_relations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.media_relations_id_seq OWNER TO hophop;

--
-- Name: media_relations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.media_relations_id_seq OWNED BY public.media_relations.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    related_entity_type character varying(50),
    related_entity_id integer,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.notifications OWNER TO hophop;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO hophop;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: ratings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ratings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ratings_id_seq OWNER TO hophop;

--
-- Name: ratings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ratings_id_seq OWNED BY public.ratings.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    user_id integer NOT NULL,
    trip_id integer,
    transport_company_id integer,
    rating_id integer,
    comment text NOT NULL,
    is_approved boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.reviews OWNER TO hophop;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO hophop;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text
);


ALTER TABLE public.roles OWNER TO hophop;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO hophop;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: route_stops; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.route_stops (
    id integer NOT NULL,
    route_id integer NOT NULL,
    station_id integer NOT NULL,
    stop_order integer NOT NULL,
    arrival_time time without time zone,
    departure_time time without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.route_stops OWNER TO hophop;

--
-- Name: route_stops_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.route_stops_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.route_stops_id_seq OWNER TO hophop;

--
-- Name: route_stops_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.route_stops_id_seq OWNED BY public.route_stops.id;


--
-- Name: routes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.routes (
    id integer NOT NULL,
    from_city_id integer NOT NULL,
    to_city_id integer NOT NULL
);


ALTER TABLE public.routes OWNER TO hophop;

--
-- Name: routes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.routes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.routes_id_seq OWNER TO hophop;

--
-- Name: routes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.routes_id_seq OWNED BY public.routes.id;


--
-- Name: stations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stations (
    id integer NOT NULL,
    city_id integer NOT NULL,
    name character varying(255) NOT NULL,
    address character varying(255),
    latitude numeric(9,6),
    longitude numeric(9,6)
);


ALTER TABLE public.stations OWNER TO hophop;

--
-- Name: stations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stations_id_seq OWNER TO hophop;

--
-- Name: stations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stations_id_seq OWNED BY public.stations.id;


--
-- Name: transport_companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transport_companies (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    logo_url character varying(500),
    description text,
    address character varying(255),
    phone character varying(50),
    cr_number character varying(100),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.transport_companies OWNER TO hophop;

--
-- Name: transport_companies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transport_companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transport_companies_id_seq OWNER TO hophop;

--
-- Name: transport_companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transport_companies_id_seq OWNED BY public.transport_companies.id;


--
-- Name: transport_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transport_types (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    label character varying(100) NOT NULL
);


ALTER TABLE public.transport_types OWNER TO hophop;

--
-- Name: transport_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transport_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transport_types_id_seq OWNER TO hophop;

--
-- Name: transport_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transport_types_id_seq OWNED BY public.transport_types.id;


--
-- Name: trip_fares; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trip_fares (
    id integer NOT NULL,
    trip_id integer NOT NULL,
    fare_category_id integer NOT NULL,
    booking_option_id integer NOT NULL,
    price numeric(10,2) NOT NULL,
    currency character varying(10) NOT NULL,
    seats_available integer NOT NULL
);


ALTER TABLE public.trip_fares OWNER TO hophop;

--
-- Name: trip_fares_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trip_fares_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trip_fares_id_seq OWNER TO hophop;

--
-- Name: trip_fares_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trip_fares_id_seq OWNED BY public.trip_fares.id;


--
-- Name: trips; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trips (
    id integer NOT NULL,
    route_id integer NOT NULL,
    company_id integer NOT NULL,
    transport_type_id integer NOT NULL,
    departure_station_id integer NOT NULL,
    arrival_station_id integer NOT NULL,
    departure_time timestamp without time zone NOT NULL,
    arrival_time timestamp without time zone NOT NULL,
    duration_minutes integer,
    seats_total integer NOT NULL,
    seats_available integer NOT NULL,
    status character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    equipment text,
    cancellation_policy text,
    extra_info text
);


ALTER TABLE public.trips OWNER TO hophop;

--
-- Name: trips_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trips_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trips_id_seq OWNER TO hophop;

--
-- Name: trips_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trips_id_seq OWNED BY public.trips.id;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    id integer NOT NULL,
    user_id integer NOT NULL,
    role_id integer NOT NULL
);


ALTER TABLE public.user_roles OWNER TO hophop;

--
-- Name: user_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_roles_id_seq OWNER TO hophop;

--
-- Name: user_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_roles_id_seq OWNED BY public.user_roles.id;


--
-- Name: user_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_types (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text
);


ALTER TABLE public.user_types OWNER TO hophop;

--
-- Name: user_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_types_id_seq OWNER TO hophop;

--
-- Name: user_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_types_id_seq OWNED BY public.user_types.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    gender character varying(20),
    address character varying(255),
    company_id integer,
    user_type_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    password_hash text
);


ALTER TABLE public.users OWNER TO hophop;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO hophop;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: accounts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts ALTER COLUMN id SET DEFAULT nextval('public.accounts_id_seq'::regclass);


--
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


--
-- Name: booking_options id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_options ALTER COLUMN id SET DEFAULT nextval('public.booking_options_id_seq'::regclass);


--
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- Name: cities id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cities ALTER COLUMN id SET DEFAULT nextval('public.cities_id_seq'::regclass);


--
-- Name: fare_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fare_categories ALTER COLUMN id SET DEFAULT nextval('public.fare_categories_id_seq'::regclass);


--
-- Name: favorites id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites ALTER COLUMN id SET DEFAULT nextval('public.favorites_id_seq'::regclass);


--
-- Name: invoices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices ALTER COLUMN id SET DEFAULT nextval('public.invoices_id_seq'::regclass);


--
-- Name: media id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media ALTER COLUMN id SET DEFAULT nextval('public.media_id_seq'::regclass);


--
-- Name: media_relations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_relations ALTER COLUMN id SET DEFAULT nextval('public.media_relations_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: ratings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ratings ALTER COLUMN id SET DEFAULT nextval('public.ratings_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: route_stops id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_stops ALTER COLUMN id SET DEFAULT nextval('public.route_stops_id_seq'::regclass);


--
-- Name: routes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.routes ALTER COLUMN id SET DEFAULT nextval('public.routes_id_seq'::regclass);


--
-- Name: stations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stations ALTER COLUMN id SET DEFAULT nextval('public.stations_id_seq'::regclass);


--
-- Name: transport_companies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transport_companies ALTER COLUMN id SET DEFAULT nextval('public.transport_companies_id_seq'::regclass);


--
-- Name: transport_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transport_types ALTER COLUMN id SET DEFAULT nextval('public.transport_types_id_seq'::regclass);


--
-- Name: trip_fares id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_fares ALTER COLUMN id SET DEFAULT nextval('public.trip_fares_id_seq'::regclass);


--
-- Name: trips id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips ALTER COLUMN id SET DEFAULT nextval('public.trips_id_seq'::regclass);


--
-- Name: user_roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles ALTER COLUMN id SET DEFAULT nextval('public.user_roles_id_seq'::regclass);


--
-- Name: user_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_types ALTER COLUMN id SET DEFAULT nextval('public.user_types_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accounts (id, user_id, username, password_hash, last_login, access_tokens, created_at) FROM stdin;
\.


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activity_logs (id, user_id, action, entity_type, entity_id, details, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: booking_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.booking_options (id, transport_type_id, code, label, description) FROM stdin;
1	2	DEFAULT	Default	Default booking option
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bookings (id, user_id, trip_id, booking_status, seats_booked, total_price, currency, created_at) FROM stdin;
1	1	1	confirmed	2	20.00	USD	2025-12-14 18:29:14.403809
2	1	1	confirmed	2	20.00	USD	2025-12-14 18:36:06.939585
\.


--
-- Data for Name: cities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cities (id, name, country_code, address, latitude, longitude) FROM stdin;
52	Ï»┘àÏ┤┘é	SY	\N	33.513800	36.276500
53	Ï¡┘äÏ¿	SY	\N	36.202100	37.134300
54	Ï¡┘àÏÁ	SY	\N	34.726800	36.723400
55	Ïº┘ä┘äÏºÏ░┘é┘èÏ®	SY	\N	35.513800	35.779400
56	ÏÀÏ▒ÏÀ┘êÏ│	SY	\N	34.888600	35.886400
57	Ï»┘èÏ▒ Ïº┘äÏ▓┘êÏ▒	SY	\N	35.335400	40.140800
58	Ïº┘äÏ¡Ï│┘âÏ®	SY	\N	36.504700	40.748900
59	Ïº┘äÏ▒┘éÏ®	SY	\N	35.950600	39.009400
60	Ïº┘äÏ│┘ê┘èÏ»ÏºÏí	SY	\N	32.708900	36.569400
61	Ï»Ï▒Ï╣Ïº	SY	\N	32.618900	36.101900
62	ÏÑÏ»┘äÏ¿	SY	\N	35.933300	36.633300
63	Ï¡┘àÏºÏ®	SY	\N	35.131800	36.757800
64	Ïº┘ä┘é┘å┘èÏÀÏ▒Ï®	SY	\N	33.123900	35.824400
65	Ï»┘ê┘àÏº	SY	\N	33.571100	36.402800
66	Ï»ÏºÏ▒┘èÏº	SY	\N	33.458100	36.232200
67	Ïº┘äÏ│┘èÏ»Ï® Ï▓┘è┘åÏ¿	SY	\N	33.444400	36.336100
68	Ïº┘äÏ¬┘ä	SY	\N	33.600000	36.300000
69	Ïº┘äÏ▓Ï¿Ï»Ïº┘å┘è	SY	\N	33.716700	36.100000
70	┘éÏÀ┘åÏº	SY	\N	33.433300	36.116700
71	┘èÏ¿Ï▒┘êÏ»	SY	\N	33.966700	36.666700
72	Ïº┘ä┘åÏ¿┘â	SY	\N	34.016700	36.733300
73	Ïº┘äÏ▓Ïº┘çÏ▒Ï®	SY	\N	33.516700	36.300000
74	Ï¿Ï▒Ï▓Ï®	SY	\N	33.516700	36.283300
75	┘â┘üÏ▒ Ï│┘êÏ│Ï®	SY	\N	33.500000	36.283300
76	Ïº┘ä┘àÏ▓Ï®	SY	\N	33.483300	36.250000
77	Ï¼┘êÏ¿Ï▒	SY	\N	33.533300	36.333300
78	Ïº┘ä┘éÏ»┘à	SY	\N	33.466700	36.300000
79	Ïº┘ä┘à┘èÏ»Ïº┘å	SY	\N	33.450000	36.316700
80	Ïº┘äÏÁÏº┘äÏ¡┘èÏ®	SY	\N	33.483300	36.316700
81	Ï¿ÏºÏ¿ Ï¬┘ê┘àÏº	SY	\N	33.516700	36.316700
82	Ï¿ÏºÏ¿ Ï┤Ï▒┘é┘è	SY	\N	33.516700	36.316700
83	Ïº┘äÏ┤ÏºÏ▒Ï╣ Ïº┘ä┘àÏ│Ï¬┘é┘è┘à	SY	\N	33.516700	36.316700
84	Ï│┘ê┘é Ïº┘äÏ¡┘à┘èÏ»┘èÏ®	SY	\N	33.516700	36.316700
85	Ïº┘ä┘àÏ▒Ï¼Ï®	SY	\N	33.516700	36.316700
86	Ïº┘äÏ╣Ï¿ÏºÏ│┘è┘è┘å	SY	\N	33.516700	36.316700
87	Ïº┘äÏ▒┘â┘å Ïº┘äÏ┤┘àÏº┘ä┘è	SY	\N	33.516700	36.316700
88	Ïº┘äÏ▒┘â┘å Ïº┘äÏ¼┘å┘êÏ¿┘è	SY	\N	33.516700	36.316700
89	Ïº┘äÏ╣Ï»┘ê┘è	SY	\N	33.516700	36.316700
90	Ïº┘ä┘éÏ»Ï│	SY	\N	33.516700	36.316700
91	Ïº┘äÏ▓┘çÏ▒ÏºÏí	SY	\N	33.516700	36.316700
92	Ïº┘äÏ▒┘êÏÂÏ®	SY	\N	33.516700	36.316700
93	Ïº┘ä┘àÏº┘ä┘â┘è	SY	\N	33.516700	36.316700
94	ÏúÏ¿┘ê Ï▒┘àÏº┘åÏ®	SY	\N	33.516700	36.316700
95	┘à┘åÏ¿Ï¼	SY	\N	36.528100	37.955000
96	Ïº┘äÏ¿ÏºÏ¿	SY	\N	36.370600	37.515800
97	Ï╣┘üÏ▒┘è┘å	SY	\N	36.511400	36.866400
98	ÏÑÏ╣Ï▓ÏºÏ▓	SY	\N	36.586100	37.044400
99	Ïº┘äÏ│┘ü┘èÏ▒Ï®	SY	\N	36.066700	37.366700
100	Ï¬┘ä Ï▒┘üÏ╣Ï¬	SY	\N	36.466700	37.100000
101	Ï¼Ï¿┘ä Ï│┘àÏ╣Ïº┘å	SY	\N	36.200000	37.133300
102	Ï╣┘åÏ»Ïº┘å	SY	\N	36.300000	37.050000
103	┘åÏ¿┘ä	SY	\N	36.366700	37.016700
104	Ïº┘äÏ│Ï▒┘èÏº┘å	SY	\N	36.183300	37.166700
105	Ï¬Ï»┘àÏ▒	SY	\N	34.558100	38.273900
106	Ïº┘äÏ▒Ï│Ï¬┘å	SY	\N	34.933300	36.733300
107	Ï¬┘ä┘â┘äÏ«	SY	\N	34.666700	36.250000
108	┘àÏÁ┘èÏº┘ü	SY	\N	35.066700	36.350000
109	Ï┤┘è┘å	SY	\N	34.783300	36.466700
110	Ïº┘ä┘éÏÁ┘èÏ▒	SY	\N	34.516700	36.583300
111	Ïº┘ä┘éÏ»┘à┘êÏ│	SY	\N	34.916700	36.116700
112	Ï¬ÏºÏ»┘à┘êÏ▒	SY	\N	34.558100	38.273900
113	Ï¼Ï¿┘äÏ®	SY	\N	35.366700	35.933300
114	Ï¿Ïº┘å┘èÏºÏ│	SY	\N	35.183300	35.950000
115	ÏÁÏº┘ü┘èÏ¬Ïº	SY	\N	34.816700	36.116700
116	Ïº┘äÏ¡┘üÏ®	SY	\N	35.600000	36.033300
117	┘éÏ▒Ï»ÏºÏ¡Ï®	SY	\N	35.450000	36.000000
118	┘âÏ│Ï¿	SY	\N	35.916700	36.116700
119	Ïº┘äÏ»Ï▒┘è┘â┘èÏ┤	SY	\N	34.900000	36.116700
120	Ïº┘äÏ┤┘èÏ« Ï¿Ï»Ï▒	SY	\N	34.833300	36.050000
121	Ïº┘äÏ¿┘ê┘â┘àÏº┘ä	SY	\N	34.450000	40.916700
122	Ïº┘ä┘à┘èÏºÏ»┘è┘å	SY	\N	34.450000	40.783300
123	ÏúÏ¿┘ê ┘â┘àÏº┘ä	SY	\N	34.450000	40.916700
124	Ïº┘ä┘éÏº┘àÏ┤┘ä┘è	SY	\N	37.051100	41.229400
125	Ï▒ÏúÏ│ Ïº┘äÏ╣┘è┘å	SY	\N	36.850000	40.066700
126	Ïº┘ä┘àÏº┘ä┘â┘èÏ®	SY	\N	37.166700	42.133300
127	Ï╣Ïº┘à┘êÏ»Ïº	SY	\N	37.000000	41.016700
128	Ï»┘èÏ▒┘è┘â	SY	\N	37.050000	42.200000
129	Ï¬┘ä Ï¬┘àÏ▒	SY	\N	36.650000	40.366700
130	Ï┤Ï»Ï»┘è	SY	\N	36.816700	40.516700
131	Ï╣┘è┘å Ïº┘äÏ╣Ï▒Ï¿	SY	\N	36.816700	38.016700
132	Ïº┘äÏÀÏ¿┘éÏ®	SY	\N	35.833300	38.550000
133	Ï┤┘çÏ¿Ïº	SY	\N	32.850000	36.566700
134	ÏÁ┘äÏ«Ï»	SY	\N	32.483300	36.716700
135	Ï¿ÏÁÏ▒┘ë	SY	\N	32.516700	36.483300
136	ÏÑÏ▓Ï▒Ï╣	SY	\N	32.866700	36.250000
137	┘å┘ê┘ë	SY	\N	32.883300	36.033300
138	ÏÀ┘üÏ│	SY	\N	32.733300	36.066700
139	Ïº┘äÏ┤┘èÏ« ┘àÏ│┘â┘è┘å	SY	\N	32.816700	36.150000
140	Ï¼ÏºÏ│┘à	SY	\N	32.783300	36.050000
141	ÏÑ┘åÏ«┘ä	SY	\N	32.750000	36.016700
142	Ï»ÏºÏ╣┘ä	SY	\N	32.816700	36.083300
143	┘àÏ╣Ï▒Ï® Ïº┘ä┘åÏ╣┘àÏº┘å	SY	\N	35.633300	36.683300
144	Ï¼Ï│Ï▒ Ïº┘äÏ┤Ï║┘êÏ▒	SY	\N	35.816700	36.316700
145	ÏúÏ▒┘èÏ¡Ïº	SY	\N	35.816700	36.600000
146	┘â┘üÏ▒ Ï¬Ï«ÏºÏ▒┘è┘à	SY	\N	36.116700	36.516700
147	Ï¡ÏºÏ▒┘à	SY	\N	36.200000	36.516700
148	Ï│Ï▒┘à┘è┘å	SY	\N	35.866700	36.716700
149	Ï¿┘è┘åÏ┤	SY	\N	35.816700	36.633300
150	Ïº┘äÏ»Ïº┘åÏº	SY	\N	35.766700	36.783300
151	Ïº┘äÏ│┘ä┘à┘èÏ®	SY	\N	35.016700	37.050000
152	┘àÏ¡Ï▒Ï»Ï®	SY	\N	35.250000	36.566700
153	┘â┘üÏ▒ Ï▓┘èÏ¬Ïº	SY	\N	35.116700	36.600000
154	Ïº┘ä┘äÏÀÏº┘à┘åÏ®	SY	\N	35.083300	36.500000
155	┘à┘êÏ▒┘â	SY	\N	35.200000	36.683300
156	┘â┘üÏ▒ ┘åÏ¿┘êÏ»Ï®	SY	\N	35.133300	36.550000
7	Damascus	SY	\N	\N	\N
8	Rif Dimashq	SY	\N	\N	\N
9	Aleppo	SY	\N	\N	\N
10	Homs	SY	\N	\N	\N
11	Hama	SY	\N	\N	\N
12	Latakia	SY	\N	\N	\N
13	Tartus	SY	\N	\N	\N
14	Idlib	SY	\N	\N	\N
15	Deir ez-Zor	SY	\N	\N	\N
16	Raqqa	SY	\N	\N	\N
17	Hasakah	SY	\N	\N	\N
18	Qamishli	SY	\N	\N	\N
19	Daraa	SY	\N	\N	\N
20	As-Suwayda	SY	\N	\N	\N
21	Quneitra	SY	\N	\N	\N
22	Palmyra	SY	\N	\N	\N
23	Al-Bab	SY	\N	\N	\N
24	Manbij	SY	\N	\N	\N
25	Afrin	SY	\N	\N	\N
26	Kobani	SY	\N	\N	\N
27	Al-Mayadin	SY	\N	\N	\N
28	Al-Bukamal	SY	\N	\N	\N
29	Salamiyah	SY	\N	\N	\N
30	Jableh	SY	\N	\N	\N
31	Baniyas	SY	\N	\N	\N
32	Safita	SY	\N	\N	\N
33	Tal Kalakh	SY	\N	\N	\N
34	Masyaf	SY	\N	\N	\N
35	Al-Qusayr	SY	\N	\N	\N
36	Douma	SY	\N	\N	\N
37	Harasta	SY	\N	\N	\N
38	Zabadani	SY	\N	\N	\N
39	Al-Nabek	SY	\N	\N	\N
40	Yabroud	SY	\N	\N	\N
41	Al-Tall	SY	\N	\N	\N
42	Qatana	SY	\N	\N	\N
43	Darayya	SY	\N	\N	\N
44	Al-Tanam	SY	\N	\N	\N
45	Al-Hajar al-Aswad	SY	\N	\N	\N
46	Sahnaya	SY	\N	\N	\N
47	Kafr Batna	SY	\N	\N	\N
48	Jaramana	SY	\N	\N	\N
49	Damascus	SY	\N	\N	\N
50	Homs	SY	\N	\N	\N
51	Aleppo	SY	\N	\N	\N
\.


--
-- Data for Name: fare_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fare_categories (id, code, label, description, is_extra) FROM stdin;
2	STANDARD	Standard	\N	f
\.


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.favorites (id, user_id, trip_id, created_at) FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (id, booking_id, invoice_number, issue_date, due_date, amount, currency, status, payment_method, payment_date, created_at) FROM stdin;
\.


--
-- Data for Name: media; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.media (id, file_url, mime_type, tag, uploaded_by_user_id, created_at) FROM stdin;
\.


--
-- Data for Name: media_relations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.media_relations (id, media_id, entity_type, entity_id, is_primary) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, type, title, message, related_entity_type, related_entity_id, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: ratings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ratings (id, user_id, transport_company_id, punctuality_rating, friendliness_rating, cleanliness_rating, comment, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, user_id, trip_id, transport_company_id, rating_id, comment, is_approved, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, description) FROM stdin;
1	ADMIN	Full access
2	AGENT	Manage trips and fares
3	USER	Standard user
4	Administrator	Full admin access
5	Agent	Company agent access
6	User	Regular user access
\.


--
-- Data for Name: route_stops; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.route_stops (id, route_id, station_id, stop_order, arrival_time, departure_time, created_at) FROM stdin;
\.


--
-- Data for Name: routes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.routes (id, from_city_id, to_city_id) FROM stdin;
5	7	10
6	7	50
7	49	10
8	49	50
9	7	9
10	7	51
11	49	9
12	49	51
\.


--
-- Data for Name: stations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stations (id, city_id, name, address, latitude, longitude) FROM stdin;
7	7	Damascus Central Station	\N	\N	\N
8	8	Rif Dimashq Central Station	\N	\N	\N
9	9	Aleppo Central Station	\N	\N	\N
10	10	Homs Central Station	\N	\N	\N
11	11	Hama Central Station	\N	\N	\N
12	12	Latakia Central Station	\N	\N	\N
13	13	Tartus Central Station	\N	\N	\N
14	14	Idlib Central Station	\N	\N	\N
15	15	Deir ez-Zor Central Station	\N	\N	\N
16	16	Raqqa Central Station	\N	\N	\N
17	17	Hasakah Central Station	\N	\N	\N
18	18	Qamishli Central Station	\N	\N	\N
19	19	Daraa Central Station	\N	\N	\N
20	20	As-Suwayda Central Station	\N	\N	\N
21	21	Quneitra Central Station	\N	\N	\N
22	22	Palmyra Central Station	\N	\N	\N
23	23	Al-Bab Central Station	\N	\N	\N
24	24	Manbij Central Station	\N	\N	\N
25	25	Afrin Central Station	\N	\N	\N
26	26	Kobani Central Station	\N	\N	\N
27	27	Al-Mayadin Central Station	\N	\N	\N
28	28	Al-Bukamal Central Station	\N	\N	\N
29	29	Salamiyah Central Station	\N	\N	\N
30	30	Jableh Central Station	\N	\N	\N
31	31	Baniyas Central Station	\N	\N	\N
32	32	Safita Central Station	\N	\N	\N
33	33	Tal Kalakh Central Station	\N	\N	\N
34	34	Masyaf Central Station	\N	\N	\N
35	35	Al-Qusayr Central Station	\N	\N	\N
36	36	Douma Central Station	\N	\N	\N
37	37	Harasta Central Station	\N	\N	\N
38	38	Zabadani Central Station	\N	\N	\N
39	39	Al-Nabek Central Station	\N	\N	\N
40	40	Yabroud Central Station	\N	\N	\N
41	41	Al-Tall Central Station	\N	\N	\N
42	42	Qatana Central Station	\N	\N	\N
43	43	Darayya Central Station	\N	\N	\N
44	44	Al-Tanam Central Station	\N	\N	\N
45	45	Al-Hajar al-Aswad Central Station	\N	\N	\N
46	46	Sahnaya Central Station	\N	\N	\N
47	47	Kafr Batna Central Station	\N	\N	\N
48	48	Jaramana Central Station	\N	\N	\N
49	49	Damascus Central Station	\N	\N	\N
50	50	Homs Central Station	\N	\N	\N
51	51	Aleppo Central Station	\N	\N	\N
\.


--
-- Data for Name: transport_companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transport_companies (id, name, logo_url, description, address, phone, cr_number, is_active, created_at) FROM stdin;
1	HopHop Transport	\N	\N	\N	\N	\N	t	2025-12-14 17:50:20.475619
\.


--
-- Data for Name: transport_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transport_types (id, code, label) FROM stdin;
2	BUS	Bus
\.


--
-- Data for Name: trip_fares; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trip_fares (id, trip_id, fare_category_id, booking_option_id, price, currency, seats_available) FROM stdin;
2	3	2	1	10.00	USD	40
3	7	2	1	10.00	USD	40
4	6	2	1	10.00	USD	40
5	2	2	1	10.00	USD	40
6	4	2	1	10.00	USD	40
8	5	2	1	10.00	USD	40
9	1	2	1	10.00	USD	38
\.


--
-- Data for Name: trips; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trips (id, route_id, company_id, transport_type_id, departure_station_id, arrival_station_id, departure_time, arrival_time, duration_minutes, seats_total, seats_available, status, is_active, equipment, cancellation_policy, extra_info) FROM stdin;
2	6	1	2	7	50	2025-12-20 08:00:00	2025-12-20 10:00:00	120	40	40	scheduled	t	\N	\N	\N
3	7	1	2	49	10	2025-12-20 08:00:00	2025-12-20 10:00:00	120	40	40	scheduled	t	\N	\N	\N
4	8	1	2	49	50	2025-12-20 08:00:00	2025-12-20 10:00:00	120	40	40	scheduled	t	\N	\N	\N
5	9	1	2	7	9	2025-12-20 08:00:00	2025-12-20 10:00:00	120	40	40	scheduled	t	\N	\N	\N
6	10	1	2	7	51	2025-12-20 08:00:00	2025-12-20 10:00:00	120	40	40	scheduled	t	\N	\N	\N
7	11	1	2	49	9	2025-12-20 08:00:00	2025-12-20 10:00:00	120	40	40	scheduled	t	\N	\N	\N
1	5	1	2	7	10	2025-12-20 08:00:00	2025-12-20 10:00:00	120	40	36	scheduled	t	\N	\N	\N
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (id, user_id, role_id) FROM stdin;
1	4	4
2	5	5
3	6	6
\.


--
-- Data for Name: user_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_types (id, code, name, description) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, phone, is_active, first_name, last_name, gender, address, company_id, user_type_id, created_at, password_hash) FROM stdin;
1	console2@test.com	\N	t	Console	Test	\N	\N	\N	\N	2025-12-14 16:36:14.613423	$2b$10$upC6HTtwzRm1zTTe8dWuUuSmFvNNYoAvMY264GH0/jjtz5wvNLnYy
2	monamarashli@gmail.com	\N	t	\N	\N	\N	\N	\N	\N	2025-12-14 21:08:16.764495	$2b$10$mBNO564xZNjo/QWoGQjJsu9oMkd10Ix4uGsdrYoIFsSDvh94TQsGG
4	admin@test.com	+963123456789	t	Admin	User	male	\N	\N	\N	2025-12-16 14:39:29.812011	$2b$10$znN0zF2qsYzJAyJmMPHaTuXQKTHO5WeoMtPggr4TO8nC2/W8xIF7a
5	agent@test.com	+963987654321	t	Agent	Company	male	\N	\N	\N	2025-12-16 14:39:29.853381	$2b$10$UNJIuGSZVwVfRmyoezVRROLEm91MmFJKgF6ck0JVdyrFy.08j36pK
6	user@test.com	+963555123456	t	Test	User	female	\N	\N	\N	2025-12-16 14:39:29.857346	$2b$10$7NGjOvNSi4MaERnFGnXty.6lTYde5dNXZirC1MvV5p4Z5UCDrt23i
\.


--
-- Name: accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.accounts_id_seq', 1, false);


--
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 1, false);


--
-- Name: booking_options_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.booking_options_id_seq', 1, true);


--
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bookings_id_seq', 2, true);


--
-- Name: cities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cities_id_seq', 156, true);


--
-- Name: fare_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.fare_categories_id_seq', 3, true);


--
-- Name: favorites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.favorites_id_seq', 1, false);


--
-- Name: invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.invoices_id_seq', 1, false);


--
-- Name: media_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.media_id_seq', 1, false);


--
-- Name: media_relations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.media_relations_id_seq', 1, false);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: ratings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ratings_id_seq', 1, false);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 6, true);


--
-- Name: route_stops_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.route_stops_id_seq', 1, false);


--
-- Name: routes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.routes_id_seq', 12, true);


--
-- Name: stations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stations_id_seq', 51, true);


--
-- Name: transport_companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transport_companies_id_seq', 1, true);


--
-- Name: transport_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transport_types_id_seq', 2, true);


--
-- Name: trip_fares_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trip_fares_id_seq', 9, true);


--
-- Name: trips_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trips_id_seq', 8, true);


--
-- Name: user_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_roles_id_seq', 3, true);


--
-- Name: user_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_types_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: accounts accounts_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_username_key UNIQUE (username);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: booking_options booking_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_options
    ADD CONSTRAINT booking_options_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: cities cities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_pkey PRIMARY KEY (id);


--
-- Name: fare_categories fare_categories_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fare_categories
    ADD CONSTRAINT fare_categories_code_key UNIQUE (code);


--
-- Name: fare_categories fare_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fare_categories
    ADD CONSTRAINT fare_categories_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_user_id_trip_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_trip_id_key UNIQUE (user_id, trip_id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: media media_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (id);


--
-- Name: media_relations media_relations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_relations
    ADD CONSTRAINT media_relations_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: ratings ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_pkey PRIMARY KEY (id);


--
-- Name: ratings ratings_user_id_transport_company_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_user_id_transport_company_id_key UNIQUE (user_id, transport_company_id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: route_stops route_stops_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_stops
    ADD CONSTRAINT route_stops_pkey PRIMARY KEY (id);


--
-- Name: route_stops route_stops_route_id_stop_order_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_stops
    ADD CONSTRAINT route_stops_route_id_stop_order_key UNIQUE (route_id, stop_order);


--
-- Name: routes routes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.routes
    ADD CONSTRAINT routes_pkey PRIMARY KEY (id);


--
-- Name: stations stations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stations
    ADD CONSTRAINT stations_pkey PRIMARY KEY (id);


--
-- Name: transport_companies transport_companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transport_companies
    ADD CONSTRAINT transport_companies_pkey PRIMARY KEY (id);


--
-- Name: transport_types transport_types_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transport_types
    ADD CONSTRAINT transport_types_code_key UNIQUE (code);


--
-- Name: transport_types transport_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transport_types
    ADD CONSTRAINT transport_types_pkey PRIMARY KEY (id);


--
-- Name: trip_fares trip_fares_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_fares
    ADD CONSTRAINT trip_fares_pkey PRIMARY KEY (id);


--
-- Name: trips trips_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_types user_types_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_types
    ADD CONSTRAINT user_types_code_key UNIQUE (code);


--
-- Name: user_types user_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_types
    ADD CONSTRAINT user_types_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_activity_logs_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activity_logs_created_at ON public.activity_logs USING btree (created_at DESC);


--
-- Name: idx_activity_logs_entity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activity_logs_entity ON public.activity_logs USING btree (entity_type, entity_id);


--
-- Name: idx_activity_logs_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activity_logs_user_id ON public.activity_logs USING btree (user_id);


--
-- Name: idx_favorites_trip_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_favorites_trip_id ON public.favorites USING btree (trip_id);


--
-- Name: idx_favorites_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_favorites_user_id ON public.favorites USING btree (user_id);


--
-- Name: idx_notifications_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at DESC);


--
-- Name: idx_notifications_is_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_is_read ON public.notifications USING btree (is_read);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- Name: idx_ratings_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ratings_company_id ON public.ratings USING btree (transport_company_id);


--
-- Name: idx_ratings_transport_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ratings_transport_company_id ON public.ratings USING btree (transport_company_id);


--
-- Name: idx_ratings_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ratings_user_id ON public.ratings USING btree (user_id);


--
-- Name: idx_reviews_transport_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_transport_company_id ON public.reviews USING btree (transport_company_id);


--
-- Name: idx_reviews_trip_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_trip_id ON public.reviews USING btree (trip_id);


--
-- Name: idx_reviews_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_user_id ON public.reviews USING btree (user_id);


--
-- Name: idx_route_stops_route_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_route_stops_route_id ON public.route_stops USING btree (route_id);


--
-- Name: idx_route_stops_station_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_route_stops_station_id ON public.route_stops USING btree (station_id);


--
-- Name: ratings update_ratings_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON public.ratings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: reviews update_reviews_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: activity_logs activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: favorites favorites_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;


--
-- Name: favorites favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: accounts fk_accounts_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT fk_accounts_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: booking_options fk_booking_options_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_options
    ADD CONSTRAINT fk_booking_options_type FOREIGN KEY (transport_type_id) REFERENCES public.transport_types(id);


--
-- Name: bookings fk_bookings_trip; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT fk_bookings_trip FOREIGN KEY (trip_id) REFERENCES public.trips(id);


--
-- Name: bookings fk_bookings_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: invoices fk_invoices_booking; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT fk_invoices_booking FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: media_relations fk_media_relations_media; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_relations
    ADD CONSTRAINT fk_media_relations_media FOREIGN KEY (media_id) REFERENCES public.media(id) ON DELETE CASCADE;


--
-- Name: media fk_media_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT fk_media_user FOREIGN KEY (uploaded_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: routes fk_routes_from_city; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.routes
    ADD CONSTRAINT fk_routes_from_city FOREIGN KEY (from_city_id) REFERENCES public.cities(id);


--
-- Name: routes fk_routes_to_city; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.routes
    ADD CONSTRAINT fk_routes_to_city FOREIGN KEY (to_city_id) REFERENCES public.cities(id);


--
-- Name: stations fk_stations_city; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stations
    ADD CONSTRAINT fk_stations_city FOREIGN KEY (city_id) REFERENCES public.cities(id);


--
-- Name: trip_fares fk_trip_fares_category; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_fares
    ADD CONSTRAINT fk_trip_fares_category FOREIGN KEY (fare_category_id) REFERENCES public.fare_categories(id);


--
-- Name: trip_fares fk_trip_fares_option; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_fares
    ADD CONSTRAINT fk_trip_fares_option FOREIGN KEY (booking_option_id) REFERENCES public.booking_options(id);


--
-- Name: trip_fares fk_trip_fares_trip; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_fares
    ADD CONSTRAINT fk_trip_fares_trip FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;


--
-- Name: trips fk_trips_arrival_station; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT fk_trips_arrival_station FOREIGN KEY (arrival_station_id) REFERENCES public.stations(id);


--
-- Name: trips fk_trips_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT fk_trips_company FOREIGN KEY (company_id) REFERENCES public.transport_companies(id);


--
-- Name: trips fk_trips_departure_station; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT fk_trips_departure_station FOREIGN KEY (departure_station_id) REFERENCES public.stations(id);


--
-- Name: trips fk_trips_route; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT fk_trips_route FOREIGN KEY (route_id) REFERENCES public.routes(id);


--
-- Name: trips fk_trips_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT fk_trips_type FOREIGN KEY (transport_type_id) REFERENCES public.transport_types(id);


--
-- Name: user_roles fk_user_roles_role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_roles fk_user_roles_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users fk_users_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_company FOREIGN KEY (company_id) REFERENCES public.transport_companies(id);


--
-- Name: users fk_users_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_type FOREIGN KEY (user_type_id) REFERENCES public.user_types(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ratings ratings_transport_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_transport_company_id_fkey FOREIGN KEY (transport_company_id) REFERENCES public.transport_companies(id) ON DELETE CASCADE;


--
-- Name: ratings ratings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_rating_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_rating_id_fkey FOREIGN KEY (rating_id) REFERENCES public.ratings(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_transport_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_transport_company_id_fkey FOREIGN KEY (transport_company_id) REFERENCES public.transport_companies(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: route_stops route_stops_route_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_stops
    ADD CONSTRAINT route_stops_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.routes(id) ON DELETE CASCADE;


--
-- Name: route_stops route_stops_station_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_stops
    ADD CONSTRAINT route_stops_station_id_fkey FOREIGN KEY (station_id) REFERENCES public.stations(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


