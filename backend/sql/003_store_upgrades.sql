/* =====================================================================
   Peptides Nepal — upgrade 003: uploads, delivery fees, online payments,
   password resets. Run after 001 and 002. Safe to re-run.
   On Azure SQL Database, run it from the "SET" line down.
   ===================================================================== */

USE PeptidesNepal;
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* ---------------------------------------------------------------------
   Orders: delivery fee and payment tracking.
   TotalPrice now = items + DeliveryFee.
   --------------------------------------------------------------------- */
IF COL_LENGTH('dbo.Orders', 'DeliveryFee') IS NULL
    ALTER TABLE dbo.Orders ADD DeliveryFee DECIMAL(10,2) NOT NULL
        CONSTRAINT DF_Orders_DeliveryFee DEFAULT (0)
        CONSTRAINT CK_Orders_DeliveryFee CHECK (DeliveryFee >= 0);
GO
IF COL_LENGTH('dbo.Orders', 'PaymentStatus') IS NULL
    ALTER TABLE dbo.Orders ADD PaymentStatus VARCHAR(20) NOT NULL
        CONSTRAINT DF_Orders_PaymentStatus DEFAULT ('Unpaid')
        CONSTRAINT CK_Orders_PaymentStatus CHECK (PaymentStatus IN ('Unpaid', 'Initiated', 'Paid', 'Failed', 'Refunded'));
GO
IF COL_LENGTH('dbo.Orders', 'PaymentReference') IS NULL
    ALTER TABLE dbo.Orders ADD PaymentReference NVARCHAR(100) NULL;   -- eSewa transaction code / Khalti pidx
GO
IF COL_LENGTH('dbo.Orders', 'PaidAt') IS NULL
    ALTER TABLE dbo.Orders ADD PaidAt DATETIME2(0) NULL;
GO
-- A gateway reference can only ever belong to one order.
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_Orders_PaymentReference')
    CREATE UNIQUE NONCLUSTERED INDEX UX_Orders_PaymentReference
        ON dbo.Orders (PaymentReference) WHERE PaymentReference IS NOT NULL;
GO

/* ---------------------------------------------------------------------
   Media — uploaded product photos and COA files (images or PDF).
   --------------------------------------------------------------------- */
IF OBJECT_ID('dbo.Media', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Media (
        MediaID      INT             IDENTITY(1,1) NOT NULL,
        FileName     NVARCHAR(200)   NOT NULL,
        ContentType  VARCHAR(50)     NOT NULL,
        SizeBytes    INT             NOT NULL,
        Sha256       VARCHAR(64)     NOT NULL,
        Data         VARBINARY(MAX)  NOT NULL,
        UploadedBy   INT             NOT NULL,
        CreatedAt    DATETIME2(0)    NOT NULL CONSTRAINT DF_Media_CreatedAt DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT PK_Media PRIMARY KEY CLUSTERED (MediaID),
        CONSTRAINT FK_Media_Users FOREIGN KEY (UploadedBy) REFERENCES dbo.Users (UserID),
        CONSTRAINT CK_Media_ContentType CHECK (ContentType IN ('image/png', 'image/jpeg', 'image/webp', 'application/pdf')),
        CONSTRAINT CK_Media_SizeBytes CHECK (SizeBytes > 0 AND SizeBytes <= 8388608)
    );
    -- Same file uploaded twice returns the existing row.
    CREATE NONCLUSTERED INDEX IX_Media_Sha256 ON dbo.Media (Sha256);
END
GO

/* ---------------------------------------------------------------------
   Users: after a password change, older sign-in sessions stop working.
   --------------------------------------------------------------------- */
IF COL_LENGTH('dbo.Users', 'PasswordChangedAt') IS NULL
    ALTER TABLE dbo.Users ADD PasswordChangedAt DATETIME2(0) NULL;
GO

/* ---------------------------------------------------------------------
   PasswordResetTokens — only a SHA-256 of each emailed token is stored.
   --------------------------------------------------------------------- */
IF OBJECT_ID('dbo.PasswordResetTokens', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.PasswordResetTokens (
        TokenID    INT           IDENTITY(1,1) NOT NULL,
        UserID     INT           NOT NULL,
        TokenHash  VARCHAR(64)   NOT NULL,
        ExpiresAt  DATETIME2(0)  NOT NULL,
        UsedAt     DATETIME2(0)  NULL,
        CreatedAt  DATETIME2(0)  NOT NULL CONSTRAINT DF_PasswordResetTokens_CreatedAt DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT PK_PasswordResetTokens PRIMARY KEY CLUSTERED (TokenID),
        CONSTRAINT FK_PasswordResetTokens_Users FOREIGN KEY (UserID) REFERENCES dbo.Users (UserID) ON DELETE CASCADE
    );
    CREATE UNIQUE NONCLUSTERED INDEX UX_PasswordResetTokens_TokenHash ON dbo.PasswordResetTokens (TokenHash);
    CREATE NONCLUSTERED INDEX IX_PasswordResetTokens_UserID ON dbo.PasswordResetTokens (UserID);
END
GO
