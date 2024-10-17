DO $$ BEGIN
 CREATE TYPE "public"."user_roles" AS ENUM('MEMBER', 'ADMIN');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."document_formats" AS ENUM('PDF', 'IMAGE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "documents" (
	"id" text PRIMARY KEY NOT NULL,
	"job_id" text NOT NULL,
	"template_id" text NOT NULL,
	"template_version" integer NOT NULL,
	"template_variables" jsonb NOT NULL,
	"s3_key" text NOT NULL,
	"url" text NOT NULL,
	"preview_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"template_id" text NOT NULL,
	"template_version" integer NOT NULL,
	"document_id" text,
	"target_format" "document_formats" DEFAULT 'PDF',
	"template_variables" jsonb NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"retries" integer DEFAULT 0 NOT NULL,
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_users" (
	"project_id" text,
	"user_id" text,
	"user_role" "user_roles" DEFAULT 'MEMBER',
	"created_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"usage" integer DEFAULT 0,
	"usage_limit" integer DEFAULT 500,
	"created_at" timestamp with time zone,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "document_types" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"s3_path_prefix" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"is_deleted" boolean DEFAULT false NOT NULL,
	CONSTRAINT "document_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "templates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"payload_schema" jsonb NOT NULL,
	"description" text,
	"document_format" "document_formats" DEFAULT 'PDF',
	"document_type_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"function_definition" text NOT NULL,
	"raw_function_definition" text NOT NULL,
	"s3_path_prefix" text,
	"last_generated_at" timestamp with time zone,
	"generation_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "templates_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "variables" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"value" text NOT NULL,
	"secret" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"is_deleted" boolean DEFAULT false NOT NULL,
	CONSTRAINT "variables_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"hashed_key" text NOT NULL,
	"partial_key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"is_revoked" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"avatar" text,
	"name" text NOT NULL,
	"sub" text NOT NULL,
	"email" text NOT NULL,
	"is_machine" boolean DEFAULT false,
	"created_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "documents" ADD CONSTRAINT "documents_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "documents" ADD CONSTRAINT "documents_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "jobs" ADD CONSTRAINT "jobs_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_users" ADD CONSTRAINT "project_users_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_users" ADD CONSTRAINT "project_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "templates" ADD CONSTRAINT "templates_document_type_id_document_types_id_fk" FOREIGN KEY ("document_type_id") REFERENCES "public"."document_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_id_idx" ON "documents" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "doc_template_id_idx" ON "documents" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_template_id_idx" ON "jobs" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_index" ON "templates" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "template_doc_type_idx" ON "templates" USING btree ("document_type_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hashed_key_index" ON "tokens" USING btree ("hashed_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "expires_at_index" ON "tokens" USING btree ("expires_at");