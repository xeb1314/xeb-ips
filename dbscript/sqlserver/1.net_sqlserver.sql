
--==============================================================
-- TABLE: NET_OPERATORLOG
--==============================================================
CREATE TABLE NET_OPERATORLOG
(
   ID                   varchar(50)            NOT NULL,
   USER_ID              INTEGER                NOT NULL,
   USER_NAME            varchar(50)            NOT NULL,   
   HOST_NAME            VARCHAR(50),
   SYS_NAME             VARCHAR(50),
   IP_ADDRESS		VARCHAR(50),
   SYS_CODE				Int,
   LOG_LEVEL			Int,
   LOG_INFO				NVarChar(2000),
   DESCRIPTION          NVarChar(4000),
   LOG_TIME             DATETIME NOT NULL DEFAULT GETDATE(),
   CONSTRAINT P_NET_OPERATORLOG PRIMARY KEY (ID)
) ;
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
	LOGIN_TIME  datetime default(getdate()),
	LOGOUT_TIME	datetime default(getdate()),    
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
	CW_SYS      INT DEFAULT ((0)) NOT NULL,
	CW_TYPE       INT NOT NULL,
	CW_NAME       NVARCHAR (100) NULL,
	CW_CODE       VARCHAR (30) NULL,
	CW_DESC       NVARCHAR (200) NULL,
	FIELD_1         VARCHAR (100) NULL,
	FIELD_2         VARCHAR (100) NULL,
   CONSTRAINT P_NET_CTRLWORD PRIMARY KEY (CW_ID) 
);
--==============================================================
-- TABLE: NET_SEQUENCE
--==============================================================
if not exists (select 1
            from  sysobjects
           where  id = object_id('NET_SEQUENCE')
            and   type = 'U')
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
	STATE_DESC	NVarChar(200),
	UPDATE_TIME	DateTime default getdate() NOT NULL,
	CREATE_USER	VarChar(50),
	CREATE_TIME	DateTime default getdate() NOT NULL,
	FIELD_1	NVarChar(100),
	FIELD_2	NVarChar(100),
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
	LOG_DESC	NVarChar(500),
	TASK_ID	VarChar(50),
	TASK_STATE	Int,
	CREATE_USER	VarChar(50),
	CREATE_TIME	DateTime default getdate() NOT NULL,
	FIELD_1	NVarChar(100),
	FIELD_2	NVarChar(100),
	CONSTRAINT P_NET_SERVERLOG PRIMARY KEY (LOG_ID) 
);

CREATE INDEX IX_SERVERLOG_SERVER_ID ON NET_SERVERLOG(
   SERVER_ID  ASC
);

/*==============================================================*/
/* TABLE: UUM   NET_CTRLCLASS                                     */
/*==============================================================*/
CREATE TABLE NET_CTRLCLASS ( CLASS_ID NUMERIC(38,0)  NOT NULL ,PARENT_ID NUMERIC(38,0)  NULL ,CLASS_TYPE NUMERIC(38,0)  NOT NULL ,CLASS_NAME VARCHAR(50)  NOT NULL ,CLASS_LAYER VARCHAR(30)  NULL ,CLASS_DESC VARCHAR(100)  NULL ,VIEW_NAME VARCHAR(300)  NULL ,VIEW_VALUE VARCHAR(50)  NULL ,STATUS NUMERIC(2,0)  NULL ,FIELD_1 VARCHAR(100)  NULL ,FIELD_2 VARCHAR(100)  NULL ,FIELD_3 VARCHAR(100)  NULL ,CONSTRAINT PK__NET_CTRLCLASS__7C8480AE PRIMARY KEY (CLASS_ID ));

/*==============================================================*/
/* TABLE: UUM   NET_ERRORLOG                                     */
/*==============================================================*/
CREATE TABLE NET_ERRORLOG ( ID VARCHAR(50)  NOT NULL ,ERR_LEVEL NUMERIC(2,0)  NOT NULL ,USER_ID NUMERIC(15,0)  NULL ,USER_NAME VARCHAR(15)  NULL ,DESCRIPTION VARCHAR(4000)  NULL ,SYS_NAME VARCHAR(50)  NULL ,MODULE_NAME VARCHAR(100)  NULL ,LOG_TIME DATETIME  NOT NULL ,CONSTRAINT PK__NET_ERRORLOG__00551192 PRIMARY KEY (ID ));

/*==============================================================*/
/* TABLE: UUM_FUNCTION                                          */
/*==============================================================*/
CREATE TABLE UUM_FUNCTION ( ID NUMERIC(15,0)  NOT NULL ,PARENT_ID NUMERIC(15,0)  NULL ,NAME VARCHAR(50)  NULL ,PARAM VARCHAR(200)  NULL ,STATE NUMERIC(2,0)  NULL ,DESCRIPTION VARCHAR(200)  NULL ,TYPE NUMERIC(2,0)  NULL ,VIEW_POS NUMERIC(15,0)  NOT NULL ,VIEW_FLAG NUMERIC(15,0)  NULL ,IMAGES VARCHAR(100)  NULL ,OPEN_WIDTH VARCHAR(20)  NULL ,OPEN_HEIGHT VARCHAR(20)  NULL ,VTARGET VARCHAR(20)  NULL ,CONSTRAINT PK__UUM_FUNCTION__09DE7BCC PRIMARY KEY (ID ));

/*==============================================================*/
/* TABLE: UUM_ROLEAUTHORITY                                     */
/*==============================================================*/
CREATE TABLE UUM_ROLEAUTHORITY ( ROLE_ID NUMERIC(15,0)  NOT NULL ,FUNCTION_ID NUMERIC(15,0)  NOT NULL ,CONSTRAINT PK__UUM_ROLEAUTHORIT__117F9D94 PRIMARY KEY (FUNCTION_ID,ROLE_ID ));

/*==============================================================*/
/* TABLE: UUM_ROLE                                              */
/*==============================================================*/
CREATE TABLE UUM_ROLE ( ID NUMERIC(15,0)  NOT NULL ,NAME VARCHAR(50)  NULL ,CREATE_TIME DATETIME  NULL ,DESCRIPTION VARCHAR(200)  NULL ,TYPE NUMERIC(15,0)  NULL ,CONSTRAINT PK__UUM_ROLE__0F975522 PRIMARY KEY (ID ));

/*==============================================================*/
/* TABLE: UUM_USERGROUP                                         */
/*==============================================================*/
CREATE TABLE UUM_USERGROUP ( ID NUMERIC(15,0)  NOT NULL ,PARENT_ID NUMERIC(15,0)  NOT NULL ,NAME VARCHAR(50)  NOT NULL ,TYPE NUMERIC(2,0)  NOT NULL ,GROUP_CODE VARCHAR(50)  NULL ,DESCRIPTION VARCHAR(200)  NULL ,FOLDER_PATH VARCHAR(300)  NULL ,QUOTA_SIZE NUMERIC(15,0)  NULL ,QUOTA_USED NUMERIC(15,0)  NULL ,APP_PARAM VARCHAR(1000)  NULL ,FIELD_1 VARCHAR(100)  NULL ,FIELD_2 VARCHAR(100)  NULL ,CONSTRAINT PK__UUM_USERGROUP__15502E78 PRIMARY KEY (ID ));

/*==============================================================*/
/* TABLE: UUM_USERTOGROUP                                       */
/*==============================================================*/
CREATE TABLE UUM_USERTOGROUP ( USER_ID NUMERIC(15,0)  NOT NULL ,GROUP_ID NUMERIC(15,0)  NOT NULL ,USAGE_TYPE NUMERIC(2,0)  NULL ,CONSTRAINT PK__UUM_USERTOGROUP__173876EA PRIMARY KEY (GROUP_ID,USER_ID ));

/*==============================================================*/
/* TABLE: UUM_USERTOROLE                                        */
/*==============================================================*/
CREATE TABLE UUM_USERTOROLE ( ROLE_ID NUMERIC(15,0)  NOT NULL ,USER_ID NUMERIC(15,0)  NOT NULL ,CONSTRAINT PK__UUM_USERTOROLE__1920BF5C PRIMARY KEY (USER_ID,ROLE_ID ));

/*==============================================================*/
/* TABLE: UUM_USER                                              */
/*==============================================================*/
CREATE TABLE UUM_USER ( ID NUMERIC(15,0)  NOT NULL ,LOGIN_NAME VARCHAR(50)  NOT NULL ,USER_NAME VARCHAR(50)  NULL ,PASSWORD VARCHAR(50)  NULL ,PERSON_ID NUMERIC(15,0)  NULL ,USER_TYPE NUMERIC(15,0)  NULL ,USER_CARD VARCHAR(50)  NULL ,RIGHT_LEVEL NUMERIC(15,0)  NULL ,HOME_PATH VARCHAR(300)  NULL ,EMAIL VARCHAR(100)  NULL ,SEX NUMERIC(15,0)  NULL ,ADDRESS VARCHAR(200)  NULL ,BIRTHDAY DATETIME  NULL ,OFFICE_PHONE VARCHAR(50)  NULL ,HOME_PHONE VARCHAR(50)  NULL ,MOBILE_PHONE VARCHAR(50)  NULL ,DUTY_TITLE VARCHAR(50)  NULL ,QUOTA_SIZE NUMERIC(15,0)  NULL ,QUOTA_USED NUMERIC(15,0)  NULL ,APP_PARAM VARCHAR(1000)  NULL ,PHOTO_PATH VARCHAR(300)  NULL ,DESCRIPTION VARCHAR(200)  NULL ,CREATE_TIME DATETIME  NULL ,STATE NUMERIC(2,0)  NOT NULL ,FIELD_1 VARCHAR(5000)  NULL ,FIELD_2 VARCHAR(200)  NULL ,CONSTRAINT PK__UUM_USER__1367E606 PRIMARY KEY (ID ));

