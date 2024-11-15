--Inserting Account info
INSERT INTO account (
        account_firstname,
        account_lastname,
        account_email,
        account_password
    )
VALUES (
        'Tony',
        'Stark',
        'tony@starkent.com',
        'Iam1ronM@n'
    );
---Update Account Type
UPDATE account
SET account_type = 'Admin'
WHERE account_id = 1;
---Delete Tony Stark entry
DELETE FROM account;
--Updaing GM Hummer Description
UPDATE inventory
SET inv_description = REPLACE (
        inv_description,
        'the small interiors',
        'a huge interior'
    )
WHERE inv_id = 10;
--Inner join Make & Model from Inventory table to Sports in Classification Table
SELECT i.inv_make,
    i.inv_model,
    c.classification_name
FROM inventory i
    INNER JOIN classification c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';
----update records to add /vehicles on inv_image
UPDATE inventory
SET inv_image = REPLACE (inv_image, '/images', '/images/vehicles');
----update records to add /vehicles on inv_thumbnail
UPDATE inventory
SET inv_thumbnail = REPLACE (inv_thumbnail, '/images', '/images/vehicles');