/*==============================================================*/
/* TABLE: UUM   NET_CTRLCLASS                                     */
/*==============================================================*/
CREATE TABLE NET_CTRLCLASS 
( 
	CLASS_ID 		NUMBER(10)  	NOT NULL ,
	PARENT_ID 		NUMBER(10)  	NULL ,
	CLASS_TYPE 		NUMBER(10)  	NOT NULL ,
	CLASS_NAME 		VARCHAR(50)  	NOT NULL ,
	CLASS_LAYER 	VARCHAR(30)  	NULL ,
	CLASS_DESC 		VARCHAR(100)  	NULL ,
	VIEW_NAME 		VARCHAR(300)  	NULL ,
	VIEW_VALUE 		VARCHAR(50)  	NULL ,
	STATUS 			NUMBER(2)  	    NULL ,
	FIELD_1 		VARCHAR(100)  	NULL ,
	FIELD_2 		VARCHAR(100)  	NULL ,
	FIELD_3 		VARCHAR(100)  	NULL ,
	CONSTRAINT PK__NET_CTRLCLASS__7C8480AE PRIMARY KEY (CLASS_ID )
);

/*==============================================================*/
/* TABLE: UUM   NET_ERRORLOG                                     */
/*==============================================================*/
CREATE TABLE NET_ERRORLOG 
( 
	ID 				VARCHAR(50)  	NOT NULL ,
	ERR_LEVEL 		NUMBER(2)  	    NOT NULL ,
	USER_ID 		NUMBER(10)  	NULL ,
	USER_NAME 		VARCHAR(15)  	NULL ,
	DESCRIPTION 	VARCHAR(4000)  	NULL ,
	SYS_NAME 		VARCHAR(50)  	NULL ,
	MODULE_NAME 	VARCHAR(100)  	NULL ,
	LOG_TIME 		DATE  			NOT NULL ,
	CONSTRAINT PK__NET_ERRORLOG__00551192 PRIMARY KEY (ID )
);

/*==============================================================*/
/* TABLE: UUM_FUNCTION                                          */
/*==============================================================*/
CREATE TABLE UUM_FUNCTION 
(
	ID 				NUMBER(10)  		NOT NULL ,
	PARENT_ID 		NUMBER(10)  		NULL ,
	NAME 			VARCHAR(50)  		NULL ,
	PARAM 			VARCHAR(200)  		NULL ,
	STATE 			NUMBER(20)  		NULL ,
	DESCRIPTION 	VARCHAR(200)  		NULL ,
	TYPE 			NUMBER(20)  		NULL ,
	VIEW_POS 		NUMBER(10)  		NOT NULL ,
	VIEW_FLAG 		NUMBER(10)  		NULL ,
	IMAGES 			VARCHAR(100)  		NULL ,
	OPEN_WIDTH 		VARCHAR(20)  		NULL ,
	OPEN_HEIGHT 	VARCHAR(20)  		NULL ,
	VTARGET 		VARCHAR(20)  		NULL ,
	CONSTRAINT PK__UUM_FUNCTION__09DE7BCC PRIMARY KEY (ID )
);

/*==============================================================*/
/* TABLE: UUM_ROLEAUTHORITY                                     */
/*==============================================================*/
CREATE TABLE UUM_ROLEAUTHORITY 
( 
	ROLE_ID 		NUMBER(10)  NOT NULL ,
	FUNCTION_ID 	NUMBER(10)  NOT NULL ,
	CONSTRAINT PK__UUM_ROLEAUTHORIT__117F9D94 PRIMARY KEY (FUNCTION_ID,ROLE_ID )
);

/*==============================================================*/
/* TABLE: UUM_ROLE                                              */
/*==============================================================*/
CREATE TABLE UUM_ROLE 
( 	
	ID 				NUMBER(10)  			NOT NULL ,
	NAME 			VARCHAR(50)  			NULL ,
	CREATE_TIME 	DATE  				NULL ,
	DESCRIPTION 	VARCHAR(200)  			NULL ,
	TYPE 			NUMBER(10)  	     	NULL ,
	CONSTRAINT PK__UUM_ROLE__0F975522 PRIMARY KEY (ID )
);

/*==============================================================*/
/* TABLE: UUM_USERGROUP                                         */
/*==============================================================*/
CREATE TABLE UUM_USERGROUP 
(
	ID 				NUMBER(10)  		NOT NULL ,
	PARENT_ID 		NUMBER(10)  		NOT NULL ,
	NAME 			VARCHAR(50)  		NOT NULL ,
	TYPE 			NUMBER(2)  		    NOT NULL ,
	GROUP_CODE 		VARCHAR(50)  		NULL ,
	DESCRIPTION 	VARCHAR(200)  		NULL ,
	FOLDER_PATH 	VARCHAR(300)  		NULL ,
	QUOTA_SIZE 		NUMBER(10)  		NULL ,
	QUOTA_USED 		NUMBER(10)  		NULL ,
	APP_PARAM 		VARCHAR(1000)  		NULL ,
	FIELD_1 		VARCHAR(100)  		NULL ,
	FIELD_2 		VARCHAR(100)  		NULL ,
	CONSTRAINT PK__UUM_USERGROUP__15502E78 PRIMARY KEY (ID )
);

/*==============================================================*/
/* TABLE: UUM_USERTOGROUP                                       */
/*==============================================================*/
CREATE TABLE UUM_USERTOGROUP 
( 
	USER_ID 		NUMBER(10)  	NOT NULL ,
	GROUP_ID 		NUMBER(10)  	NOT NULL ,
	USAGE_TYPE 		NUMBER(10)  	NULL ,
	CONSTRAINT PK__UUM_USERTOGROUP__173876EA PRIMARY KEY (GROUP_ID,USER_ID )
);

/*==============================================================*/
/* TABLE: UUM_USERTOROLE                                        */
/*==============================================================*/
CREATE TABLE UUM_USERTOROLE 
( 
	ROLE_ID 		NUMBER(10)  	NOT NULL ,
	USER_ID 		NUMBER(10)  	NOT NULL ,
	CONSTRAINT PK__UUM_USERTOROLE__1920BF5C PRIMARY KEY (USER_ID,ROLE_ID )
);

/*==============================================================*/
/* TABLE: UUM_USER                                              */
/*==============================================================*/
CREATE TABLE UUM_USER 
( 	ID 				NUMBER(10)  	NOT NULL ,
	LOGIN_NAME 		VARCHAR(50)  	NOT NULL ,
	USER_NAME 		VARCHAR(50)  	NULL ,
	PASSWORD 		VARCHAR(50)  	NULL ,
	PERSON_ID		NUMBER(10)  	NULL ,
	USER_TYPE 		NUMBER(10)  	NULL ,
	USER_CARD 		VARCHAR(50)  	NULL ,
	RIGHT_LEVEL		NUMBER(10) 	    NULL ,
	HOME_PATH 		VARCHAR(300)  	NULL ,
	EMAIL 			VARCHAR(100)  	NULL ,
	SEX 			NUMBER(10)  	NULL ,
	ADDRESS 		VARCHAR(200)  	NULL ,
	BIRTHDAY 		DATE  		NULL ,
	OFFICE_PHONE 	VARCHAR(50)  	NULL ,
	HOME_PHONE 		VARCHAR(50)  	NULL ,
	MOBILE_PHONE 	VARCHAR(50)  	NULL ,
	DUTY_TITLE 		VARCHAR(50)  	NULL ,
	QUOTA_SIZE 		NUMBER(10)  	NULL ,
	QUOTA_USED 		NUMBER(10)  	NULL ,
	APP_PARAM 		VARCHAR(1000)  	NULL ,
	PHOTO_PATH 		VARCHAR(300)  	NULL ,
	DESCRIPTION 	VARCHAR(200)  	NULL ,
	CREATE_TIME 	DATE  		NULL ,
	STATE 			NUMBER(2)  	    NOT NULL ,
	FIELD_1 		VARCHAR(2000)  	NULL ,
	FIELD_2 		VARCHAR(200)  	NULL ,
	CONSTRAINT PK__UUM_USER__1367E606 PRIMARY KEY (ID )
);