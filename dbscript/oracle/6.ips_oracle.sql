/*==============================================================*/
/* TABLE: CM801_FILEGROUP                                       */
/*==============================================================*/
CREATE TABLE CM801_FILEGROUP (
   GROUP_ID             VARCHAR(40)          NOT NULL,
   CMOBJ_ID             VARCHAR(40)          NOT NULL,
   GROUP_TYPE           INT                  NOT NULL,
   CREATE_USER          VARCHAR2(50)         NOT NULL,
   CREATE_TIME          DATE DEFAULT SYSDATE NOT NULL,
   STR_1                VARCHAR(100)         NULL,
   STR_2                VARCHAR(100)         NULL,
   CONSTRAINT P_CM801_FILEGROUP PRIMARY KEY (GROUP_ID)
);

/*==============================================================*/
/* TABLE: CM801_FILEITEM                                        */
/*==============================================================*/
CREATE TABLE CM801_FILEITEM (
   FILE_ID              VARCHAR(40)          NOT NULL,
   GROUP_ID             VARCHAR(40)          NOT NULL,
   CMOBJ_ID             VARCHAR(40)          NOT NULL,
   FILE_TYPE            INT                  NOT NULL,
   SOURCE_PATH          VARCHAR(200)         NULL,
   SOURCE_FILENAME      VARCHAR(200)         NULL,
   DEST_PATH            VARCHAR(200)         NULL,
   DEST_FILENAME        VARCHAR(200)         NOT NULL,
   FILE_SIZE            VARCHAR(50)          NULL,
   FILE_MD              VARCHAR(50)          NULL,
   CREATE_TIME          DATE DEFAULT SYSDATE NOT NULL,
   STR_1                VARCHAR(100)         NULL,
   STR_2                VARCHAR(100)         NULL,
   CONSTRAINT P_CM801_FILEITEM PRIMARY KEY (FILE_ID)
);

CREATE INDEX IX_CM801_FILEITEM ON CM801_FILEITEM (
FILE_ID ASC,
GROUP_ID ASC,
CMOBJ_ID ASC
);

/*==============================================================*/
/* TABLE: CM801_MAILITEM                                        */
/*==============================================================*/
CREATE TABLE CM801_MAILITEM (
   MAIL_ID              VARCHAR(40)          NOT NULL,
   CMOBJ_ID             VARCHAR(40)          NOT NULL,
   FILE_ID              VARCHAR(40)          NOT NULL,
   CREATE_TIME          DATE DEFAULT SYSDATE NOT NULL ,
   MESSAGE_ID           VARCHAR(25)          NULL,
   MESSAGE_TYPE         INT                  NULL,
   INUNIT               VARCHAR(2)           NULL,
   INPERSON             VARCHAR(20)          NULL,
   INPOSITION           VARCHAR(2)           NULL,
   INSYSTEMTYPE         VARCHAR(2)           NULL,
   INEQUIPMENT          VARCHAR(16)          NULL,
   INTIME               DATE             NULL,
   STORE_ADDRESS        VARCHAR(50)          NULL,
   FILE_NAME            VARCHAR(30)          NULL,
   FILE_LENGTH          INT                  NULL,
   COUNTRY_CODE         VARCHAR(3)           NULL,
   ORG_CODE             VARCHAR(20)          NULL,
   READER               VARCHAR(20)          NULL,
   READ_TIME            DATE             NULL,
   IS_HIT               INT                  NULL,
   FROM_ADDR            VARCHAR(50)          NULL,
   TO_ADDR              VARCHAR(256)         NULL,
   SUBJECT              VARCHAR(256)         NULL,
   AFFIX_NUM            INT                  NULL,
   AFFIX_TYPE           VARCHAR(50)          NULL,
   AFFIX_NAME           VARCHAR(256)         NULL,
   LANG_CODE            VARCHAR(3)           NULL,
   CHARSET              VARCHAR(16)          NULL,
   ISENCRYPT            INT                  NULL,
   KEYWORDS             VARCHAR(60)          NULL,
   ABSTRACT             VARCHAR(256)         NULL,
   NAMEDENTITY          VARCHAR(256)         NULL,
   IP_VERSION           VARCHAR(1)           NULL,
   SRC_IP               VARCHAR(48)          NULL,
   DEST_IP              VARCHAR(48)          NULL,
   SRC_PORT             INT                  NULL,
   DEST_PORT            INT                  NULL,
   EMAIL_TYPE           VARCHAR(1)           NULL,
   MAIL_CONTENT         CLOB                 NULL,
   SEND_TIME            DATE             NULL,
   STR_1                VARCHAR(100)         NULL,
   STR_2                VARCHAR(100)         NULL,
   CONSTRAINT P_CM801_MAILITEM PRIMARY KEY (MAIL_ID)
);

CREATE INDEX IX_CM801_MAILITEM ON CM801_MAILITEM (
MAIL_ID ASC,
CMOBJ_ID ASC,
FILE_ID ASC
);

/*==============================================================*/
/* TABLE: CM801_OBJECT                                          */
/*==============================================================*/
CREATE TABLE CM801_OBJECT (
   CMOBJ_ID             VARCHAR(40)          NOT NULL,
   DS_ID                VARCHAR(40)          NOT NULL,
   NAME                 VARCHAR(50)          NULL,
   STATE                INT                  NULL,
   SOURCE_PATH			VARCHAR(200)		 NULL,
   DEST_PATH			VARCHAR(200)		 NULL,
   CREATE_USER          VARCHAR2(50)         NULL,
   CREATE_USERID        INT                  NOT NULL,
   CREATE_TIME          DATE DEFAULT SYSDATE ,
   STR_1                VARCHAR(100)         NULL,
   STR_2                VARCHAR(100)         NULL,
   MAINCMOBJ_ID         VARCHAR(40)         NULL,
   OBJ_TYPE               INT         		NULL,
   CONSTRAINT P_CM801_OBJECT PRIMARY KEY (CMOBJ_ID)
);

/*==============================================================*/
/* TABLE: CM802_OBJECT                                          */
/*==============================================================*/
CREATE TABLE CM802_OBJECT (
   CMOBJ_ID             VARCHAR(40)          NOT NULL,
   DS_ID                VARCHAR(40)          NULL,
   NAME                 VARCHAR(50)          NULL,
   STATE                INT                  NULL,
   CREATE_USER          VARCHAR(50)          NULL,
   CREATE_USERID        INT                  NOT NULL,
   CREATE_TIME          DATE DEFAULT SYSDATE NOT NULL,
   BEGINTIME            DATE             NULL,
   STYPE                VARCHAR2(500)        NULL,
   USERNAME             VARCHAR2(500)        NULL,
   PASSWORD             VARCHAR2(500)        NULL,
   IISCRACTED           INT                  NULL,
   CVALID               INT                  NULL,
   LINENO1              VARCHAR2(500)        NULL,
   LINENO2              VARCHAR2(500)        NULL,
   FILEID               VARCHAR2(500)        NULL,
   FILELEN              VARCHAR2(500)        NULL,
   FTPIP                VARCHAR2(500)        NULL,
   FROM_IP              VARCHAR2(1000)       NULL,
   TO_IP                VARCHAR2(500)        NULL,
   SFROMIP              VARCHAR2(500)        NULL,
   STOIP                VARCHAR2(500)        NULL,
   SOURE_PORT           VARCHAR(200)         NULL,
   DEST_PORT            VARCHAR(200)         NULL,
   LINENO3              VARCHAR(200)         NULL,
   LINENO4              VARCHAR(200)         NULL,
   GRADE0               VARCHAR(200)         NULL,
   GRADE1               VARCHAR(200)         NULL,
   PUNIT                VARCHAR(200)         NULL,
   XTYPE                VARCHAR(200)         NULL,
   DATAFROMSYS          VARCHAR(200)         NULL,
   PARTNO               VARCHAR(200)         NULL,
   DOWNLOADFILENAME     VARCHAR(200)         NULL,
   DATASERVERIP         VARCHAR(200)         NULL,
   FROMUSER             VARCHAR(200)         NULL,
   STR_1                VARCHAR(100)         NULL,
   STR_2                VARCHAR(100)         NULL,
   CONSTRAINT P_CM802_OBJECT PRIMARY KEY (CMOBJ_ID)
);

/*==============================================================*/
/* TABLE: CM803_OBJECT                                          */
/*==============================================================*/
CREATE TABLE CM803_OBJECT (
   CMOBJ_ID             VARCHAR(40)          NOT NULL,
   DS_ID                VARCHAR(40)          NULL,
   NAME                 VARCHAR(50)          NULL,
   STATE                INT                  NULL,
   CREATE_USER          VARCHAR(50)          NULL,
   CREATE_USERID        INT                  NOT NULL,
   CREATE_TIME          DATE DEFAULT SYSDATE NOT NULL,
   FIELD_1              VARCHAR(200)         NULL,
   TIME_1               DATE             NULL,
   FIELD_2              VARCHAR(200)         NULL,
   FIELD_3              VARCHAR(200)         NULL,
   FIELD_4              VARCHAR(200)         NULL,
   FIELD_5              VARCHAR(200)         NULL,
   FIELD_6              VARCHAR(200)         NULL,
   FIELD_7              VARCHAR(200)         NULL,
   FIELD_8              INT                  NULL,
   FIELD_9              VARCHAR(200)         NULL,
   FIELD_10             VARCHAR(200)         NULL,
   FIELD_11             VARCHAR(200)         NULL,
   FIELD_12             VARCHAR(200)         NULL,
   FIELD_13             VARCHAR(200)         NULL,
   FIELD_14             INT                  NULL,
   FIELD_15             INT                  NULL,
   FIELD_16             INT                  NULL,
   FIELD_17             INT                  NULL,
   FIELD_18             INT                  NULL,
   FIELD_19             INT                  NULL,
   FIELD_20             INT                  NULL,
   FIELD_21             INT                  NULL,
   FIELD_22             INT                  NULL,
   FIELD_23             INT                  NULL,
   FIELD_24             INT                  NULL,
   FIELD_25             INT                  NULL,
   FIELD_26             INT                  NULL,
   FIELD_27             INT                  NULL,
   FIELD_28             INT                  NULL,
   FIELD_29             INT                  NULL,
   FIELD_30             INT                  NULL,
   FIELD_31             INT                  NULL,
   FIELD_32             VARCHAR(200)         NULL,
   STR_1                VARCHAR(100)         NULL,
   STR_2                VARCHAR(100)         NULL,
   STR_3                CLOB                 NULL,
   STR_4                VARCHAR2(500)        NULL,
   STR_5                VARCHAR2(500)        NULL,
   INT_1                INT                  NULL,
   INT_2                INT                  NULL,
   INT_3                INT                  NULL,
   CONSTRAINT P_CM803_OBJECT PRIMARY KEY (CMOBJ_ID)
);

/*==============================================================*/
/* TABLE: CM810_FILEGROUP                                       */
/*==============================================================*/
CREATE TABLE CM810_FILEGROUP (
   GROUP_ID             VARCHAR(40)          NOT NULL,
   CMOBJ_ID             VARCHAR(40)          NOT NULL,
   GROUP_TYPE           INT                  NOT NULL,
   CREATE_USER          VARCHAR2(50)         NOT NULL,
   CREATE_TIME          DATE DEFAULT SYSDATE NOT NULL,
   STR_1                VARCHAR(100)         NULL,
   STR_2                VARCHAR(100)         NULL,
   CONSTRAINT P_CM810_FILEGROUP PRIMARY KEY (GROUP_ID)
);

/*==============================================================*/
/* TABLE: CM810_FILEITEM                                        */
/*==============================================================*/
CREATE TABLE CM810_FILEITEM (
   FILE_ID              VARCHAR(40)          NOT NULL,
   GROUP_ID             VARCHAR(40)          NOT NULL,
   CMOBJ_ID             VARCHAR(40)          NOT NULL,
   FILE_TYPE            INT                  NOT NULL,
   SOURCE_PATH          VARCHAR(200)         NULL,
   SOURCE_FILENAME      VARCHAR(200)         NULL,
   DEST_PATH            VARCHAR(200)         NULL,
   DEST_FILENAME        VARCHAR(200)         NOT NULL,
   FILE_SIZE            INT               NULL,
   FILE_MD              VARCHAR(50)          NULL,
   CREATE_TIME          DATE DEFAULT SYSDATE NOT NULL,
   STR_1                VARCHAR(100)         NULL,
   STR_2                VARCHAR(100)         NULL,
   CONSTRAINT P_CM810_FILEITEM PRIMARY KEY (FILE_ID)
);

CREATE INDEX IX_CM810_FILEITEM ON CM810_FILEITEM (
FILE_ID ASC,
GROUP_ID ASC,
CMOBJ_ID ASC
);

/*==============================================================*/
/* TABLE: CM810_OBJECT                                          */
/*==============================================================*/
CREATE TABLE CM810_OBJECT (
   CMOBJ_ID             VARCHAR(40)          NOT NULL,
   DS_ID                VARCHAR(40)          NULL,
   NAME                 VARCHAR(50)          NULL,
   STATE                INT                  NULL,
   CREATE_USER          VARCHAR(50)          NULL,
   CREATE_USERID        INT                  NOT NULL,
   CREATE_TIME          DATE DEFAULT SYSDATE NOT NULL,
   SUBJECT              VARCHAR(100)         NULL,
   TYPE                 INT                  NULL,
   IS_CONTENT           INT                  NULL,
   AUTHOR               VARCHAR(100)         NULL,
   CREATE_CONTENT_TIME  DATE             NULL,
   LAST_SAVED_TIME      DATE             NULL,
   FIELD_1              VARCHAR(100)         NULL,
   FIELD_2              VARCHAR(100)         NULL,
   FIELD_3              VARCHAR(100)         NULL,
   FIELD_4              VARCHAR(100)         NULL,
   FIELD_5              VARCHAR(100)         NULL,
   FIELD_6              INT                  NULL,
   FIELD_7              INT                  NULL,
   FIELD_8              INT                  NULL,
   FIELD_9              DATE             NULL,
   FIELD_10             DATE             NULL,
   STR_1                VARCHAR(100)         NULL,
   STR_2                VARCHAR(100)         NULL,
   CONSTRAINT P_CM810_OBJECT PRIMARY KEY (CMOBJ_ID)
);

/*==============================================================*/
/* TABLE: IPS_COMMMSG                                           */
/*==============================================================*/
CREATE TABLE IPS_COMMMSG (
   ID                   VARCHAR(40)          NOT NULL,
   MSG_ID               VARCHAR(40)          NULL,
   REPLY_ID             VARCHAR(40)          NULL,
   MSG_TYPE             VARCHAR(50)          NOT NULL,
   SRC_CODE             VARCHAR(50)          NOT NULL,
   SRC_URL              VARCHAR(50)          NULL,
   DST_URL              VARCHAR(50)          NULL,
   DST_CODE             VARCHAR(50)          NULL,
   USER_NAME            VARCHAR(50)          NULL,
   USER_TOKEN           VARCHAR(50)          NULL,
   SEND_TIME            VARCHAR(50)          NULL,
   SEND_MSG             CLOB                 NULL,
   SEND_RESULT          VARCHAR(500)         NULL,
   REPLY_MSG            CLOB                 NULL,
   REPLY_RESULT         VARCHAR(500)         NULL,
   HOST_NAME            VARCHAR(50)          NULL,
   LOG_TIME             DATE DEFAULT SYSDATE NULL,
   STATE                INT                  NULL,
   CONSTRAINT P_IPS_COMMMSG PRIMARY KEY (ID)
);

/*==============================================================*/
/* TABLE: IPS_CTRLCLASS                                         */
/*==============================================================*/
CREATE TABLE IPS_CTRLCLASS (
   CLASS_ID             VARCHAR(40)          NOT NULL,
   PARENT_ID            VARCHAR(40)          NULL,
   OBJ_TYPE             INT                  NOT NULL,
   CLASS_TYPE           INT                  NOT NULL,
   CLASS_NAME           VARCHAR(50)          NOT NULL,
   CLASS_LAYER          VARCHAR(30)          NULL,
   CLASS_DESC           VARCHAR(100)         NULL,
   VIEW_NAME            VARCHAR(300)         NULL,
   SUB_CLASSID          INT                  NULL,
   CREATE_USER          VARCHAR(50)          NULL,
   CREATE_TIME          DATE DEFAULT SYSDATE NULL,
   STR_1                VARCHAR(100)         NULL,
   CONSTRAINT P_IPS_CTRLCLASS PRIMARY KEY (CLASS_ID)
);

/*==============================================================*/
/* TABLE: IPS_CTRLWORD                                          */
/*==============================================================*/
CREATE TABLE IPS_CTRLWORD (
   CW_ID                VARCHAR(40)          NOT NULL,
   CW_TYPE              INT                  NOT NULL,
   CW_NAME              VARCHAR(100)         NOT NULL,
   CW_CODE              VARCHAR(30)          NULL,
   CW_DESC              VARCHAR(200)         NULL,
   CREATE_USER          VARCHAR(50)          NULL,
   CREATE_USERID        INT                  NOT NULL,
   CREATE_TIME          DATE DEFAULT SYSDATE NOT NULL,
   STR_1                VARCHAR(100)         NULL,
   CONSTRAINT P_IPS_CTRLWORD PRIMARY KEY (CW_ID)
);

/*==============================================================*/
/* TABLE: IPS_DATASOURCE
 * 添加 DB_TYPE -数据库类型 JFDB、GBase                                        */
/*==============================================================*/
CREATE TABLE IPS_DATASOURCE (
   DS_ID                VARCHAR(40)          NOT NULL,
   DS_UID               VARCHAR(40)          NULL,
   PARENT_ID            VARCHAR(40)          NULL,
   DS_NAME              VARCHAR2(200)        NOT NULL,
   DS_TYPE              INT                  NOT NULL,
   DS_CLASS             INT                  NOT NULL,
   STATE                INT                  NOT NULL,
   DS_PARAM             VARCHAR(3000)        NOT NULL,
   CREATE_USER          VARCHAR2(50)         NULL,
   CREATE_USERID        INT                  NOT NULL,
   CREATE_TIME          DATE DEFAULT SYSDATE NOT NULL,
   UPDATE_USER          VARCHAR2(50)         NULL,
   UPDATE_USERID        INT                  NULL,
   UPDATE_TIME          DATE             NULL,
   DS_DESC              VARCHAR(300)         NULL,
   STR_1                VARCHAR(100)         NULL,
   STR_2                VARCHAR(3000)        NULL,
   STR_3                VARCHAR(3000)        NULL,
   DB_TYPE				VARCHAR(40)			 NULL,
   CONSTRAINT P_IPS_DATASOURCE PRIMARY KEY (DS_ID)
);

/*==============================================================*/
/* TABLE: IPS_DATATOGROUP                                        */
/*==============================================================*/
CREATE TABLE IPS_DATATOGROUP (
   DS_ID                VARCHAR(40)          NOT NULL,
   GROUP_ID              NUMBER(10)          NOT NULL,
   CONSTRAINT P_IPS_DATATOGROUP PRIMARY KEY (DS_ID, GROUP_ID)
);

/*==============================================================*/
/* TABLE: IPS_DEVICE                                            */
/*==============================================================*/
CREATE TABLE IPS_DEVICE (
   DEV_ID               VARCHAR(50)          NOT NULL,
   SYS_ID               VARCHAR(50)          NOT NULL,
   DEV_NAME             VARCHAR(50)          NOT NULL,
   DEV_CODE             VARCHAR(50)          NULL,
   DEV_TYPE             INT                  NOT NULL,
   STATE                INT                  NOT NULL,
   DEV_DESC             VARCHAR(300)         NULL,
   SERVICE_URL          VARCHAR(300)         NULL,
   TASK_PARAM           VARCHAR(3000)        NULL,
   CREATE_USER          VARCHAR2(50)         NULL,
   CREATE_USERID        INT                  NOT NULL,
   CREATE_TIME          DATE DEFAULT SYSDATE NOT NULL ,
   ACT_ID               INT                  NULL,
   UPDATE_USER          VARCHAR2(50)         NULL,
   UPDATE_USERID        INT                  NULL,
   UPDATE_TIME          DATE             NULL,
   STR_1                VARCHAR(100)         NULL,
   STR_2                VARCHAR(100)         NULL,
   CONSTRAINT P_IPS_DEVICE PRIMARY KEY (DEV_ID)
);

/*==============================================================*/
/* TABLE: IPS_JOB                                               */
/*==============================================================*/
CREATE TABLE IPS_JOB (
   JOB_ID               VARCHAR(40)          NOT NULL,
   JOB_NAME            	VARCHAR2(200)        NOT NULL,
   JOB_DESC             VARCHAR(300)         NULL,
   CREATE_USER          VARCHAR(50)          NULL,
   CREATE_USERID        INT                  NOT NULL,
   CREATE_TIME          DATE DEFAULT SYSDATE NOT NULL ,
   UPDATE_USER          VARCHAR(50)          NULL,
   UPDATE_USERID        INT                  NULL,
   UPDATE_TIME          DATE             NULL,
   CONSTRAINT P_IPS_JOB PRIMARY KEY (JOB_ID)
);

/*==============================================================*/
/* TABLE: IPS_MESSINFO                                          */
/*==============================================================*/
CREATE TABLE IPS_MESSINFO (
   MSG_ID               VARCHAR(40)          NOT NULL,
   ORDER_ID             VARCHAR(40)          NOT NULL,
   ENTITY_ID            VARCHAR(40)          NOT NULL,
   STATE                INT                  NULL,
   CREATE_USER          VARCHAR2(50)         NULL,
   CREATE_USERID        INT                  NOT NULL,
   CREATE_TIME          DATE DEFAULT SYSDATE NOT NULL ,
   CONSTRAINT P_IPS_MESSINFO PRIMARY KEY (MSG_ID)
);

CREATE INDEX IX_IPS_MESSINFO ON IPS_MESSINFO (
MSG_ID ASC,
ORDER_ID ASC,
ENTITY_ID ASC
);

/*==============================================================*/
/* TABLE: IPS_ORDER                                             */
/*==============================================================*/
CREATE TABLE IPS_ORDER (
   ORDER_ID             VARCHAR(40)          NOT NULL,
   ORDER_NAME           VARCHAR2(200)          NULL,
   DS_ID				VARCHAR(40)          NOT NULL,
   ORDERUSER_ID         INT                  NULL,
   ORDER_TYPE           INT                  NULL,
   ORDER_INFO           VARCHAR(4000)        NULL,
   NOTIFY_URL			varchar(300)		 NULL,
   INT_1				INT					 NULL,
   STR_1				VARCHAR(40)			 NULL,
   EXEC_TIME          DATE             NULL,
   CONSTRAINT P_IPS_ORDER PRIMARY KEY (ORDER_ID)
);

/*==============================================================*/
/* TABLE: IPS_ORDERINFO                                         */
/*==============================================================*/
CREATE TABLE IPS_ORDERINFO (
   OINFO_ID             VARCHAR(40)          NOT NULL,
   ORDER_ID             VARCHAR(40)          NOT NULL,
   TYPE                 INT                  NULL,
   CLASS_TYPE           INT                  NULL,
   CLASS_ID             VARCHAR(40)          NULL,
   CONTENT              VARCHAR(50)          NULL,
   INFO_POSITION        INT                  NULL,
   CLASS_POSITION       INT                  NULL,
   CONSTRAINT P_IPS_ORDERINFO PRIMARY KEY (OINFO_ID)
);

CREATE INDEX IX_IPS_ORDERINFO ON IPS_ORDERINFO (
OINFO_ID ASC,
ORDER_ID ASC
);

/*==============================================================*/
/* TABLE: IPS_SYSTEM                                            */
/*==============================================================*/
CREATE TABLE IPS_SYSTEM (
   SYS_ID               VARCHAR(40)          NOT NULL,
   SYS_NAME             VARCHAR(100)         NOT NULL,
   SYS_DESC             VARCHAR(300)         NULL,
   SYS_TYPE             INT                  NULL,
   SYS_CODE             VARCHAR(50)          NULL,
   STATE                INT                  NOT NULL,
   CREATE_USER          VARCHAR2(50)         NULL,
   CREATE_USERID        INT                  NOT NULL,
   CREATE_TIME          DATE DEFAULT SYSDATE NOT NULL,
   UPDATE_USER          VARCHAR2(50)         NULL,
   UPDATE_USERID        INT                  NULL,
   UPDATE_TIME          DATE             NULL,
   CLASS_ID             VARCHAR(40)          NULL,
   BUS_TYPE             VARCHAR(40)          NULL,
   UNIT                 VARCHAR(40)          NULL,
   LOCATION             VARCHAR(40)          NULL,
   CONSTRAINT P_IPS_SYSTEM PRIMARY KEY (SYS_ID)
);

/*==============================================================*/
/* TABLE: IPS_TASK                                              */
/*==============================================================*/
CREATE TABLE IPS_TASK (
   TASK_ID              VARCHAR(40)          NOT NULL,
   TASK_NAME            VARCHAR2(200)        NOT NULL,
   TASK_DESC            VARCHAR(300)         NULL,
   JOB_ID               VARCHAR(40)          NULL,
   PROCTEMPLATE_ID      VARCHAR(40)          NULL,
   PROC_ID              INT                  NULL,
   CLASS_ID             VARCHAR(40)          NOT NULL,
   DS_ID                VARCHAR(40)          NULL,
   TASK_CODE            VARCHAR(40)          NULL,
   TASK_TYPE            INT                  NOT NULL,
   TASK_STATE           INT                  NULL,
   CREATE_USER          VARCHAR2(50)         NULL,
   CREATE_USERID        INT                  NOT NULL,
   CREATE_TIME          DATE DEFAULT SYSDATE NOT NULL ,
   UPDATE_USER          VARCHAR2(50)         NULL,
   UPDATE_USERID        INT                  NULL,
   UPDATE_TIME          DATE             NULL,
   STR_1                VARCHAR(100)         NULL,
   STR_2                VARCHAR(100)         NULL,
   TASK_PARAM			VARCHAR(2000)		 NULL,
   CONSTRAINT P_IPS_TASK PRIMARY KEY (TASK_ID)
);
/*==============================================================*/
/* TABLE: CM801_OBJTASK                                              */
/*==============================================================*/
CREATE TABLE CM801_OBJTASK (
   OBJTASK_ID		VARCHAR(40)          NOT NULL,
   WFTASK_ID		VARCHAR(40)          NOT NULL,
   OBJ_ID             VARCHAR(40)          NOT NULL,
   PROCACT_ID         VARCHAR(40)          NOT NULL,
   DS_ID				VARCHAR(40)		NULL,
   EXEC_COUNT        INT          NOT NULL,
   STR_1              VARCHAR(50)         NULL,
   FAIL_COUNT INT  DEFAULT 0,
   IPSTASK_ID 		VARCHAR(40)			NULL,
   PROC_ID			INT           NULL,
   ACT_ID			INT           NULL,
   FINISHED_TIME    DATE DEFAULT SYSDATE NULL ,
   PROCACT_NAME      VARCHAR(100)         NULL,
   CONSTRAINT P_CM801_OBJTASK PRIMARY KEY (OBJTASK_ID)
);

CREATE INDEX IX_T_CM801_OBJTASK ON CM801_OBJTASK (
	IPSTASK_ID ASC
);


INSERT INTO NET_SEQUENCE(TABLE_NAME,SERIAL_NUMBER) VALUES('IPS_CTRLWORD',160.0);

/*==============================================================*/
/* TABLE: IPS_ALARMCONTACTS
 * 告警联系人表，存储 黑白名单
 * */
/*==============================================================*/
CREATE TABLE IPS_ALARMCONTACTS (
	ALARMOBJ_ID VARCHAR(40) NOT NULL,
	ALARM_TYPE INT NULL,
	EMAIL VARCHAR(100) NULL,
	IP VARCHAR(20) NULL,
	PHONE VARCHAR(20) NULL,
	NAME VARCHAR(20) NULL,
	STR_1 VARCHAR(100) NULL,
	STR_2 VARCHAR(100) NULL,
	STR_3 VARCHAR(100) NULL,
	STR_4 VARCHAR(2000) NULL,
	CONSTRAINT P_IPS_ALARMCONTACTS PRIMARY KEY (ALARMOBJ_ID)
);

/*==============================================================*/
/* TABLE: IPS_TASKRULEPARAM
 * 采集任务对应的配控规则表 
 * */
/*==============================================================*/
CREATE TABLE IPS_TASKRULEPARAM (
	ID VARCHAR(40) NOT NULL,
	TASK_ID VARCHAR(40) NOT NULL,
	RULE_NAME VARCHAR(200),
	PARAM VARCHAR(1000),
	TEMPLATE_ID VARCHAR(40),
	CREATE_TIME   DATE   DEFAULT SYSDATE NOT NULL,
	CONSTRAINT P_IPS_TASKRULEPARAM PRIMARY KEY (ID)
);

/*==============================================================*/
/* TABLE: IPS_GATHTERSTAT
 * 存储采集系统反馈的采集状态信息。 
 * */
/*==============================================================*/
CREATE TABLE IPS_GATHTERSTAT (
	STAT_ID VARCHAR(40) NOT NULL,
	TASK_ID VARCHAR(40) NOT NULL,
	PATH VARCHAR2(400),
	AMOUNT FLOAT,
	STAT_TIME          DATE,
	CONSTRAINT P_IPS_GATHTERSTAT PRIMARY KEY (STAT_ID)
);

CREATE INDEX IX_TSA_IPS_GATHTERSTAT ON IPS_GATHTERSTAT (
	TASK_ID ASC,
	STAT_TIME ASC,
	AMOUNT ASC
);

/*==============================================================*/
/* TABLE: IPS_GATHTERRESSTAT
 * 存储采集系统收到采集任务后反馈信息。
 * */
/*==============================================================*/
CREATE TABLE IPS_GATHTERRESSTAT (
	STAT_ID VARCHAR(40) NOT NULL,
	TASK_ID VARCHAR(40) NOT NULL,
	PATH VARCHAR2(400),
	ZHENDI VARCHAR2(100),
	DANWEI VARCHAR2(100),
	SHOUDUAN VARCHAR2(100),
	STAT_TIME          DATE,
	CONSTRAINT P_IPS_GATHTERRESSTAT PRIMARY KEY (STAT_ID)
);

CREATE TABLE UI_HISTORY (
   Id             VARCHAR(50)		 NOT NULL,
   RecordID       VARCHAR(50)        NOT NULL,
   DataType       VARCHAR(50)		 NOT NULL,
   TableName      VARCHAR(50)		 NOT NULL,
   DbType         VARCHAR(50)		 NOT NULL,
   UserID         INT				 NOT NULL,
   Operation      INT          		 NOT NULL,
   TranslationId  VARCHAR(50)        NOT NULL,
   CreatAt        DATE         	 NOT NULL,
   CONSTRAINT P_UI_HISTORY PRIMARY KEY (Id)
);

/*==============================================================*/
/* TABLE: IPS_TEMINALOPERATIONSTAT
 * 存储终端系统收到操作反馈信息。
 * */
/*==============================================================*/
CREATE TABLE IPS_TEMINALOPERATIONSTAT (
	STAT_ID VARCHAR(40) NOT NULL,
	DATATYPE VARCHAR2(50),
	TABLENAME VARCHAR2(50),
	RECORDID VARCHAR2(50),
	OPERATION VARCHAR2(50),
	OPERATIONTIME DATE,
	IP VARCHAR2(100),
	REPORTTITLE VARCHAR2(4000),
	REPORTSID VARCHAR2(50),
	REPORTTIME DATE,
	USER_ID NUMBER(10),
	USER_NAME VARCHAR2(50),
	LOGIN_NAME VARCHAR(50),
	GROUP_ID NUMBER(10),
	GROUP_NAME VARCHAR2(50),
	GROUP_CODE VARCHAR(50),
	CREATE_TIME  DATE DEFAULT SYSDATE NOT NULL ,
	CONSTRAINT P_IPS_TEMINALOPERATIONSTAT PRIMARY KEY (STAT_ID)
);

/*==============================================================*/
/* TABLE: IPS_DATATSOURCELABEL
 * 数据源标签表。
 * */
/*==============================================================*/
CREATE TABLE IPS_DATATSOURCELABEL(
	ID varchar(40) NOT NULL,
	DS_ID varchar(40) NULL,
	TYPE INT NULL,
	CW_IDS varchar(1000) NULL,
	LAYER INT NULL,
    CONSTRAINT PK_IPS_DATATSOURCELABEL PRIMARY KEY (ID)
 );
 
/*==============================================================*/
/* TABLE: IPS_DSLABELTOUSERGROUP                                  */
/*==============================================================*/
CREATE TABLE IPS_DSLABELTOUSERGROUP (
 DS_LABELID VARCHAR(40)  NOT NULL ,
 GROUP_ID NUMBER(10)  NOT NULL ,
 CONSTRAINT PK__IPS_DSLABELTOUSERGROUP PRIMARY KEY (DS_LABELID,GROUP_ID )
 );
 