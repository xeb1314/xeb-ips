<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" >
  <xsl:output method="html" encoding="UTF-8" />
  <xsl:template match="/">
    <xsl:for-each select="RecordSet/Record">
      <table border="1" cellspacing="1" cellpadding="0" style="width:100%;height:100%;" class="table" id="detailTab">
        <colgroup>
          <col width="100px;"/>
          <col width="auto"/>
          <col width="100px"/>
          <col width="270px"></col>
        </colgroup>
        <tr class="rt">
          <td  align="left" class="tablehead leftrighttd">
            任务名称:
          </td>
          <td align="left" >
             <div class="divXsltContent" title='{TASK_NAME}'>
            	<xsl:value-of select="TASK_NAME" />
             </div>
          </td>
          <td align="left" class="tablehead leftrighttd">
            分组:
          </td>
          <td  align="left">
            <xsl:value-of select="TASK_GROUP"></xsl:value-of>
          </td>
        </tr>
        
        <tr class="rt">
        <td align="left" class="tablehead leftrighttd">
            父任务ID:
          </td>
          <td  align="left">
            <xsl:value-of select="PARENT_ID" />
          </td>
          <td align="left" class="tablehead leftrighttd">
            任务ID:
          </td>
          <td  align="left">
            <xsl:value-of select="TASK_ID" />
          </td>
        </tr>
        
        <tr class="rt">
          <td align="left" class="tablehead leftrighttd">
            任务类型:
          </td>
          <td  align="left">
            <xsl:choose>
              <xsl:when test="TASK_TYPE=0">
                无效未知任务
              </xsl:when>
              <xsl:when test="TASK_TYPE=1">
                磁盘迁移
              </xsl:when>
              <xsl:when test="TASK_TYPE=20">
                MD5生成、验证
              </xsl:when>
              <xsl:when test="TASK_TYPE=30">
                磁盘文件删除
              </xsl:when>
              <xsl:when test="TASK_TYPE=100">
                数据流磁带迁移
              </xsl:when>
              <xsl:when test="TASK_TYPE=101">
                磁带上载
              </xsl:when>
              <xsl:when test="TASK_TYPE=102">
                磁带下载
              </xsl:when>
              <xsl:when test="TASK_TYPE=200">
                转码任务
              </xsl:when>
              <xsl:when test="TASK_TYPE=211">
                码流剪辑
              </xsl:when>
              <xsl:when test="TASK_TYPE=201">
                打包任务
              </xsl:when>
              <xsl:when test="TASK_TYPE=300">
                SDI信号收录
              </xsl:when>
              <xsl:when test="TASK_TYPE=301">
                SDI信号播出
              </xsl:when>
              <xsl:when test="TASK_TYPE=302">
                SDI信号实时预监
              </xsl:when>
              <xsl:when test="TASK_TYPE=310">
                ts流ASI信号收录
              </xsl:when>
              <xsl:when test="TASK_TYPE=320">
                ts流UDP信号收录
              </xsl:when>
              <xsl:when test="TASK_TYPE=321">
                ts流UDP信号播出
              </xsl:when>
              <xsl:when test="TASK_TYPE=322">
                ts流UDP信号实时预监
              </xsl:when>
              <xsl:when test="TASK_TYPE=400">
                技术审核
              </xsl:when>
              <xsl:when test="TASK_TYPE=401">
                关键帧提取
              </xsl:when>
              <xsl:when test="TASK_TYPE=500">
                特征提取
              </xsl:when>
              <xsl:when test="TASK_TYPE=501">
                特征检索
              </xsl:when>
              <xsl:otherwise>
                <xsl:value-of select="TASK_TYPE"></xsl:value-of>
              </xsl:otherwise>
            </xsl:choose>
          </td>
          <td  align="left" class="tablehead leftrighttd">
            对象ID:
          </td>
          <td  align="left">
            <xsl:value-of select="APP_OBJID"></xsl:value-of>
          </td>
        </tr>
        <tr class="rt">
          <td align="left" class="tablehead leftrighttd">
            创建时间:
          </td>
          <td  align="left">
            <xsl:value-of select="translate(substring(CREATE_TIME,0,20),'T',' ')" />
          </td>
        <td align="left" class="tablehead leftrighttd">
            源文件:
          </td>
          <td  align="left">
          		<div class="divXsltContent" title='{OBJ_PATH}'>
		            <xsl:value-of select="OBJ_PATH" />
          		</div>
          </td>
        </tr>
        
        <tr class="rt">
          <td align="left" class="tablehead leftrighttd">
            对象来源:
          </td>
          <td  align="left">
            <xsl:choose>
              <xsl:when test="APP_OBJSOURCE=1">媒资系统</xsl:when>
              <xsl:when test="APP_OBJSOURCE=2">音频媒资</xsl:when>
              <xsl:when test="APP_OBJSOURCE=10">视频制作网</xsl:when>
              <xsl:when test="APP_OBJSOURCE=100">互联互通平台</xsl:when>
              <xsl:when test="APP_OBJSOURCE=200">工作流</xsl:when>
              <xsl:otherwise>
                <xsl:value-of select="APP_OBJSOURCE"></xsl:value-of>
              </xsl:otherwise>
            </xsl:choose>[<xsl:value-of select="APP_OBJTYPE"></xsl:value-of>]
          </td>
          <td align="left" class="tablehead leftrighttd">
            优先级:
          </td>
          <td  align="left">
            <xsl:value-of select="TASK_LEVEL"></xsl:value-of>
          </td>
        </tr>
        
        <tr class="rt">
        <td align="left" class="tablehead leftrighttd">
            目标文件:
          </td>
          <td  align="left">
          		<div class="divXsltContent" title='{OBJ_DESTPATH}'>
		            <xsl:value-of select="OBJ_DESTPATH" />
          		</div>
          </td>
        <td align="left" class="tablehead leftrighttd">
            子类型:
          </td>
          <td  align="left">
            <xsl:value-of select="TASK_SUBTYPE"></xsl:value-of>
          </td>
        </tr>
        
        <tr class="rt">
        <td align="left" class="tablehead leftrighttd">
            模板名称:
          </td>
          <td  align="left">
            <xsl:value-of select="TEMPLATE_NAME" />
          </td>
          <td  align="left" class="tablehead leftrighttd">
            执行器:
          </td>
          <td  align="left">
            <xsl:value-of select="TASK_ACTOR"></xsl:value-of>
          </td> 
        </tr>
        
        <tr class="rt">
        <td align="left" class="tablehead leftrighttd">
            状态描述:
          </td>
          <td  align="left">
              <div class="divXsltContent" title='{STATE_DESC}'>
		            <xsl:value-of select="STATE_DESC" />
              </div>
          </td>
          <td  align="left" class="tablehead leftrighttd">
            创建者:
          </td>
          <td  align="left">
            <xsl:value-of select="CREATE_USER" />
          </td>
        </tr>
        
        <tr class="rt">
        <td align="left" class="tablehead leftrighttd">
            完成时间:
          </td>
          <td  align="left">
            <xsl:value-of select="translate(substring(END_TIME,0,20),'T',' ')" />
          </td>
          <td align="left" class="tablehead leftrighttd">
            源文件大小:
          </td>
          <td  align="left">
            <xsl:value-of select="FILE_SIZE" />
          </td>
        </tr>  
        
        <tr >
          <td align="left" class="tablehead leftrighttd">
            任务状态:
          </td>
          <td align="left">
            <xsl:choose>
              <xsl:when test="TASK_STATE=0">
                新任务
              </xsl:when>
              <xsl:when test="TASK_STATE=1">
                新任务
              </xsl:when>
              <xsl:when test="TASK_STATE=2">
                新任务
              </xsl:when>
              <xsl:when test="TASK_STATE=100">
                执行中
              </xsl:when>
              <xsl:when test="TASK_STATE=200">
                成功
              </xsl:when>
              <xsl:when test="TASK_STATE=210">
                失败
              </xsl:when>
              <xsl:when test="TASK_STATE=220">
               失败
              </xsl:when>
              <xsl:when test="TASK_STATE=230">
                失败
              </xsl:when>
              <xsl:when test="TASK_STATE=240">
                失败
              </xsl:when>
              <xsl:when test="TASK_STATE=250">
                失败
              </xsl:when>
              <xsl:otherwise>
                <xsl:value-of select="TASK_STATE"></xsl:value-of>
              </xsl:otherwise>
            </xsl:choose>
          </td>
          <td align="left" class="tablehead leftrighttd">
            目标文件大小:
          </td>
          <td  align="left">
            <xsl:value-of select="DEST_FILE_SIZE" />
          </td>
        </tr>
      </table>
    </xsl:for-each>
  </xsl:template>
</xsl:stylesheet>