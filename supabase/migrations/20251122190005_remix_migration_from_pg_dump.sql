CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'renter',
    'landlord',
    'admin'
);


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;


--
-- Name: update_property_inquiries_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_property_inquiries_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: agreements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agreements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    property_id uuid NOT NULL,
    landlord_id uuid NOT NULL,
    tenant_user_id uuid,
    tenant_group_id uuid,
    status text DEFAULT 'pending_email_confirmation'::text,
    landlord_confirmed boolean DEFAULT false,
    tenant_confirmed boolean DEFAULT false,
    rent_amount numeric NOT NULL,
    move_in_date date,
    lease_term_months integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT agreements_status_check CHECK ((status = ANY (ARRAY['pending_email_confirmation'::text, 'confirmed'::text, 'cancelled'::text])))
);


--
-- Name: applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.applications (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    group_id uuid,
    property_id uuid,
    status text DEFAULT 'pending'::text,
    message text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT applications_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'withdrawn'::text])))
);


--
-- Name: cities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    state_id uuid NOT NULL,
    city_name text NOT NULL,
    lat numeric,
    lng numeric,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: compatibility_scores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.compatibility_scores (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id_1 uuid,
    user_id_2 uuid,
    overall_score integer,
    budget_score integer,
    lifestyle_score integer,
    schedule_score integer,
    social_score integer,
    calculated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT compatibility_scores_check CHECK ((user_id_1 < user_id_2)),
    CONSTRAINT compatibility_scores_overall_score_check CHECK (((overall_score >= 0) AND (overall_score <= 100)))
);


--
-- Name: external_listings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.external_listings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    external_id text NOT NULL,
    source text NOT NULL,
    data jsonb NOT NULL,
    city text,
    rent_amount integer,
    bedrooms integer,
    cached_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone DEFAULT (now() + '24:00:00'::interval)
);


--
-- Name: favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.favorites (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    property_id uuid,
    external_listing_id uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: group_listings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_listings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    group_id uuid NOT NULL,
    property_id uuid NOT NULL,
    added_by_user_id uuid NOT NULL,
    note text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: group_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_members (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    group_id uuid,
    user_id uuid,
    joined_at timestamp with time zone DEFAULT now(),
    status text DEFAULT 'active'::text,
    CONSTRAINT group_members_status_check CHECK ((status = ANY (ARRAY['invited'::text, 'active'::text, 'left'::text])))
);


--
-- Name: groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.groups (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    creator_id uuid,
    description text,
    target_move_in_date date,
    combined_budget_max integer,
    preferred_cities text[],
    is_complete boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: income_verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.income_verifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    status text DEFAULT 'pending'::text,
    verified_monthly_income numeric,
    source text,
    document_urls text[],
    admin_notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT income_verifications_source_check CHECK ((source = ANY (ARRAY['documents'::text, 'plaid'::text, 'payroll'::text]))),
    CONSTRAINT income_verifications_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])))
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    sender_id uuid,
    recipient_id uuid,
    group_id uuid,
    content text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT messages_check CHECK ((((recipient_id IS NOT NULL) AND (group_id IS NULL)) OR ((recipient_id IS NULL) AND (group_id IS NOT NULL))))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    full_name text,
    phone text,
    date_of_birth date,
    profile_photo_url text,
    bio text,
    occupation text,
    budget_min integer,
    budget_max integer,
    preferred_cities text[],
    move_in_date date,
    lease_duration_months integer,
    sleep_schedule text,
    cleanliness_level integer,
    noise_tolerance integer,
    guest_frequency text,
    smoking text,
    pets text,
    social_preference text,
    work_from_home boolean DEFAULT false,
    id_verified boolean DEFAULT false,
    income_verified boolean DEFAULT false,
    background_check_status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    subscription_status text DEFAULT 'trialing'::text,
    trial_start timestamp with time zone DEFAULT now(),
    trial_end timestamp with time zone DEFAULT (now() + '3 days'::interval),
    subscription_start timestamp with time zone,
    phone_verified boolean DEFAULT false,
    landlord_verified boolean DEFAULT false,
    avatar_url text,
    is_public_profile boolean DEFAULT false,
    income_verified_source text,
    self_reported_monthly_income numeric,
    tenant_subscription_active boolean DEFAULT false,
    landlord_subscription_active boolean DEFAULT false,
    CONSTRAINT profiles_background_check_status_check CHECK ((background_check_status = ANY (ARRAY['pending'::text, 'verified'::text, 'failed'::text]))),
    CONSTRAINT profiles_cleanliness_level_check CHECK (((cleanliness_level >= 1) AND (cleanliness_level <= 5))),
    CONSTRAINT profiles_guest_frequency_check CHECK ((guest_frequency = ANY (ARRAY['rarely'::text, 'occasionally'::text, 'frequently'::text]))),
    CONSTRAINT profiles_noise_tolerance_check CHECK (((noise_tolerance >= 1) AND (noise_tolerance <= 5))),
    CONSTRAINT profiles_pets_check CHECK ((pets = ANY (ARRAY['no_pets'::text, 'has_cats'::text, 'has_dogs'::text, 'has_other'::text]))),
    CONSTRAINT profiles_sleep_schedule_check CHECK ((sleep_schedule = ANY (ARRAY['early_bird'::text, 'night_owl'::text, 'flexible'::text]))),
    CONSTRAINT profiles_smoking_check CHECK ((smoking = ANY (ARRAY['non_smoker'::text, 'outside_only'::text, 'smoker'::text]))),
    CONSTRAINT profiles_social_preference_check CHECK ((social_preference = ANY (ARRAY['very_social'::text, 'moderately_social'::text, 'private'::text])))
);


--
-- Name: properties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.properties (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    landlord_id uuid,
    title text NOT NULL,
    description text,
    address text NOT NULL,
    city text NOT NULL,
    state text,
    zip_code text,
    rent_amount integer NOT NULL,
    security_deposit integer,
    available_rooms integer NOT NULL,
    total_bedrooms integer NOT NULL,
    total_bathrooms numeric(3,1),
    square_feet integer,
    smoking_allowed boolean DEFAULT false,
    pets_allowed boolean DEFAULT false,
    quiet_hours_start time without time zone,
    quiet_hours_end time without time zone,
    minimum_income_multiplier numeric(3,1) DEFAULT 3.0,
    photos text[],
    available_from date,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    listing_type text DEFAULT 'internal'::text,
    amenities text[],
    lease_duration_months integer,
    utilities_included boolean DEFAULT false,
    neighborhood text,
    lat numeric,
    lng numeric,
    property_type text DEFAULT 'apartment'::text,
    furnished boolean DEFAULT false,
    parking text,
    lease_term_months_min integer,
    lease_term_months_max integer,
    min_household_income_monthly numeric,
    max_occupants integer,
    status text DEFAULT 'active'::text,
    views_count integer DEFAULT 0,
    use_platform_payments boolean DEFAULT false,
    street_address text,
    postal_code text,
    country text DEFAULT 'USA'::text,
    listing_source text DEFAULT 'Manual'::text,
    external_listing_url text,
    rent_total numeric
);


--
-- Name: property_inquiries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.property_inquiries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    property_id uuid NOT NULL,
    user_id uuid,
    group_id uuid,
    message text NOT NULL,
    status text DEFAULT 'new'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: property_photos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.property_photos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    property_id uuid NOT NULL,
    url text NOT NULL,
    "position" integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: saved_listings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saved_listings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    property_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: states; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.states (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    country text NOT NULL,
    state_code text NOT NULL,
    state_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT states_country_check CHECK ((country = ANY (ARRAY['US'::text, 'CA'::text])))
);


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    subscription_type text NOT NULL,
    stripe_subscription_id text,
    stripe_customer_id text,
    status text DEFAULT 'trialing'::text,
    trial_ends_at timestamp with time zone,
    current_period_end timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT subscriptions_status_check CHECK ((status = ANY (ARRAY['trialing'::text, 'active'::text, 'cancelled'::text, 'past_due'::text]))),
    CONSTRAINT subscriptions_subscription_type_check CHECK ((subscription_type = ANY (ARRAY['tenant'::text, 'landlord'::text])))
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.verifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    verification_type text NOT NULL,
    status text DEFAULT 'pending'::text,
    confidence_score integer,
    document_urls text[],
    verified_data jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: agreements agreements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreements
    ADD CONSTRAINT agreements_pkey PRIMARY KEY (id);


--
-- Name: applications applications_group_id_property_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_group_id_property_id_key UNIQUE (group_id, property_id);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: cities cities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_pkey PRIMARY KEY (id);


--
-- Name: compatibility_scores compatibility_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compatibility_scores
    ADD CONSTRAINT compatibility_scores_pkey PRIMARY KEY (id);


--
-- Name: compatibility_scores compatibility_scores_user_id_1_user_id_2_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compatibility_scores
    ADD CONSTRAINT compatibility_scores_user_id_1_user_id_2_key UNIQUE (user_id_1, user_id_2);


--
-- Name: external_listings external_listings_external_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.external_listings
    ADD CONSTRAINT external_listings_external_id_key UNIQUE (external_id);


--
-- Name: external_listings external_listings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.external_listings
    ADD CONSTRAINT external_listings_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_user_id_external_listing_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_external_listing_id_key UNIQUE (user_id, external_listing_id);


--
-- Name: favorites favorites_user_id_property_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_property_id_key UNIQUE (user_id, property_id);


--
-- Name: group_listings group_listings_group_id_property_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_listings
    ADD CONSTRAINT group_listings_group_id_property_id_key UNIQUE (group_id, property_id);


--
-- Name: group_listings group_listings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_listings
    ADD CONSTRAINT group_listings_pkey PRIMARY KEY (id);


--
-- Name: group_members group_members_group_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_group_id_user_id_key UNIQUE (group_id, user_id);


--
-- Name: group_members group_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_pkey PRIMARY KEY (id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: income_verifications income_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.income_verifications
    ADD CONSTRAINT income_verifications_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: properties properties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_pkey PRIMARY KEY (id);


--
-- Name: property_inquiries property_inquiries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_inquiries
    ADD CONSTRAINT property_inquiries_pkey PRIMARY KEY (id);


--
-- Name: property_photos property_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_photos
    ADD CONSTRAINT property_photos_pkey PRIMARY KEY (id);


--
-- Name: saved_listings saved_listings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_listings
    ADD CONSTRAINT saved_listings_pkey PRIMARY KEY (id);


--
-- Name: saved_listings saved_listings_user_id_property_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_listings
    ADD CONSTRAINT saved_listings_user_id_property_id_key UNIQUE (user_id, property_id);


--
-- Name: states states_country_state_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.states
    ADD CONSTRAINT states_country_state_code_key UNIQUE (country, state_code);


--
-- Name: states states_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.states
    ADD CONSTRAINT states_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_user_id_subscription_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_subscription_type_key UNIQUE (user_id, subscription_type);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: verifications verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verifications
    ADD CONSTRAINT verifications_pkey PRIMARY KEY (id);


--
-- Name: verifications verifications_user_id_verification_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verifications
    ADD CONSTRAINT verifications_user_id_verification_type_key UNIQUE (user_id, verification_type);


--
-- Name: idx_cities_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cities_name ON public.cities USING btree (city_name);


--
-- Name: idx_cities_state_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cities_state_id ON public.cities USING btree (state_id);


--
-- Name: idx_compatibility_users; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_compatibility_users ON public.compatibility_scores USING btree (user_id_1, user_id_2);


--
-- Name: idx_external_listings_city; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_external_listings_city ON public.external_listings USING btree (city);


--
-- Name: idx_external_listings_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_external_listings_expires ON public.external_listings USING btree (expires_at);


--
-- Name: idx_favorites_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_favorites_user_id ON public.favorites USING btree (user_id);


--
-- Name: idx_group_listings_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_group_listings_group_id ON public.group_listings USING btree (group_id);


--
-- Name: idx_group_members_group; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_group_members_group ON public.group_members USING btree (group_id);


--
-- Name: idx_group_members_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_group_members_user ON public.group_members USING btree (user_id);


--
-- Name: idx_messages_group; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_group ON public.messages USING btree (group_id, created_at DESC);


--
-- Name: idx_messages_recipient; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_recipient ON public.messages USING btree (recipient_id, created_at DESC);


--
-- Name: idx_profiles_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_active ON public.profiles USING btree (is_active);


--
-- Name: idx_properties_active_city; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_properties_active_city ON public.properties USING btree (is_active, city);


--
-- Name: idx_property_inquiries_property_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_property_inquiries_property_id ON public.property_inquiries USING btree (property_id);


--
-- Name: idx_property_photos_property_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_property_photos_property_id ON public.property_photos USING btree (property_id);


--
-- Name: idx_saved_listings_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_saved_listings_user_id ON public.saved_listings USING btree (user_id);


--
-- Name: idx_user_roles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_roles_user_id ON public.user_roles USING btree (user_id);


--
-- Name: idx_verifications_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_verifications_status ON public.verifications USING btree (status);


--
-- Name: idx_verifications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_verifications_user_id ON public.verifications USING btree (user_id);


--
-- Name: property_inquiries property_inquiries_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER property_inquiries_updated_at BEFORE UPDATE ON public.property_inquiries FOR EACH ROW EXECUTE FUNCTION public.update_property_inquiries_updated_at();


--
-- Name: agreements update_agreements_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_agreements_updated_at BEFORE UPDATE ON public.agreements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: applications update_applications_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: groups update_groups_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON public.groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: income_verifications update_income_verifications_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_income_verifications_updated_at BEFORE UPDATE ON public.income_verifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: properties update_properties_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subscriptions update_subscriptions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: verifications update_verifications_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_verifications_updated_at BEFORE UPDATE ON public.verifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: agreements agreements_landlord_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreements
    ADD CONSTRAINT agreements_landlord_id_fkey FOREIGN KEY (landlord_id) REFERENCES auth.users(id);


--
-- Name: agreements agreements_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreements
    ADD CONSTRAINT agreements_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: agreements agreements_tenant_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreements
    ADD CONSTRAINT agreements_tenant_group_id_fkey FOREIGN KEY (tenant_group_id) REFERENCES public.groups(id);


--
-- Name: agreements agreements_tenant_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreements
    ADD CONSTRAINT agreements_tenant_user_id_fkey FOREIGN KEY (tenant_user_id) REFERENCES auth.users(id);


--
-- Name: applications applications_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: applications applications_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: cities cities_state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_state_id_fkey FOREIGN KEY (state_id) REFERENCES public.states(id) ON DELETE CASCADE;


--
-- Name: compatibility_scores compatibility_scores_user_id_1_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compatibility_scores
    ADD CONSTRAINT compatibility_scores_user_id_1_fkey FOREIGN KEY (user_id_1) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: compatibility_scores compatibility_scores_user_id_2_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compatibility_scores
    ADD CONSTRAINT compatibility_scores_user_id_2_fkey FOREIGN KEY (user_id_2) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: favorites favorites_external_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_external_listing_id_fkey FOREIGN KEY (external_listing_id) REFERENCES public.external_listings(id) ON DELETE CASCADE;


--
-- Name: favorites favorites_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: favorites favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: group_listings group_listings_added_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_listings
    ADD CONSTRAINT group_listings_added_by_user_id_fkey FOREIGN KEY (added_by_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: group_listings group_listings_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_listings
    ADD CONSTRAINT group_listings_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: group_listings group_listings_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_listings
    ADD CONSTRAINT group_listings_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: group_members group_members_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: group_members group_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: groups groups_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: income_verifications income_verifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.income_verifications
    ADD CONSTRAINT income_verifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: messages messages_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: properties properties_landlord_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_landlord_id_fkey FOREIGN KEY (landlord_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: property_inquiries property_inquiries_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_inquiries
    ADD CONSTRAINT property_inquiries_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: property_inquiries property_inquiries_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_inquiries
    ADD CONSTRAINT property_inquiries_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: property_inquiries property_inquiries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_inquiries
    ADD CONSTRAINT property_inquiries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: property_photos property_photos_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_photos
    ADD CONSTRAINT property_photos_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: saved_listings saved_listings_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_listings
    ADD CONSTRAINT saved_listings_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: saved_listings saved_listings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_listings
    ADD CONSTRAINT saved_listings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: verifications verifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verifications
    ADD CONSTRAINT verifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: income_verifications Admins can update income verifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update income verifications" ON public.income_verifications FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: income_verifications Admins can view all income verifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all income verifications" ON public.income_verifications FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: external_listings Anyone can view active external listings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active external listings" ON public.external_listings FOR SELECT USING ((expires_at > now()));


--
-- Name: properties Anyone can view active properties; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active properties" ON public.properties FOR SELECT USING ((is_active = true));


--
-- Name: cities Anyone can view cities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view cities" ON public.cities FOR SELECT USING (true);


--
-- Name: property_photos Anyone can view property photos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view property photos" ON public.property_photos FOR SELECT USING (true);


--
-- Name: states Anyone can view states; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view states" ON public.states FOR SELECT USING (true);


--
-- Name: group_members Group creators can add members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Group creators can add members" ON public.group_members FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.groups
  WHERE ((groups.id = group_members.group_id) AND (groups.creator_id = auth.uid())))));


--
-- Name: groups Group creators can update their groups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Group creators can update their groups" ON public.groups FOR UPDATE USING ((auth.uid() = creator_id));


--
-- Name: group_listings Group members can add listings to group; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Group members can add listings to group" ON public.group_listings FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM public.group_members
  WHERE ((group_members.group_id = group_listings.group_id) AND (group_members.user_id = auth.uid())))) AND (auth.uid() = added_by_user_id)));


--
-- Name: applications Group members can create applications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Group members can create applications" ON public.applications FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.group_members
  WHERE ((group_members.group_id = applications.group_id) AND (group_members.user_id = auth.uid())))));


--
-- Name: group_listings Group members can view group listings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Group members can view group listings" ON public.group_listings FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.group_members
  WHERE ((group_members.group_id = group_listings.group_id) AND (group_members.user_id = auth.uid())))));


--
-- Name: applications Group members can view their applications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Group members can view their applications" ON public.applications FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.group_members
  WHERE ((group_members.group_id = applications.group_id) AND (group_members.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.properties
  WHERE ((properties.id = applications.property_id) AND (properties.landlord_id = auth.uid()))))));


--
-- Name: agreements Landlords can create agreements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Landlords can create agreements" ON public.agreements FOR INSERT WITH CHECK ((auth.uid() = landlord_id));


--
-- Name: properties Landlords can delete own properties; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Landlords can delete own properties" ON public.properties FOR DELETE USING ((auth.uid() = landlord_id));


--
-- Name: properties Landlords can insert properties; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Landlords can insert properties" ON public.properties FOR INSERT WITH CHECK ((auth.uid() = landlord_id));


--
-- Name: property_photos Landlords can manage their property photos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Landlords can manage their property photos" ON public.property_photos USING ((EXISTS ( SELECT 1
   FROM public.properties
  WHERE ((properties.id = property_photos.property_id) AND (properties.landlord_id = auth.uid())))));


--
-- Name: property_inquiries Landlords can update inquiry status; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Landlords can update inquiry status" ON public.property_inquiries FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.properties
  WHERE ((properties.id = property_inquiries.property_id) AND (properties.landlord_id = auth.uid())))));


--
-- Name: properties Landlords can update own properties; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Landlords can update own properties" ON public.properties FOR UPDATE USING ((auth.uid() = landlord_id));


--
-- Name: agreements Participants can update agreements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Participants can update agreements" ON public.agreements FOR UPDATE USING (((auth.uid() = landlord_id) OR (auth.uid() = tenant_user_id)));


--
-- Name: user_roles System can insert roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert roles" ON public.user_roles FOR INSERT WITH CHECK (true);


--
-- Name: groups Users can create groups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create groups" ON public.groups FOR INSERT WITH CHECK ((auth.uid() = creator_id));


--
-- Name: property_inquiries Users can create inquiries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create inquiries" ON public.property_inquiries FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: income_verifications Users can create own income verifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own income verifications" ON public.income_verifications FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: verifications Users can insert own verifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own verifications" ON public.verifications FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: favorites Users can manage own favorites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage own favorites" ON public.favorites USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: saved_listings Users can manage their own saved listings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own saved listings" ON public.saved_listings USING ((auth.uid() = user_id));


--
-- Name: messages Users can send messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK ((sender_id = auth.uid()));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: verifications Users can update own verifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own verifications" ON public.verifications FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view all active profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view all active profiles" ON public.profiles FOR SELECT USING ((is_active = true));


--
-- Name: compatibility_scores Users can view compatibility scores involving them; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view compatibility scores involving them" ON public.compatibility_scores FOR SELECT USING (((user_id_1 = auth.uid()) OR (user_id_2 = auth.uid())));


--
-- Name: groups Users can view groups they're members of; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view groups they're members of" ON public.groups FOR SELECT USING (((auth.uid() = creator_id) OR (EXISTS ( SELECT 1
   FROM public.group_members
  WHERE ((group_members.group_id = group_members.id) AND (group_members.user_id = auth.uid()))))));


--
-- Name: group_members Users can view members of their groups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view members of their groups" ON public.group_members FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.group_members gm
  WHERE ((gm.group_id = gm.group_id) AND (gm.user_id = auth.uid())))));


--
-- Name: agreements Users can view own agreements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own agreements" ON public.agreements FOR SELECT USING (((auth.uid() = landlord_id) OR (auth.uid() = tenant_user_id)));


--
-- Name: income_verifications Users can view own income verifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own income verifications" ON public.income_verifications FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: subscriptions Users can view own subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: verifications Users can view own verifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own verifications" ON public.verifications FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: messages Users can view their messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING (((sender_id = auth.uid()) OR (recipient_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.group_members
  WHERE ((group_members.group_id = messages.group_id) AND (group_members.user_id = auth.uid()))))));


--
-- Name: property_inquiries Users can view their own inquiries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own inquiries" ON public.property_inquiries FOR SELECT USING (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM public.properties
  WHERE ((properties.id = property_inquiries.property_id) AND (properties.landlord_id = auth.uid()))))));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: agreements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agreements ENABLE ROW LEVEL SECURITY;

--
-- Name: applications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

--
-- Name: cities; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

--
-- Name: compatibility_scores; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.compatibility_scores ENABLE ROW LEVEL SECURITY;

--
-- Name: external_listings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.external_listings ENABLE ROW LEVEL SECURITY;

--
-- Name: favorites; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

--
-- Name: group_listings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.group_listings ENABLE ROW LEVEL SECURITY;

--
-- Name: group_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

--
-- Name: groups; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

--
-- Name: income_verifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.income_verifications ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: properties; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

--
-- Name: property_inquiries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.property_inquiries ENABLE ROW LEVEL SECURITY;

--
-- Name: property_photos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.property_photos ENABLE ROW LEVEL SECURITY;

--
-- Name: saved_listings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;

--
-- Name: states; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;

--
-- Name: subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: verifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


