--==============================================================
-- TABLE: DMA_APPSYSTEM
--==============================================================
CREATE TABLE DMA_APPSYSTEM
(
	SYS_ID	VarChar(50),
	SYS_NAME	NVarChar(50),
	SYS_DESC	NVarChar(300),	
	SYS_TYPE	Int,
	SYS_CODE    VARCHAR(50),
	CREATE_USER	VarChar(50),
	CREATE_TIME	DateTime default getdate() Not NULL,
	STATE	Int,
	STR_1	VarChar(40),
	STR_2	VarChar(40),
	STR_3	VarChar(40),
	CLASS_ID	VarChar(40),
	CONSTRAINT P_DMA_APPSYSTEM PRIMARY KEY (SYS_ID) 
);
CREATE UNIQUE INDEX INDEX_SYS_CODE ON DMA_APPSYSTEM(
   SYS_CODE  ASC
);
--==============================================================
-- TABLE: DMA_DEVICE
--==============================================================
CREATE TABLE DMA_DEVICE
(
	DEV_ID	VarChar(50),
	SYS_ID	VarChar(50) NOT NULL,
	DEV_NAME	NVarChar(50),
	DEV_TYPE	Int,
	DEV_CODE	Varchar(50),
	DEV_DESC	NVarChar(300),
	HOST_NAME	NVarChar(50),
	IP_ADDRESS	VarChar(50),
	MAC_ADDRESS VarChar(50),
	FC_ADDRESS VarChar(50),
	CREATE_USER	VarChar(50),
	CREATE_TIME	DateTime default getdate() Not NULL,
	STATE INT,
	CONSTRAINT P_DMA_DEVICE PRIMARY KEY (DEV_ID) 
);
CREATE UNIQUE INDEX INDEX_DEV_CODE ON DMA_DEVICE(
   DEV_CODE  ASC
);
--==============================================================
-- TABLE: DMA_WEBSERVICE
--==============================================================
CREATE TABLE DMA_WEBSERVICE
(
	SERVICE_ID	VarChar(50),
	SYS_ID	VarChar(50) NOT NULL,
	SERVICE_NAME	NVarChar(50),
	SERVICE_CODE	VarChar(50),
	SERVICE_DESC	NVarChar(300),
	SERVICE_URL	NVarChar(300),	
	WSDL_PATH	NVarChar(300),	
	CREATE_USER	VarChar(50),
	CREATE_TIME	DateTime default getdate() Not NULL,
	STATE	Int,
	INT_1	Int,
	CONSTRAINT P_DMA_WEBSERVICE PRIMARY KEY (SERVICE_ID) 
);
CREATE UNIQUE INDEX INDEX_SERVICE_CODE ON DMA_WEBSERVICE(
   SERVICE_CODE  ASC
);
--======================================================================
--DMA_WEBACTION
--======================================================================
CREATE TABLE DMA_WEBACTION
(		
	ACTION_ID	VARCHAR(50) not null,
	SYS_CODE	VARCHAR(50) not null,
	ACTION_NAME	VARCHAR(100) not null,
	SERVICE_ID	VARCHAR(50) not null,
	METHOD_NAME	VARCHAR(100),
	ACTION_DESC	VARCHAR(300),
	CONSTRAINT P_DMA_WEBACTION PRIMARY KEY (ACTION_NAME) 
);
--==============================================================
-- TABLE: DMA_WEBINVOKE
--==============================================================
CREATE TABLE DMA_WEBINVOKE
(	
	INVOKE_ID	VarChar(50),
	REQUEST_ID	VarChar(50),	
	ACTION_NAME	VarChar(150),	
	SERVICE_URL Varchar(255),
	SOURCE_CODE	VarChar(50),
	TARGET_CODE	VarChar(50),
	USER_NAME	VarChar(50),
	USER_TOKEN	VarChar(50),
	REQUEST_TYPE	 int,
	REQUEST_TIME	DateTime,
	RESPONSE_TIME	DateTime,
	REQUEST_XML		NVarChar(max),
	RESPONSE_XML		NVarChar(max),	
	STATE	Int,	
	STATE_DESC		Varchar(500),	
	FIELD_1	Varchar(200),	
	FIELD_2	Varchar(200),	
	CONSTRAINT P_DMA_WEBINVOKE PRIMARY KEY (INVOKE_ID) 
);

CREATE INDEX IX_DMA_INVOKE_TIME ON DMA_WEBINVOKE (
   REQUEST_TIME         asc
);

