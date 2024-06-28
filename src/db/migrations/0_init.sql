BEGIN;


CREATE TABLE public.db_version(
    id serial NOT NULL,
    version smallint,
    is_finished bool,
    comment varchar(100),
    CONSTRAINT "db_version_pkey" PRIMARY KEY (id)
);
-- устанавливаем флаг начала обновления (делаем при каждой миграции)
INSERT INTO public.db_version (version, is_finished, comment) VALUES (0, FALSE, 'Инициализация');


CREATE TABLE public.user(
    id serial NOT NULL,
    email varchar(255) NOT NULL,
    activation_link text NULL,
    is_activated bool NULL DEFAULT false,
    password text NOT NULL,
    username varchar(255) NOT NULL,
    CONSTRAINT "user_email_key" UNIQUE (email),
    CONSTRAINT "user_pkey" PRIMARY KEY (id)
);


CREATE TABLE public.token (
	id serial4 NOT NULL,
	user_id int4 NOT NULL,
	refresh_token text NOT NULL,
	CONSTRAINT token_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX "token_user_id_key" ON public.token USING btree ("user_id");
ALTER TABLE public.token ADD CONSTRAINT "token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES public.user(id);


CREATE TABLE public.profile (
	id serial4 NOT NULL,
	bio text NULL,
	"user_id" int4 NOT NULL,
	CONSTRAINT "profile_pkey" PRIMARY KEY (id),
	CONSTRAINT "profile_user_id_key" UNIQUE ("user_id")
);
ALTER TABLE public.profile ADD CONSTRAINT "profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES public.user(id);


CREATE TABLE public.post (
	id serial4 NOT NULL,
	title varchar(255) NOT NULL,
	created_at timestamp NOT NULL DEFAULT now(),
	content text NULL,
	published bool NOT NULL DEFAULT false,
	author_id int4 NOT NULL,
	CONSTRAINT "post_pkey" PRIMARY KEY (id)
);
ALTER TABLE public.post ADD CONSTRAINT "post_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES public.user(id);


CREATE TABLE public.tag (
	id serial4 NOT NULL,
	name text NOT NULL,
	CONSTRAINT "tag_pkey" PRIMARY KEY (id)
);


CREATE TABLE public.post_to_tag (
    id serial4 NOT NULL,
	post int4 NOT NULL,
	tag int4 NOT NULL,
	CONSTRAINT "post_to_tag_pkey" PRIMARY KEY (id)
);
CREATE UNIQUE INDEX "post_to_tag_AB_unique" ON public.post_to_tag USING btree ("post", "tag");
CREATE INDEX "post_to_tag_B_index" ON public.post_to_tag USING btree ("tag");
ALTER TABLE public.post_to_tag ADD CONSTRAINT "post_to_tag_post_fkey" FOREIGN KEY ("post") REFERENCES public.post(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE public.post_to_tag ADD CONSTRAINT "post_to_tag_tag_fkey" FOREIGN KEY ("tag") REFERENCES public.tag(id) ON DELETE CASCADE ON UPDATE CASCADE;


-- устанавливаем флаг конца обновления (делаем при каждой миграции)
UPDATE public.db_version SET is_finished = TRUE WHERE version = 0;


COMMIT;



