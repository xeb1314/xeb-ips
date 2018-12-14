--==============================================================
-- TABLE: DMA_APPSYSTEM
--==============================================================
CREATE TABLE DMA_APPSYSTEM
(
	SYS_ID	VARCHAR(50),
	SYS_NAME	VARCHAR2(50),
	SYS_DESC	VARCHAR2(300),	
	SYS_TYPE	Int,
	SYS_CODE    VARCHAR(50),
	CREATE_USER	VARCHAR(50),
	CREATE_TIME	DATE DEFAULT SYSDATE Not NULL,
	STATE	Int,
	STR_1	VARCHAR(40),
	STR_2	VARCHAR(40),
	STR_3	VARCHAR(40),
	CLASS_ID	VARCHAR(40),
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
	DEV_ID	VARCHAR(50),
	SYS_ID	VARCHAR(50) NOT NULL,
	DEV_NAME	VARCHAR2(50),
	DEV_TYPE	Int,
	DEV_CODE	VARCHAR(50),
	DEV_DESC	VARCHAR2(300),
	HOST_NAME	VARCHAR2(50),
	IP_ADDRESS	VARCHAR(50),
	MAC_ADDRESS VARCHAR(50),
	FC_ADDRESS VARCHAR(50),
	CREATE_USER	VARCHAR(50),
	CREATE_TIME	DATE DEFAULT SYSDATE Not NULL,
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
	SERVICE_ID	VARCHAR(50),
	SYS_ID	VARCHAR(50) NOT NULL,
	SERVICE_NAME	VARCHAR2(50),
	SERVICE_CODE	VARCHAR(50),
	SERVICE_DESC	VARCHAR2(300),
	SERVICE_URL	VARCHAR2(300),	
	WSDL_PATH	VARCHAR2(300),	
	CREATE_USER	VARCHAR(50),
	CREATE_TIME	DATE DEFAULT SYSDATE Not NULL,
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
	INVOKE_ID	VARCHAR(50),
	REQUEST_ID	VARCHAR(50),	
	ACTION_NAME	VARCHAR(150),	
	SERVICE_URL VARCHAR(255),
	SOURCE_CODE	VARCHAR(50),
	TARGET_CODE	VARCHAR(50),
	USER_NAME	VARCHAR(50),
	USER_TOKEN	VARCHAR(50),
	REQUEST_TYPE	 int,
	REQUEST_TIME	DATE,
	RESPONSE_TIME	DATE,
	REQUEST_XML		VARCHAR2(4000),
	RESPONSE_XML		VARCHAR2(4000),	
	STATE	Int,	
	STATE_DESC		VARCHAR(500),	
	FIELD_1	VARCHAR(200),	
	FIELD_2	VARCHAR(200),	
	CONSTRAINT P_DMA_WEBINVOKE PRIMARY KEY (INVOKE_ID) 
);

CREATE INDEX IX_DMA_INVOKE_TIME ON DMA_WEBINVOKE (
   REQUEST_TIME         asc
);

