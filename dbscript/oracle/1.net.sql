
--==============================================================
-- TABLE: NET_OPERATORLOG
--==============================================================
CREATE TABLE NET_OPERATORLOG
(
   ID                   VARCHAR2(50)            NOT NULL,
   USER_ID              NUMBER(10)                NOT NULL,
   USER_NAME            VARCHAR2(50)            NOT NULL,   
   HOST_NAME            VARCHAR2(50),
   SYS_NAME             VARCHAR2(50),
   IP_ADDRESS		        VARCHAR2(50),
   SYS_CODE				      NUMBER(10),
   LOG_LEVEL			      NUMBER(10),
   LOG_INFO				      NVARCHAR2(2000),
   DESCRIPTION          NVARCHAR2(500),
   LOG_TIME             DATE DEFAULT SYSDATE,
   CONSTRAINT P_NET_OPERATORLOG PRIMARY KEY (ID)
);
CREATE INDEX IX__OPERATORLOG_LOG_LEVEL ON NET_OPERATORLOG(
   LOG_LEVEL  ASC
);
--==============================================================
-- TABLE: NET_LOGINLOG
--==============================================================
CREATE TABLE NET_LOGINLOG
(
	ID	varchar(50) not null ,
	USER_ID		int	,
	LOGIN_NAME	varchar(50)	,
	LOGIN_TIME  DATE DEFAULT SYSDATE,
	LOGOUT_TIME	DATE DEFAULT SYSDATE, 
	DEVICE_NAME	varchar(50)	,
	HOST_NAME	varchar(50)	,
	IP_ADDRESS	varchar(30)	,
	STATE		int		,
	CONSTRAINT PK_UUM_LOGINLOG PRIMARY KEY (ID)
);
--==============================================================
-- TABLE: NET_SYSCONFIG
--==============================================================
CREATE TABLE NET_SYSCONFIG
(
   NAME               VARCHAR(50)            NOT NULL,
   DATA               VARCHAR(500),
   TYPE               INTEGER,
   VIEW_POS int,
   DESCRIPTION          VARCHAR(200),
   CONSTRAINT P_NET_SYSCONFIG PRIMARY KEY (NAME)
) ;
--==============================================================
-- TABLE: NET_CTRLWORD
--==============================================================
CREATE TABLE NET_CTRLWORD
(
	CW_ID         INT NOT NULL,
	CW_SYS        INT DEFAULT ((0)) NOT NULL,
	CW_TYPE       INT NOT NULL,
	CW_NAME       VARCHAR (100) NULL,
	CW_CODE       VARCHAR (30) NULL,
	CW_DESC       VARCHAR (200) NULL,
	FIELD_1         VARCHAR (100) NULL,
	FIELD_2         VARCHAR (100) NULL,
   CONSTRAINT P_NET_CTRLWORD PRIMARY KEY (CW_ID) 
);
--==============================================================
-- TABLE: NET_SEQUENCE
--==============================================================
CREATE TABLE NET_SEQUENCE
(
   TABLE_NAME         VARCHAR(50)            NOT NULL,
   SERIAL_NUMBER      INTEGER                NOT NULL,
   CONSTRAINT P_SEQUENCE PRIMARY KEY (TABLE_NAME)
) ;
--======================================================================
--NET_SERVER
--======================================================================
CREATE TABLE NET_SERVER
(
	SERVER_ID	VarChar(50) NOT NULL,
	SERVER_NAME	VarChar(50) NOT NULL,
	HOST_IP	VarChar(30),
	HOST_PORT Int,
	HOST_NAME	VarChar(50),
	SYS_NAME	VarChar(50),
	SYS_CODE	VarChar(50),
	SERVER_TYPE	Int,
	SUB_TYPE	Int,
	SET_MODE	Int,
	WORK_MODE	Int,
	WORK_STATE	Int,
	STATE_DESC	VarChar(200),
	UPDATE_TIME	DATE DEFAULT SYSDATE,
	CREATE_USER	VarChar(50),
	CREATE_TIME	DATE DEFAULT SYSDATE,
	FIELD_1	VarChar2(100),
	FIELD_2	VarChar(100),
	CONSTRAINT P_NET_SERVER PRIMARY KEY (SERVER_ID) 
);

--======================================================================
--NET_SERVERLOG
--======================================================================
CREATE TABLE NET_SERVERLOG
(
	LOG_ID	VarChar(50) NOT NULL,
	SERVER_ID	VarChar(50) NOT NULL,
	LOG_TYPE	Int NOT NULL,
	LOG_DESC	VarChar(500),
	TASK_ID	VarChar(50),
	TASK_STATE	Int,
	CREATE_USER	VarChar(50),
	CREATE_TIME	DATE DEFAULT SYSDATE,
	FIELD_1	VarChar(100),
	FIELD_2	VarChar(100),
	CONSTRAINT P_NET_SERVERLOG PRIMARY KEY (LOG_ID) 
);

CREATE INDEX IX_SERVERLOG_SERVER_ID ON NET_SERVERLOG(
   SERVER_ID  ASC
);

