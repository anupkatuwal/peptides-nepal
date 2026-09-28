/* =====================================================================
   Peptides Nepal — database schema (Microsoft SQL Server 2017+ / Azure SQL)
   Run once against an empty server with sqlcmd or SSMS:
       sqlcmd -S <server> -U <admin> -P <password> -i sql/001_schema.sql
   On Azure SQL Database, create the database in the portal first and
   run this script from the "USE" line down, connected to that database.
   ===================================================================== */

IF DB_ID(N'PeptidesNepal') IS NULL
    CREATE DATABASE PeptidesNepal;
GO

USE PeptidesNepal;
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* Row-versioned reads: readers never block writers and vice versa.
   Good for a shop where product browsing runs alongside checkouts. */
IF (SELECT is_read_committed_snapshot_on FROM sys.databases WHERE name = N'PeptidesNepal') = 0
    ALTER DATABASE PeptidesNepal SET READ_COMMITTED_SNAPSHOT ON WITH ROLLBACK IMMEDIATE;
GO

/* ---------------------------------------------------------------------
   Users
   --------------------------------------------------------------------- */
CREATE TABLE dbo.Users (
    UserID        INT            IDENTITY(1,1) NOT NULL,
    FullName      NVARCHAR(120)  NOT NULL,
    Email         NVARCHAR(254)  NOT NULL,
    PasswordHash  VARCHAR(100)   NOT NULL,          -- bcrypt hash (60 chars)
    Role          VARCHAR(20)    NOT NULL CONSTRAINT DF_Users_Role DEFAULT ('Customer'),
    CreatedAt     DATETIME2(0)   NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_Users PRIMARY KEY CLUSTERED (UserID),
    CONSTRAINT CK_Users_Role CHECK (Role IN ('Customer', 'Admin'))
);
GO
-- Login looks users up by email; unique so two accounts can't share one.
CREATE UNIQUE NONCLUSTERED INDEX UX_Users_Email ON dbo.Users (Email);
GO

/* ---------------------------------------------------------------------
   Categories
   --------------------------------------------------------------------- */
CREATE TABLE dbo.Categories (
    CategoryID    INT            IDENTITY(1,1) NOT NULL,
    CategoryName  NVARCHAR(80)   NOT NULL,
    Slug          VARCHAR(80)    NOT NULL,          -- URL-safe name, e.g. 'anti-aging'
    Description   NVARCHAR(400)  NULL,
    SortOrder     INT            NOT NULL CONSTRAINT DF_Categories_SortOrder DEFAULT (0),
    CONSTRAINT PK_Categories PRIMARY KEY CLUSTERED (CategoryID)
);
GO
CREATE UNIQUE NONCLUSTERED INDEX UX_Categories_CategoryName ON dbo.Categories (CategoryName);
CREATE UNIQUE NONCLUSTERED INDEX UX_Categories_Slug ON dbo.Categories (Slug);
GO

/* ---------------------------------------------------------------------
   Products
   --------------------------------------------------------------------- */
CREATE TABLE dbo.Products (
    ProductID         INT             IDENTITY(1,1) NOT NULL,
    CategoryID        INT             NOT NULL,
    Name              NVARCHAR(150)   NOT NULL,
    Slug              VARCHAR(160)    NOT NULL,     -- URL-safe name, e.g. 'bpc-157-5mg'
    Description       NVARCHAR(MAX)   NOT NULL,
    Price             DECIMAL(10,2)   NOT NULL,     -- NPR
    StockLevel        INT             NOT NULL CONSTRAINT DF_Products_StockLevel DEFAULT (0),
    PurityPercentage  DECIMAL(5,2)    NULL,         -- HPLC purity from the current batch COA; NULL until tested
    COA_ImageURL      NVARCHAR(500)   NULL,         -- Certificate of Analysis image/PDF
    ImageURL          NVARCHAR(500)   NULL,
    IsActive          BIT             NOT NULL CONSTRAINT DF_Products_IsActive DEFAULT (1),
    CreatedAt         DATETIME2(0)    NOT NULL CONSTRAINT DF_Products_CreatedAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_Products PRIMARY KEY CLUSTERED (ProductID),
    CONSTRAINT FK_Products_Categories FOREIGN KEY (CategoryID)
        REFERENCES dbo.Categories (CategoryID),
    CONSTRAINT CK_Products_Price CHECK (Price >= 0),
    CONSTRAINT CK_Products_StockLevel CHECK (StockLevel >= 0),
    CONSTRAINT CK_Products_Purity CHECK (PurityPercentage IS NULL OR (PurityPercentage >= 0 AND PurityPercentage <= 100))
);
GO
CREATE UNIQUE NONCLUSTERED INDEX UX_Products_Slug ON dbo.Products (Slug);
-- "Shop by category" listing: seek on category, read card fields from the index.
CREATE NONCLUSTERED INDEX IX_Products_Category_Active
    ON dbo.Products (CategoryID, IsActive)
    INCLUDE (Name, Slug, Price, StockLevel, PurityPercentage, ImageURL, CreatedAt);
-- "Newest first" listing across all categories.
CREATE NONCLUSTERED INDEX IX_Products_Active_CreatedAt
    ON dbo.Products (IsActive, CreatedAt DESC)
    INCLUDE (CategoryID, Name, Slug, Price, StockLevel, PurityPercentage, ImageURL);
GO

/* ---------------------------------------------------------------------
   Orders
   --------------------------------------------------------------------- */
CREATE TABLE dbo.Orders (
    OrderID          INT             IDENTITY(1000,1) NOT NULL,
    UserID           INT             NOT NULL,
    TotalPrice       DECIMAL(12,2)   NOT NULL,
    PaymentMethod    VARCHAR(10)     NOT NULL,
    OrderStatus      VARCHAR(20)     NOT NULL CONSTRAINT DF_Orders_OrderStatus DEFAULT ('Pending'),
    OrderDate        DATETIME2(0)    NOT NULL CONSTRAINT DF_Orders_OrderDate DEFAULT (SYSUTCDATETIME()),
    ShippingName     NVARCHAR(120)   NOT NULL,
    Phone            VARCHAR(20)     NOT NULL,
    ShippingAddress  NVARCHAR(300)   NOT NULL,
    City             NVARCHAR(80)    NOT NULL,
    Notes            NVARCHAR(500)   NULL,
    CONSTRAINT PK_Orders PRIMARY KEY CLUSTERED (OrderID),
    CONSTRAINT FK_Orders_Users FOREIGN KEY (UserID) REFERENCES dbo.Users (UserID),
    CONSTRAINT CK_Orders_TotalPrice CHECK (TotalPrice >= 0),
    CONSTRAINT CK_Orders_PaymentMethod CHECK (PaymentMethod IN ('eSewa', 'Khalti', 'COD')),
    CONSTRAINT CK_Orders_OrderStatus CHECK (OrderStatus IN
        ('Pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled'))
);
GO
-- "My orders" page.
CREATE NONCLUSTERED INDEX IX_Orders_User_OrderDate
    ON dbo.Orders (UserID, OrderDate DESC)
    INCLUDE (TotalPrice, PaymentMethod, OrderStatus);
-- Admin queue: e.g. all Pending orders, oldest first.
CREATE NONCLUSTERED INDEX IX_Orders_Status_OrderDate
    ON dbo.Orders (OrderStatus, OrderDate)
    INCLUDE (UserID, TotalPrice, PaymentMethod);
GO

/* ---------------------------------------------------------------------
   OrderItems — the lines of each order (an order can hold many products).
   UnitPrice is copied at checkout so later price changes don't rewrite history.
   --------------------------------------------------------------------- */
CREATE TABLE dbo.OrderItems (
    OrderItemID  INT            IDENTITY(1,1) NOT NULL,
    OrderID      INT            NOT NULL,
    ProductID    INT            NOT NULL,
    Quantity     INT            NOT NULL,
    UnitPrice    DECIMAL(10,2)  NOT NULL,
    CONSTRAINT PK_OrderItems PRIMARY KEY CLUSTERED (OrderItemID),
    CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (OrderID)
        REFERENCES dbo.Orders (OrderID) ON DELETE CASCADE,
    CONSTRAINT FK_OrderItems_Products FOREIGN KEY (ProductID)
        REFERENCES dbo.Products (ProductID),
    CONSTRAINT CK_OrderItems_Quantity CHECK (Quantity > 0),
    CONSTRAINT CK_OrderItems_UnitPrice CHECK (UnitPrice >= 0)
);
GO
CREATE NONCLUSTERED INDEX IX_OrderItems_OrderID ON dbo.OrderItems (OrderID)
    INCLUDE (ProductID, Quantity, UnitPrice);
CREATE NONCLUSTERED INDEX IX_OrderItems_ProductID ON dbo.OrderItems (ProductID);
GO

/* ---------------------------------------------------------------------
   ContactMessages
   --------------------------------------------------------------------- */
CREATE TABLE dbo.ContactMessages (
    MessageID    INT             IDENTITY(1,1) NOT NULL,
    SenderName   NVARCHAR(120)   NOT NULL,
    SenderEmail  NVARCHAR(254)   NOT NULL,
    Subject      NVARCHAR(150)   NOT NULL,
    MessageBody  NVARCHAR(4000)  NOT NULL,
    SubmittedAt  DATETIME2(0)    NOT NULL CONSTRAINT DF_ContactMessages_SubmittedAt DEFAULT (SYSUTCDATETIME()),
    IsRead       BIT             NOT NULL CONSTRAINT DF_ContactMessages_IsRead DEFAULT (0),
    CONSTRAINT PK_ContactMessages PRIMARY KEY CLUSTERED (MessageID)
);
GO
-- Admin inbox: unread first, newest first.
CREATE NONCLUSTERED INDEX IX_ContactMessages_IsRead_SubmittedAt
    ON dbo.ContactMessages (IsRead, SubmittedAt DESC)
    INCLUDE (SenderName, SenderEmail, Subject);
GO

/* ---------------------------------------------------------------------
   Least-privilege login for the API.
   The app only needs to read and write rows; it never changes the schema.
   Replace the password before running, or create the login separately.
   --------------------------------------------------------------------- */
-- USE master;
-- CREATE LOGIN peptides_api WITH PASSWORD = '<strong password>';
-- USE PeptidesNepal;
-- CREATE USER peptides_api FOR LOGIN peptides_api;
-- ALTER ROLE db_datareader ADD MEMBER peptides_api;
-- ALTER ROLE db_datawriter ADD MEMBER peptides_api;
-- GO
