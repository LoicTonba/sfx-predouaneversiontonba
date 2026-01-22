--INITIALISATION DES DONNEES

 

-- Groupes Entites

SET IDENTITY_INSERT TGroupesEntites ON;

INSERT INTO TGroupesEntites([ID Groupe Entite], [Nom Groupe Entite])

VALUES (0,'DEFAULT GROUP')

SET IDENTITY_INSERT TGroupesEntites OFF;

 

-- Entites

SET IDENTITY_INSERT TEntites ON;

INSERT INTO TEntites([ID Entite], [Code Entite] , [Nom Entite], [Groupe Entite], [Pays])

VALUES (0,'','DEFAULT ENTITY', 0,0)

SET IDENTITY_INSERT TEntites OFF;

 

-- Branches

SET IDENTITY_INSERT TBranches ON;

INSERT INTO TBranches([ID Branche], [Code Branche] , [Nom Branche], [Entite])

VALUES (0,'','DEFAULT BRANCH', 0)

SET IDENTITY_INSERT TBranches OFF;

 

 

-- Devises

SET IDENTITY_INSERT TDevises ON;

INSERT INTO TDevises([ID Devise], [Code Devise], [Libelle Devise], [Decimales], [Devise Inactive])

VALUES (0,'','LOCAL CURRENCY',2, 0)

SET IDENTITY_INSERT TDevises OFF;

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('AED','United Arab Emirates dirham',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('AFN','Afghan afghani',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('ALL','Albanian lek',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('AMD','Armenian dram',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('ANG','Netherlands Antillean guilder',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('AOA','Angolan kwanza',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('ARS','Argentine peso',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('AUD','Australian dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('AWG','Aruban florin',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('AZN','Azerbaijani manat',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('BAM','Bosnia and Herzegovina convertible mark',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('BBD','Barbadian dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('BDT','Bangladeshi taka',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('BGN','Bulgarian lev',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('BHD','Bahraini dinar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('BIF','Burundian franc',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('BMD','Bermudian dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('BND','Brunei dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('BOB','Bolivian boliviano',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('BRL','Brazilian real',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('BSD','Bahamian dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('BTN','Bhutanese ngultrum',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('BWP','Botswana pula',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('BYR','Belarusian ruble',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('BZD','Belize dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('CAD','Canadian dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('CDF','Congolese franc',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('CHF','Swiss franc',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('CLP','Chilean peso',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('CNY','Chinese yuan',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('COP','Colombian peso',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('CRC','Costa Rican colón',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('CUC','Cuban convertible peso',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('CUP','Cuban peso',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('CVE','Cape Verdean escudo',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('CZK','Czech koruna',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('DJF','Djiboutian franc',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('DKK','Danish krone',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('DOP','Dominican peso',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('DZD','Algerian dinar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('EGP','Egyptian pound',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('ERN','Eritrean nakfa',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('ETB','Ethiopian birr',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('EUR','Euro',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('FJD','Fijian dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('FKP','Falkland Islands pound',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('GBP','British pound',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('GEL','Georgian lari',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('GGP','Guernsey pound',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('GHS','Ghana cedi',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('GIP','Gibraltar pound',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('GMD','Gambian dalasi',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('GNF','Guinean franc',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('GTQ','Guatemalan quetzal',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('GYD','Guyanese dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('HKD','Hong Kong dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('HNL','Honduran lempira',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('HRK','Croatian kuna',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('HTG','Haitian gourde',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('HUF','Hungarian forint',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('IDR','Indonesian rupiah',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('ILS','Israeli new shekel',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('INR','Indian rupee',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('IQD','Iraqi dinar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('IRR','Iranian rial',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('ISK','Icelandic króna',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('JMD','Jamaican dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('JOD','Jordanian dinar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('JPY','Japanese yen',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('KES','Kenyan shilling',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('KGS','Kyrgyzstani som',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('KHR','Cambodian riel',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('KMF','Comorian franc',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('KPW','North Korean won',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('KRW','South Korean won',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('KWD','Kuwaiti dinar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('KYD','Cayman Islands dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('KZT','Kazakhstani tenge',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('LAK','Lao kip',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('LBP','Lebanese pound',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('LKR','Sri Lankan rupee',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('LRD','Liberian dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('LSL','Lesotho loti',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('LYD','Libyan dinar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('MAD','Moroccan dirham',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('MDL','Moldovan leu',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('MGA','Malagasy ariary',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('MKD','Macedonian denar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('MMK','Burmese kyat',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('MNT','Mongolian tögrög',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('MOP','Macanese pataca',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('MRO','Mauritanian ouguiya',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('MUR','Mauritian rupee',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('MVR','Maldivian rufiyaa',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('MWK','Malawian kwacha',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('MXN','Mexican peso',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('MYR','Malaysian ringgit',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('MZN','Mozambican metical',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('NAD','Namibian dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('NGN','Nigerian naira',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('NIO','Nicaraguan córdoba',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('NOK','Norwegian krone',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('none','Abkhazian apsar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('NPR','Nepalese rupee',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('NZD','New Zealand dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('OMR','Omani rial',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('PAB','Panamanian balboa',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('PEN','Peruvian nuevo sol',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('PGK','Papua New Guinean kina',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('PHP','Philippine peso',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('PKR','Pakistani rupee',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('PLN','Polish z?oty',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('PYG','Paraguayan guaraní',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('QAR','Qatari riyal',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('RON','Romanian leu',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('RSD','Serbian dinar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('RUB','Russian ruble',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('RWF','Rwandan franc',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('SAR','Saudi riyal',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('SBD','Solomon Islands dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('SCR','Seychellois rupee',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('SDG','Sudanese pound',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('SEK','Swedish krona',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('SGD','Singapore dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('SHP','Saint Helena pound',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('SLL','Sierra Leonean leone',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('SOS','Somali shilling',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('SRD','Surinamese dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('SSP','South Sudanese pound',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('STD','São Tomé and Príncipe dobra',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('SYP','Syrian pound',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('SZL','Swazi lilangeni',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('THB','Thai baht',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('TJS','Tajikistani somoni',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('TMT','Turkmenistan manat',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('TND','Tunisian dinar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('TOP','Tongan pa?anga',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('TRY','Turkish lira',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('TTD','Trinidad and Tobago dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('TWD','New Taiwan dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('TZS','Tanzanian shilling',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('UAH','Ukrainian hryvnia',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('UGX','Ugandan shilling',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('USD','United States dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('UYU','Uruguayan peso',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('UZS','Uzbekistani som',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('VEF','Venezuelan bolívar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('VND','Vietnamese ??ng',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('VUV','Vanuatu vatu',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('WST','Samoan t?l?',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('XAF','Central African CFA franc',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('XCD','East Caribbean dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('XOF','West African CFA franc',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('XPF','CFP franc',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('YER','Yemeni rial',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('ZAR','South African rand',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('ZMW','Zambian kwacha',2)

 

 

 

-- Pays

SET IDENTITY_INSERT TPays ON;

INSERT INTO TPays([ID Pays], [Code Pays] ,[Libelle Pays], [Devise Locale])

VALUES (0,'', 'DEFAULT COUNTRY',0)

SET IDENTITY_INSERT TPays OFF;

/*

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('AD','Andorra',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('AE','United Arab Emirates',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('AG','Antigua',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('AI','Anguilla',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('AL','Albania',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('AM','Armenia',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('AN','Netherlands Antilles',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('AO','Angola',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('AR','Argentina',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('AS','American Samoa',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('AT','Austria',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('AU','Australia',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('AW','Aruba',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('AZ','Azerbaijan',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('BB','Barbados',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('BD','Bangladesh',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('BE','Belgium',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('BF','Burkino Faso',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('BG','Bulgaria',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('BH','Bahrain',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('BI','Burundi',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('BJ','Benin',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('BM','Bermuda',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('BN','Brunei',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('BO','Bolivia',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('BR','Brazil',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('BS','Bahamas',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('BT','Bhutan',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('BW','Botswana',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('BY','Belarus',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('BZ','Belize',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('CA','Canada',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('CD','Congo, The Republic of',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('CF','Central African',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('CG','Congo',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('CH','Switzerland',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('CI','Ivory Coast',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('CK','Cook Islands',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('CL','Chile',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('CM','Cameroon',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('CN','China',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('CO','Colombia',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('CR','Costa Rica',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('CV','Cape Verde',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('CY','Cyprus',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('CZ','Czech Republic',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('DE','Germany',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('DJ','Djibouti',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('DK','Denmark',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('DM','Dominica',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('DO','Dominican Republic',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('DZ','Algeria',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('EC','Ecuador',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('EE','Estonia',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('EG','Egypt',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('ER','Eritrea',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('ES','Spain',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('ET','Ethiopia',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('FI','Finland',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('FJ','Fiji',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('FM','Micronesia',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('FO','Faeroe Islands',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('FR','France',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('GA','Gabon',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('GB','United Kingdom',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('GD','Grenada',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('GE','Georgia, Republic of',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('GF','French Guiana',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('GH','Ghana',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('GI','Gibraltar',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('GL','Greenland',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('GM','Gambia',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('GN','Guinea',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('GP','Guadeloupe',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('GQ','Equatorial Guinea',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('GR','Greece',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('GT','Guatemala',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('GU','Guam',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('GW','Guinea-Bissau',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('GY','Guyana',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('HK','Hong Kong',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('HN','Honduras',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('HR','Croatia',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('HT','Haiti',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('HU','Hungary',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('ID','Indonesia',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('IE','Ireland',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('IL','Israel',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('IN','India',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('IS','Iceland',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('IT','Italy',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('JM','Jamaica',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('JO','Jordan',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('JP','Japan',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('KE','Kenya',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('KG','Kyrgyzstan',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('KH','Cambodia',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('KN','St. Kitts & Nevis',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('KR','South Korea',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('KW','Kuwait',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('KY','Cayman Islands',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('KZ','Kazakhstan',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('LB','Lebanon',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('LC','St. Lucia',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('LI','Liechtenstein',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('LK','Sri Lanka',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('LS','Lesotho',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('LT','Lithuania',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('LU','Luxembourg',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('LV','Latvia',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('MA','Morocco',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('MC','Monaco',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('MD','Moldova',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('MG','Madagascar',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('MH','Marshall Islands',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('MK','Macedonia',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('ML','Mali',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('MM','Burma (Myanmar)',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('MN','Mongolia',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('MO','Macau',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('MP','Saipan',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('MQ','Martinique',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('MR','Mauritania',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('MS','Montserrat',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('MT','Malta',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('MU','Mauritius',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('MV','Maldives',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('MW','Malawi',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('MX','Mexico',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('MY','Malaysia',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('MZ','Mozambique',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('NA','Namibia',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('NC','New Caledonia',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('NE','Niger',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('NG','Nigeria',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('NI','Nicaragua',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('NL','Netherlands',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('NO','Norway',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('NP','Nepal',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('NZ','New Zealand',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('OM','Oman',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('PA','Panama',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('PE','Peru',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('PF','French Polynesia',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('PG','Papua New Guinea',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('PH','Philippines',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('PK','Pakistan',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('PL','Poland',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('PR','Puerto Rico',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('PT','Portugal',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('PW','Palau',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('PY','Paraguay',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('QA','Qatar',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('RE','Reunion Island',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('RO','Romania',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('RU','Russia',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('RW','Rwanda',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('SA','Saudi Arabia',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('SC','Seychelles',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('SE','Sweden',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('SG','Singapore',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('SI','Slovenia',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('SK','Slovak Republic',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('SL','Sierra Leone',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('SM','San Marino',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('SN','Senegal',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('SR','Suriname',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('SV','El Salvador',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('SY','Syria',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('SZ','Swaziland',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('TC','Turks & Caicos Is.',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('TD','Chad',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('TG','Togo',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('TH','Thailand',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('TM','Turkmenistan, Republic of',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('TN','Tunisia',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('TR','Turkey',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('TT','Trinidad & Tobago',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('TW','Taiwan',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('TZ','Tanzania',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('UA','Ukraine',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('UG','Uganda',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('UM','United States Minor Outlying Islands',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('US','U.S.A.',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('UY','Uruguay',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('UZ','Uzbekistan',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('VA','Vatican City',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('VC','St. Vincent',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('VE','Venezuela',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('VG','British Virgin Is.',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('VI','U.S. Virgin Islands',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('VN','Vietnam',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('VU','Vanuatu',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('WF','Wallis & Futuna Islands',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('YE','Yemen',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('ZA','South Africa',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('ZM','Zambia',0)

INSERT INTO TPays ([ID Pays], [Libelle Pays],[Devise Locale]) VALUES ('ZW','Zimbabwe',0)

*/

 

 

-- Modes Transport

INSERT INTO TModesTransport([ID Mode Transport], [Libelle Mode Transport])

VALUES (1,'Sea')

                ,(2,'Air')

                ,(3,'Road')

                ,(9,'Other')

 

-- Sens Trafic

INSERT INTO TSensTrafic([ID Sens Trafic], [Libelle Sens Trafic])

VALUES (1,'Import')

                ,(2,'Export')

 

-- Types Dossiers

INSERT INTO TTypesDossiers([Libelle Type Dossier], [Mode Transport], [Sens Trafic])

VALUES ('Sea Import',1,1)

                ,('Sea Export',1,2)

                ,('Air Import',2,1)

                ,('Air Export',2,2)

                ,('Road Import',3,1)

                ,('Road Export',3,2)

 

--Regimes Douaniers

SET IDENTITY_INSERT TRegimesDouaniers ON;

INSERT INTO TRegimesDouaniers([ID Regime Douanier], [Code Regime Douanier] ,[Libelle Regime Douanier])

VALUES (0,'', '-')

SET IDENTITY_INSERT TRegimesDouaniers OFF;

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('IM4','Mise à la consommation')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('DS1','Déclaration Simplifiée à l''Exportation')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('DS4','Déclaration Simplifiée à  l''Importation')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('EX1','Exportation définitive ou en simple sortie')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('EX2','Exportation temporaire')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('EX3','Réexportation')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('EX7','Mise en entrepôt d''une marchandise nationale à exporter')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('EX8','Transit national ou communautaire d''une marchandise à exporter')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('EX9','Autres procédures (avitaillement, comptoirs de vente,...)')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('EX-9','Avitaillement')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('IM0','Mise en libre pratique')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('IM5','Admission et Importation temporaires')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('IM6','Réimportation')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('IM7','Mise en entrepôt d''une marchandise importée')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('IM8','Transit national, communautaire ou international et transbordement ')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('IM9','Autres procédures (admission temporaire pour transformation sous douane,...)')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('LO1','Liquidation d''Office à  l''Exportation')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('LO4','Liquidation d''Office à l''Importation')

 

 

-- Regimes declarations

SET IDENTITY_INSERT TRegimesDeclarations ON;

INSERT INTO TRegimesDeclarations([ID Regime Declaration], [Regime Douanier] ,[Libelle Regime Declaration], [Taux DC])

VALUES (0,0, 'EXO',0)

SET IDENTITY_INSERT TRegimesDeclarations OFF;

INSERT INTO TRegimesDeclarations([Regime Douanier] ,[Libelle Regime Declaration], [Taux DC])

VALUES (0, '100% DC',1)

 

-- HS Codes

SET IDENTITY_INSERT THSCodes ON;

INSERT INTO THSCodes([ID HS Code], [HS Code] , [Libelle HS Code])

VALUES (0,'-','NO HS CODE')

SET IDENTITY_INSERT THSCodes OFF;

 

 

-- Codes etapes

SET IDENTITY_INSERT TCodesEtapes ON;

INSERT INTO TCodesEtapes ([ID Code Etape], [Libelle Etape], [Circuit Etape],[Suivi Duree], [Index Etape])

VALUES (0,'File Opening','',0,0)

SET IDENTITY_INSERT TCodesEtapes OFF;

INSERT INTO TCodesEtapes ([Libelle Etape], [Circuit Etape],[Suivi Duree], [Index Etape])

VALUES ('Operations Completed','',0,1000000)

 

--Utilisateurs

SET IDENTITY_INSERT TUtilisateurs ON;

INSERT INTO TUtilisateurs ([ID Utilisateur], [Code Utilisateur],[Nom Utilisateur])

VALUES (0,'','SYSTEM')

SET IDENTITY_INSERT TUtilisateurs OFF;

 

--Sessions

SET IDENTITY_INSERT TSessions ON;

INSERT INTO TSessions ([ID Session], [Utilisateur])

VALUES (0,0)

SET IDENTITY_INSERT TSessions OFF;

 

-- Permissions Base

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (0,'Permission 0',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (1,'Permission 1',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (2,'Permission 2',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (3,'Permission 3',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (4,'Permission 4',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (5,'Permission 5',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (6,'Permission 6',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (7,'Permission 7',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (8,'Permission 8',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (9,'Permission 9',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (10,'Permission 10',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (11,'Permission 11',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (12,'Permission 12',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (13,'Permission 13',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (14,'Permission 14',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (15,'Permission 15',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (16,'Permission 16',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (17,'Permission 17',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (18,'Permission 18',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (19,'Permission 19',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (20,'Permission 20',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (21,'Permission 21',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (22,'Permission 22',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (23,'Permission 23',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (24,'Permission 24',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (25,'Permission 25',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (26,'Permission 26',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (27,'Permission 27',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (28,'Permission 28',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (29,'Permission 29',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (30,'Permission 30',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (31,'Permission 31',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (32,'Permission 32',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (33,'Permission 33',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (34,'Permission 34',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (35,'Permission 35',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (36,'Permission 36',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (37,'Permission 37',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (38,'Permission 38',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (39,'Permission 39',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (40,'Permission 40',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (41,'Permission 41',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (42,'Permission 42',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (43,'Permission 43',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (44,'Permission 44',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (45,'Permission 45',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (46,'Permission 46',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (47,'Permission 47',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (48,'Permission 48',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (49,'Permission 49',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (50,'Permission 50',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (51,'Permission 51',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (52,'Permission 52',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (53,'Permission 53',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (54,'Permission 54',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (55,'Permission 55',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (56,'Permission 56',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (57,'Permission 57',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (58,'Permission 58',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (59,'Permission 59',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (60,'Permission 60',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (61,'Permission 61',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (62,'Permission 62',0)

 

-- Roles

SET IDENTITY_INSERT TRoles ON;

INSERT INTO TRoles([ID Role], [Libelle Role])

VALUES (0,'SYSTEM')

SET IDENTITY_INSERT TRoles OFF;

 

-- Permissions Roles

INSERT INTO TPermissonsRoles ([Role], [Permission])

SELECT 0, [ID Permission Base]

FROM TPermissionsBase

 

-- Roles Utilisateur

INSERT INTO TRolesUtilisateurs ([Utilisateur], [Role])

VALUES (0,0)

 

INSERT INTO TStatutsDossier ([ID Statut Dossier],[Libelle Statut Dossier])

VALUES (0,'Operations in progress')

                ,(-1,'Operations completed')

                ,(-2,'File Cancelled')