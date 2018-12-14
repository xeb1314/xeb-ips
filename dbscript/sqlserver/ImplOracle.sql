-- Create table
create table ALL_AFFIX
(
  ID        VARCHAR2(100) not null,
  AFFIXTYPE VARCHAR2(100),
  SID       VARCHAR2(100),
  AFFIXTEXT CLOB,
  AFFIXPATH VARCHAR2(500),
  AFFIXSIZE NUMBER(10),
  AFFIXNAME VARCHAR2(500),
  SEQ       NUMBER,
  TABLENAME VARCHAR2(100)
)
tablespace USERS
  pctfree 10
  initrans 1
  maxtrans 255
  storage
  (
    initial 64
    next 8
    minextents 1
    maxextents unlimited
  );
-- Create/Recreate primary, unique and foreign key constraints 
alter table ALL_AFFIX
  add constraint ALL_AFFIX_PK primary key (ID)
  using index 
  tablespace USERS
  pctfree 10
  initrans 2
  maxtrans 255
  storage
  (
    initial 64K
    next 1M
    minextents 1
    maxextents unlimited
  );

  -- Create table
create table ALL_PLO
(
  SID     VARCHAR2(2000) not null,
  TYPE    VARCHAR2(50),
  PID     VARCHAR2(100) not null,
  WORD    VARCHAR2(2000),
  POS     NUMBER(11),
  PLOTYPE VARCHAR2(50)
)
tablespace USERS
  pctfree 10
  initrans 1
  maxtrans 255
  storage
  (
    initial 64
    next 8
    minextents 1
    maxextents unlimited
  );
-- Create/Recreate primary, unique and foreign key constraints 
alter table ALL_PLO
  add constraint ALL_PLO_PK primary key (SID)
  using index 
  tablespace USERS
  pctfree 10
  initrans 2
  maxtrans 255
  storage
  (
    initial 64K
    next 1M
    minextents 1
    maxextents unlimited
  );

  -- Create table
create table T_DOC
(
  STEXTTYPE            VARCHAR2(6) not null,
  SSUBJECT             VARCHAR2(500),
  SLANGCODE            VARCHAR2(3),
  SCHARSET             VARCHAR2(16),
  NSECRET              NUMBER(11),
  SKEYWORDS            VARCHAR2(60),
  SABSTRACT            VARCHAR2(1000),
  NIMPORT              NUMBER(11),
  SID                  VARCHAR2(100) not null,
  SINSYSTEMTYPE        VARCHAR2(2) not null,
  SINUNIT              VARCHAR2(2) not null,
  SINPOSITION          VARCHAR2(11) not null,
  DINTIME              DATE not null,
  NMESSAGETYPE         NUMBER(11) not null,
  SFILENAME            VARCHAR2(256) not null,
  SSTOREADDRESS        VARCHAR2(256) not null,
  NFILELEN             NUMBER(11),
  SINPERSON            VARCHAR2(20),
  SINEQUIPMENT         VARCHAR2(8) not null,
  SCOUNTRYCODE         VARCHAR2(3),
  SORGCODE             VARCHAR2(20),
  NENCRYPTTIMES        NUMBER(11),
  SENCRYPTTYPE         VARCHAR2(64),
  SNETATTOBJNUM        VARCHAR2(12),
  SREADER              VARCHAR2(20),
  DREADTIME            DATE,
  NPROCESSFLAG         NUMBER(11),
  NIPVERSION           NUMBER(11),
  SSRCIP               VARCHAR2(48),
  SDESTIP              VARCHAR2(48),
  NSOURCE_PORT         NUMBER(11),
  NDEST_PORT           NUMBER(11),
  SFROMIP              VARCHAR2(200),
  STOIP                VARCHAR2(200),
  NLINEGRADE           NUMBER(11),
  SVSATCALLINGSTATNO   VARCHAR2(16),
  SVSATCALLEDSTATNO    VARCHAR2(16),
  SNETNAME             VARCHAR2(40),
  NUSERCHANNELNO       NUMBER(11),
  SLINENUM             VARCHAR2(40) not null,
  NSWITCHTYPE          NUMBER(11),
  SDATATYPE            VARCHAR2(40),
  SDIRECTION           VARCHAR2(40),
  SZRELATIONDEPARTMENT VARCHAR2(50),
  SCRELATIONDEPARTMENT VARCHAR2(50),
  SZCALLLETTERS        VARCHAR2(40),
  SDCALLLETTERS        VARCHAR2(40),
  NFREQUENCY           NUMBER(11) not null,
  SRCVMANNER           VARCHAR2(40),
  SCOMMANNER           VARCHAR2(40),
  SMESSAGELEVEL        VARCHAR2(20),
  SSTAIONID            VARCHAR2(20),
  DREPORTTIME          DATE not null,
  SMETIALCONTENT       VARCHAR2(4000),
  SOPERATORID          VARCHAR2(20),
  SOPERATORDEPARTMENT  VARCHAR2(50),
  SREMARK              VARCHAR2(100),
  SCOLLATEMESSAGE      VARCHAR2(1000),
  SCOLLATORID          VARCHAR2(20),
  DRTNTIME             DATE,
  SZBR                 VARCHAR2(20),
  SFEEDBACK            VARCHAR2(200),
  NNOTERESULT          NUMBER(11),
  NDEALWITH            NUMBER(11),
  SSTATUS              VARCHAR2(10),
  STASKID              VARCHAR2(100),
  SSOURCEID            VARCHAR2(100),
  SSOURCEPID           VARCHAR2(100),
  SPID                 VARCHAR2(100),
  WORDLIST             VARCHAR2(500),
  NISREPEAT            NUMBER(11),
  DINDBTIME            DATE,
  DATASTATUS           NUMBER(10) default 0,
  CATCLASSIFYTEXT      CLOB,
  PLOTEXT              CLOB,
  ABS                  CLOB,
  STEXT                CLOB,
  SSIMILARID           VARCHAR2(256),
  NSIMILARITY          NUMBER(10,2),
  SFROMIDENTITY        VARCHAR2(256),
  STOIDENTITY          VARCHAR2(256),
  SFROMLEVEL           VARCHAR2(256),
  STOLEVEL             VARCHAR2(256),
  SLANGDETECT          VARCHAR2(256),
  SREPEATID            VARCHAR2(256),
  STASKAREA            VARCHAR2(1000),
  SLINENAME            VARCHAR2(512 CHAR),
  SLANG                VARCHAR2(256),
  STEXTPATH            VARCHAR2(1000)
)
tablespace USERS
  pctfree 10
  initrans 1
  maxtrans 255
  storage
  (
    initial 64
    next 8
    minextents 1
    maxextents unlimited
  );
-- Create/Recreate primary, unique and foreign key constraints 
alter table T_DOC
  add constraint T_DOC_PK primary key (SID)
  using index 
  tablespace USERS
  pctfree 10
  initrans 2
  maxtrans 255
  storage
  (
    initial 64K
    next 1M
    minextents 1
    maxextents unlimited
  );

-- Create table
create table T_EMAIL
(
  NIPVERSION      NUMBER(11),
  SSRCIP          VARCHAR2(48) not null,
  SDESTIP         VARCHAR2(48) not null,
  SFROMIP         VARCHAR2(200),
  STOIP           VARCHAR2(200),
  NSOURCE_PORT    NUMBER(11),
  NDEST_PORT      NUMBER(11),
  NXTYPE          NUMBER(11),
  SFROMEMAIL      VARCHAR2(256) not null,
  STOEMAIL        VARCHAR2(4000) not null,
  SPASSWORD       VARCHAR2(36),
  NHASAFFUX       NUMBER(11),
  NAFFIXNUM       NUMBER(11),
  SAFFIXTYPE      VARCHAR2(50),
  SAFFIXNAME      VARCHAR2(256),
  SLANGCODE       VARCHAR2(3),
  SCHARSET        VARCHAR2(16),
  NSECRET         NUMBER(11),
  SKEYWORDS       VARCHAR2(100),
  SABSTRACT       VARCHAR2(1000),
  SID             VARCHAR2(100) not null,
  SINSYSTEMTYPE   VARCHAR2(2),
  SINUNIT         VARCHAR2(11),
  SINPOSITION     VARCHAR2(11),
  DINTIME         DATE,
  NMESSAGETYPE    NUMBER(11),
  SFILENAME       VARCHAR2(500) not null,
  NFILELEN        NUMBER(11),
  SINPERSON       VARCHAR2(20),
  SINEQUIPMENT    VARCHAR2(8),
  SCOUNTRYCODE    VARCHAR2(3),
  SORGCODE        VARCHAR2(20),
  NENCRYPTTIMES   NUMBER(11),
  SENCRYPTTYPE    VARCHAR2(64),
  SNETATTOBJNUM   VARCHAR2(12),
  SREADER         VARCHAR2(20),
  DREADTIME       DATE,
  NPROCESSFLAG    NUMBER(11),
  SEMAILTYPE      VARCHAR2(10),
  NLINENO1        NUMBER(11),
  NLINENO2        NUMBER(11),
  NLINENO3        NUMBER(11),
  NLINENO4        NUMBER(11),
  SLINENO1CHAR    VARCHAR2(50),
  SLINENO2CHAR    VARCHAR2(50),
  SFROMUSER       VARCHAR2(100),
  STOUSER         VARCHAR2(2000),
  SCC             VARCHAR2(2000),
  SBCC            VARCHAR2(2000),
  SAFFIXPATH      VARCHAR2(1000),
  SLANG           VARCHAR2(50),
  NUNKNOWNAFFIX   NUMBER(11),
  TASKID          NUMBER(11),
  SPID            VARCHAR2(100),
  SSOURCEID       VARCHAR2(100),
  SSOURCEPID      VARCHAR2(100),
  NISMISS         NUMBER(11),
  SMESSAGETYPE    VARCHAR2(50),
  SINSYSTEM       VARCHAR2(50),
  SUNIT           VARCHAR2(50),
  SINPERSONCODE   VARCHAR2(50),
  SEQUIPMENT      VARCHAR2(50),
  SPOSITION       VARCHAR2(50),
  DSENDTIME       DATE,
  AFFIXDAT        BLOB,
  SAFFIXTEXT      VARCHAR2(4000),
  SFILENO         VARCHAR2(500),
  SCOUNTRY        VARCHAR2(50),
  SORG            VARCHAR2(50),
  SSERIALNUM      VARCHAR2(50),
  SCOLLECTSYS     VARCHAR2(50),
  SCOLLECTUSER    VARCHAR2(50),
  SCOLLECTCODE    VARCHAR2(50),
  DCOLLECTTIME    DATE,
  SPROCUSER       VARCHAR2(50),
  SPROCCODE       VARCHAR2(50),
  DPROCTIME       DATE,
  SREPEATID       VARCHAR2(256),
  NISREPEAT       NUMBER(11),
  NAFFIXSIZE      NUMBER(11),
  SLINENUM        VARCHAR2(40),
  NLINEGRADE      NUMBER(11),
  PERSON          VARCHAR2(100),
  AFFIXTYPE1      VARCHAR2(50),
  AFFIXNAME1      VARCHAR2(500),
  AFFIXPATH1      VARCHAR2(1000),
  ISENCRYPT       NUMBER(10),
  WORDLIST        VARCHAR2(4000),
  SSTOREADDRESS   VARCHAR2(256),
  SLANGDETECT     VARCHAR2(32),
  SSUBJECT        VARCHAR2(4000),
  DATASTATUS      NUMBER(10) default '0',
  DINDBTIME       TIMESTAMP(6),
  STEXT           CLOB,
  CATCLASSIFYTEXT CLOB,
  PLOTEXT         CLOB,
  ABS             CLOB,
  SSIMILARID      VARCHAR2(256),
  NSIMILARITY     NUMBER(10,2),
  SFROMIDENTITY   VARCHAR2(256),
  STOIDENTITY     VARCHAR2(256),
  SFROMLEVEL      VARCHAR2(256),
  STOLEVEL        VARCHAR2(256),
  STASKAREA       VARCHAR2(1000),
  STEXTPATH       VARCHAR2(1000)
)
tablespace USERS
  pctfree 10
  initrans 1
  maxtrans 255
  storage
  (
    initial 64
    next 8
    minextents 1
    maxextents unlimited
  );
-- Create/Recreate primary, unique and foreign key constraints 
alter table T_EMAIL
  add constraint EMAIL_PK primary key (SID)
  using index 
  tablespace USERS
  pctfree 10
  initrans 2
  maxtrans 255
  storage
  (
    initial 64K
    next 1M
    minextents 1
    maxextents unlimited
  );
-- Create/Recreate indexes 
create bitmap index INDEX_SLINENUM on T_EMAIL (SLINENUM)
  tablespace USERS
  pctfree 10
  initrans 2
  maxtrans 255
  storage
  (
    initial 64K
    next 1M
    minextents 1
    maxextents unlimited
  );


-- Create table
create table T_FAX
(
  NFAXCODEFORMAT       NUMBER(11) not null,
  NMODFORMAT           NUMBER(11) not null,
  NDEMQUALITY          NUMBER(11),
  NSECRET              NUMBER(11) not null,
  NDEMFLAG             NUMBER(11) not null,
  STSI                 VARCHAR2(36),
  SCSI                 VARCHAR2(36),
  NPAGECOUNT           NUMBER(11) not null,
  NLANGREGFLAG         NUMBER(11),
  SLANGCODE            VARCHAR2(3),
  NKEYWORDREGFLAG      NUMBER(11),
  SKEYWORDS            VARCHAR2(60),
  NICONREGFLAG         NUMBER(11),
  SICONTITLE           VARCHAR2(20),
  SID                  VARCHAR2(100) not null,
  SINSYSTEMTYPE        VARCHAR2(2) not null,
  SINUNIT              VARCHAR2(11) not null,
  SINPOSITION          VARCHAR2(11) not null,
  DINTIME              DATE not null,
  NMESSAGETYPE         NUMBER(11) not null,
  SFILENAME            VARCHAR2(500) not null,
  SSTOREADDRESS        VARCHAR2(500) not null,
  NFILELEN             NUMBER(11),
  SINPERSON            VARCHAR2(20),
  SINEQUIPMENT         VARCHAR2(8) not null,
  SCOUNTRYCODE         VARCHAR2(3),
  SORGCODE             VARCHAR2(20),
  NENCRYPTTIMES        NUMBER(11),
  SENCRYPTTYPE         VARCHAR2(64),
  SNETATTOBJNUM        VARCHAR2(12),
  SREADER              VARCHAR2(20),
  DREADTIME            DATE,
  NPROCESSFLAG         NUMBER(11),
  SCALLINGTELNO        VARCHAR2(36),
  SCALLEDTELNO         VARCHAR2(36),
  NIPVERSION           NUMBER(11) not null,
  SSRCIP               VARCHAR2(48) not null,
  SDESTIP              VARCHAR2(48) not null,
  NSOURCE_PORT         NUMBER(11),
  NDEST_PORT           NUMBER(11),
  SFROMIP              VARCHAR2(20),
  STOIP                VARCHAR2(20),
  NSIGNALTYPE          NUMBER(11),
  SLINENUM             VARCHAR2(40) not null,
  NLINEGRADE           NUMBER(11),
  NIPEGRADE            NUMBER(11),
  NTELGRADEA           NUMBER(11),
  NTELGRADEB           NUMBER(11),
  NLOGICGROUPNO        NUMBER(11) not null,
  NTS                  NUMBER(11) not null,
  SOPC                 VARCHAR2(11),
  SDPC                 VARCHAR2(11),
  NCIC                 NUMBER(11),
  NSIGNALPROPERTY      NUMBER(11),
  NSIGNALLINGDIRECTION NUMBER(11),
  NLOADSHARE           NUMBER(11),
  NSWITCHTYPE          NUMBER(11),
  NVCI                 NUMBER(11),
  SNETNAME             VARCHAR2(40),
  SDATATYPE            VARCHAR2(40),
  SVSATCALLINGSTATNO   VARCHAR2(16),
  SVSATCALLEDSTATNO    VARCHAR2(16),
  NUSERCHANNELNO       VARCHAR2(40),
  STASKID              VARCHAR2(64),
  SSOURCEID            VARCHAR2(100) not null,
  SSOURCEPID           VARCHAR2(100) not null,
  SPID                 VARCHAR2(100) not null,
  SXTYPE               VARCHAR2(100) not null,
  CATCLASSIFYTEXT      CLOB,
  PLOTEXT              CLOB,
  ABS                  CLOB,
  WORDLIST             VARCHAR2(4000),
  SDES                 VARCHAR2(256),
  DATASTATUS           NUMBER(10) default '0',
  DINDBTIME            TIMESTAMP(6) not null,
  STEXT                CLOB,
  SSIMILARID           VARCHAR2(256),
  NSIMILARITY          NUMBER(10,2),
  SFROMIDENTITY        VARCHAR2(256),
  STOIDENTITY          VARCHAR2(256),
  SFROMLEVEL           VARCHAR2(256),
  STOLEVEL             VARCHAR2(256),
  SREPEATID            VARCHAR2(256),
  SLANGDETECT          VARCHAR2(256),
  STASKAREA            VARCHAR2(1000),
  SLANG                VARCHAR2(256),
  DBEGINTIME           DATE
)
tablespace USERS
  pctfree 10
  initrans 1
  maxtrans 255
  storage
  (
    initial 64
    next 8
    minextents 1
    maxextents unlimited
  );
-- Create/Recreate primary, unique and foreign key constraints 
alter table T_FAX
  add constraint T_FAX_PK primary key (SID)
  using index 
  tablespace USERS
  pctfree 10
  initrans 2
  maxtrans 255
  storage
  (
    initial 64K
    next 1M
    minextents 1
    maxextents unlimited
  );

-- Create table
create table T_VOICE
(
  NCODEFORMAT          NUMBER(11) not null,
  NCODERATE            NUMBER(11) not null,
  NORIGINCODEFORMAT    VARCHAR2(3),
  NCOMFLAG             NUMBER(11) not null,
  DBEGINTIME           DATE not null,
  DENDTIME             DATE,
  NSPAN                NUMBER(11) not null,
  NSILENCETIME         NUMBER(11),
  NSPKREGFLAG          NUMBER(11),
  SSPKNAME             VARCHAR2(20),
  NLANGREGFLAG         NUMBER(11),
  SLANGCODE            VARCHAR2(3),
  NKEYWORDREGFLAG      NUMBER(11),
  SKEYWORDS            VARCHAR2(60),
  NVOICEREGFLAG        NUMBER(11),
  NVOICEREGRESULT      NUMBER(11),
  SID                  VARCHAR2(100) not null,
  SINSYSTEMTYPE        VARCHAR2(2) not null,
  SINUNIT              VARCHAR2(11) not null,
  SINPOSITION          VARCHAR2(11) not null,
  DINTIME              DATE not null,
  NMESSAGETYPE         NUMBER(11) not null,
  SFILENAME            VARCHAR2(500) not null,
  SRFILENAME           VARCHAR2(500),
  SSTOREADDRESS        VARCHAR2(256) not null,
  NFILELEN             NUMBER(11) not null,
  NRFILELEN            NUMBER(11),
  SINPERSON            VARCHAR2(20),
  SINEQUIPMENT         VARCHAR2(8) not null,
  SCOUNTRYCODE         VARCHAR2(3),
  SORGCODE             VARCHAR2(20),
  NENCRYPTTIMES        NUMBER(11),
  SENCRYPTTYPE         VARCHAR2(64),
  SNETATTOBJNUM        VARCHAR2(12),
  SREADER              VARCHAR2(20),
  DREADTIME            DATE,
  NPROCESSFLAG         NUMBER(11),
  SCALLINGTELNO        VARCHAR2(36),
  SCALLEDTELNO         VARCHAR2(36),
  NIPVERSION           NUMBER(11) not null,
  SSRCIP               VARCHAR2(48) not null,
  SDESTIP              VARCHAR2(48) not null,
  NSOURCE_PORT         NUMBER(11),
  NDEST_PORT           NUMBER(11),
  SFROMIP              VARCHAR2(200),
  STOIP                VARCHAR2(200),
  SLINENUM             VARCHAR2(40) not null,
  NLINEGRADE           NUMBER(11),
  NIPEGRADE            NUMBER(11),
  NTELGRADEA           NUMBER(11),
  NTELGRADEB           NUMBER(11),
  NLOGICGROUPNO        NUMBER(11) not null,
  NTS                  NUMBER(11) not null,
  SOPC                 VARCHAR2(11),
  SDPC                 VARCHAR2(11),
  NCIC                 NUMBER(11),
  NSIGNALPROPERTY      NUMBER(11),
  NSIGNALLINGDIRECTION NUMBER(11),
  NSIGNALTYPE          NUMBER(11) not null,
  NLOADSHARE           NUMBER(11),
  NSWITCHTYPE          NUMBER(11),
  NVCI                 DATE,
  SNETNAME             VARCHAR2(40),
  SDATATYPE            VARCHAR2(40),
  SVSATCALLINGSTATNO   VARCHAR2(16),
  SVSATCALLEDSTATNO    VARCHAR2(16),
  NUSERCHANNELNO       NUMBER(11),
  STASKID              VARCHAR2(100),
  POS                  VARCHAR2(4000),
  TYPE                 VARCHAR2(4000),
  SSOURCEID            VARCHAR2(100),
  SSOURCEPID           VARCHAR2(100),
  SPID                 VARCHAR2(100),
  WORDLIST             VARCHAR2(500),
  SDES                 VARCHAR2(256),
  DINDBTIME            TIMESTAMP(6),
  DATASTATUS           NUMBER(10) default 0 not null,
  CATCLASSIFYTEXT      CLOB,
  PLOTEXT              CLOB,
  ABS                  CLOB,
  STEXT                CLOB,
  SSIMILARID           VARCHAR2(256),
  NSIMILARITY          NUMBER(10,2),
  SFROMIDENTITY        VARCHAR2(256),
  STOIDENTITY          VARCHAR2(256),
  SFROMLEVEL           VARCHAR2(256),
  STOLEVEL             VARCHAR2(256),
  SLANGDETECT          VARCHAR2(256),
  SREPEATID            VARCHAR2(256),
  STASKAREA            VARCHAR2(1000),
  SLANG                VARCHAR2(256)
)
tablespace USERS
  pctfree 10
  initrans 1
  maxtrans 255
  storage
  (
    initial 64
    next 8
    minextents 1
    maxextents unlimited
  );
-- Create/Recreate primary, unique and foreign key constraints 
alter table T_VOICE
  add constraint T_VOICE_PK primary key (SID)
  using index 
  tablespace USERS
  pctfree 10
  initrans 2
  maxtrans 255
  storage
  (
    initial 64K
    next 1M
    minextents 1
    maxextents unlimited
  );
