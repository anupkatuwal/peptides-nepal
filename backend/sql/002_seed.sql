/* =====================================================================
   Peptides Nepal — starter data. Run after 001_schema.sql.
   Safe to re-run: each row is inserted only if its slug is missing.

   Prices and stock are STARTING VALUES — set your real ones before launch.
   PurityPercentage and COA_ImageURL are left NULL on purpose: the site shows
   "Lab report pending" until you add the figure and image from a real COA.
   Update them per batch with:
       UPDATE dbo.Products
       SET PurityPercentage = <hplc %>, COA_ImageURL = N'<https url of the COA>'
       WHERE Slug = '<slug>';
   ===================================================================== */

USE PeptidesNepal;
GO

SET NOCOUNT ON;

MERGE dbo.Categories AS t
USING (VALUES
    (N'Anti-Aging', 'anti-aging', N'Peptides studied for skin and tissue ageing.', 1),
    (N'Fitness',    'fitness',    N'Peptides studied for growth-hormone release and body composition.', 2),
    (N'Recovery',   'recovery',   N'Peptides studied for tissue repair and healing.', 3)
) AS s (CategoryName, Slug, Description, SortOrder)
ON t.Slug = s.Slug
WHEN NOT MATCHED THEN
    INSERT (CategoryName, Slug, Description, SortOrder)
    VALUES (s.CategoryName, s.Slug, s.Description, s.SortOrder);
GO

DECLARE @antiAging INT = (SELECT CategoryID FROM dbo.Categories WHERE Slug = 'anti-aging');
DECLARE @fitness   INT = (SELECT CategoryID FROM dbo.Categories WHERE Slug = 'fitness');
DECLARE @recovery  INT = (SELECT CategoryID FROM dbo.Categories WHERE Slug = 'recovery');

MERGE dbo.Products AS t
USING (VALUES
    (@recovery, N'BPC-157 (5 mg)', 'bpc-157-5mg',
     N'BPC-157 is a 15-amino-acid peptide. It is a partial sequence of a protein found in human gastric juice. Research on it is mostly in rats and cell studies of tendon, gut and wound healing. Supplied as a lyophilised (freeze-dried) powder in a sealed vial.',
     4500.00, 25, '/products/vial-recovery.svg'),
    (@recovery, N'TB-500 (5 mg)', 'tb-500-5mg',
     N'TB-500 is a synthetic peptide based on the active region of thymosin beta-4, a protein found in most human cells. Thymosin beta-4 has been studied in animals and early human research on wound and eye healing. Supplied as a lyophilised powder in a sealed vial.',
     5500.00, 20, '/products/vial-recovery.svg'),
    (@fitness, N'CJC-1295 / Ipamorelin (5 mg / 5 mg)', 'cjc-1295-ipamorelin-5-5mg',
     N'Two peptides in one vial. CJC-1295 is a growth-hormone-releasing hormone (GHRH) analogue. Ipamorelin mimics ghrelin at the growth-hormone secretagogue receptor. Both signal the pituitary gland to release growth hormone. Supplied as a lyophilised powder in a sealed vial.',
     7500.00, 15, '/products/vial-fitness.svg'),
    (@antiAging, N'GHK-Cu (50 mg)', 'ghk-cu-50mg',
     N'GHK-Cu is a three-amino-acid peptide (glycine-histidine-lysine) bound to copper. It occurs naturally in human plasma. It is studied mainly for skin: collagen production and wound repair. Supplied as a lyophilised powder in a sealed vial.',
     4000.00, 30, '/products/vial-anti-aging.svg')
) AS s (CategoryID, Name, Slug, Description, Price, StockLevel, ImageURL)
ON t.Slug = s.Slug
WHEN NOT MATCHED THEN
    INSERT (CategoryID, Name, Slug, Description, Price, StockLevel, ImageURL)
    VALUES (s.CategoryID, s.Name, s.Slug, s.Description, s.Price, s.StockLevel, s.ImageURL);
GO
