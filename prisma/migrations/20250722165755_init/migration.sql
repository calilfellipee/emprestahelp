-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "company_name" TEXT,
    "company_cnpj" TEXT,
    "company_address" TEXT,
    "whatsapp_api_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "cpf" TEXT,
    "rg" TEXT,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "email" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "zip_code" TEXT,
    "observations" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "client_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'loan',
    "amount" DECIMAL(10,2) NOT NULL,
    "interest_rate" DECIMAL(5,2) NOT NULL,
    "loan_date" DATE NOT NULL,
    "due_date" DATE NOT NULL,
    "installments" INTEGER NOT NULL DEFAULT 1,
    "installment_amount" DECIMAL(10,2) NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "daily_interest_rate" DECIMAL(5,2) NOT NULL DEFAULT 0.1,
    "late_fee_percentage" DECIMAL(5,2) NOT NULL DEFAULT 2.0,
    "collateral_description" TEXT,
    "collateral_value" DECIMAL(10,2),
    "notes" TEXT,
    "contract_generated" BOOLEAN NOT NULL DEFAULT false,
    "contract_url" TEXT,
    "contract_signed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "loan_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "installment_number" INTEGER NOT NULL DEFAULT 1,
    "late_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "daily_interest" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "payment_method" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "client_id" UUID,
    "loan_id" UUID,
    "type" TEXT NOT NULL,
    "channel" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "recipient_phone" TEXT,
    "recipient_email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sent_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "error_message" TEXT,
    "provider_id" TEXT,
    "provider_response" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_documents" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "client_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT,
    "size" BIGINT NOT NULL,
    "url" TEXT NOT NULL,
    "storage_path" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "uploaded_by" UUID,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_documents" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "loan_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT,
    "size" BIGINT NOT NULL,
    "url" TEXT NOT NULL,
    "storage_path" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "uploaded_by" UUID,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loan_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clients_cpf_key" ON "clients"("cpf");

-- CreateIndex
CREATE INDEX "clients_user_id_idx" ON "clients"("user_id");

-- CreateIndex
CREATE INDEX "clients_cpf_idx" ON "clients"("cpf");

-- CreateIndex
CREATE INDEX "clients_phone_idx" ON "clients"("phone");

-- CreateIndex
CREATE INDEX "clients_is_active_idx" ON "clients"("is_active");

-- CreateIndex
CREATE INDEX "loans_client_id_idx" ON "loans"("client_id");

-- CreateIndex
CREATE INDEX "loans_user_id_idx" ON "loans"("user_id");

-- CreateIndex
CREATE INDEX "loans_status_idx" ON "loans"("status");

-- CreateIndex
CREATE INDEX "loans_due_date_idx" ON "loans"("due_date");

-- CreateIndex
CREATE INDEX "loans_type_idx" ON "loans"("type");

-- CreateIndex
CREATE INDEX "payments_loan_id_idx" ON "payments"("loan_id");

-- CreateIndex
CREATE INDEX "payments_user_id_idx" ON "payments"("user_id");

-- CreateIndex
CREATE INDEX "payments_payment_date_idx" ON "payments"("payment_date");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_client_id_idx" ON "notifications"("client_id");

-- CreateIndex
CREATE INDEX "notifications_loan_id_idx" ON "notifications"("loan_id");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "client_documents_client_id_idx" ON "client_documents"("client_id");

-- CreateIndex
CREATE INDEX "client_documents_type_idx" ON "client_documents"("type");

-- CreateIndex
CREATE INDEX "loan_documents_loan_id_idx" ON "loan_documents"("loan_id");

-- CreateIndex
CREATE INDEX "loan_documents_type_idx" ON "loan_documents"("type");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_documents" ADD CONSTRAINT "client_documents_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_documents" ADD CONSTRAINT "loan_documents_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
