BEGIN;
    INSERT INTO public.db_version (version, is_finished, comment) VALUES (1, FALSE, 'Добавил роль юзеру');

    ALTER TABLE public.user
    ADD COLUMN role varchar(15)
    DEFAULT 'USER';

    UPDATE public.db_version SET is_finished = TRUE WHERE version = 1;
END;