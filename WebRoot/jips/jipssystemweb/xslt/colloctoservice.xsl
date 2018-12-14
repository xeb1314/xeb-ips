<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="html" encoding="UTF-8" />
  <xsl:template match="/">
    <table width="100%" border="0" cellpadding="0" cellspacing="0" class="table datalist" ID="tabTask">
      <tr class="rt">  
        <th nowarp="true" align="center">
          <b>服务名称</b>
        </th>
        <th align="center" width="100px">
          <b>服务代号</b>
        </th>
        <th align="center" width="200px">
          <b>服务地址</b>
        </th> 
        <th align="center" width="150px">
          <b>创建时间</b>
        </th>  
        <th align="center" width="300px">
          <b>服务描述</b>
        </th>
        <th align="center" width="60px">
          <b>配置</b>
        </th>
      </tr>
      <xsl:for-each select="RecordSet/Record">
        <tr id="trDS{SERVICE_ID}" position="{position()}" ondblclick="addConfigTemplate('{INT_1}','{SYS_ID}','{TASK_ID}','{TASK_NAME}','{USR}','{TIME}','{SERVICE_ID}');">
          <xsl:attribute name ="taskId">
            <xsl:value-of disable-output-escaping="no" select="SERVICE_ID" />
          </xsl:attribute>
          <td align="center" title="{SERVICE_NAME}">
            <xsl:value-of disable-output-escaping="no" select="SERVICE_NAME" />
          </td>
          <td>
            <xsl:value-of disable-output-escaping="no" select="SERVICE_CODE" />
          </td>
          <td  align="center">
            <xsl:value-of disable-output-escaping="no" select="SERVICE_URL" />
          </td>         
          <td  align="center">
            <xsl:choose>
	            <xsl:when test="CREATE_TIME!=''">
	              <xsl:value-of select='translate(substring(CREATE_TIME,0,20),"T"," ")' ></xsl:value-of>
	            </xsl:when>
	            <xsl:otherwise>--</xsl:otherwise>
	          </xsl:choose>
          </td>       
          <td>
            <xsl:value-of disable-output-escaping="no" select="SERVICE_DESC" />
          </td>
          <td align="center">
		  	<div  class="see01" onclick="addConfigTemplate('{INT_1}','{SYS_ID}','{TASK_ID}','{TASK_NAME}','{USR}','{TIME}','{SERVICE_ID}');"><img src="images/new.png"></img></div>
		  </td>
        </tr>
      </xsl:for-each>
    </table>
    <input type="hidden" value="{RecordSet/totalCount}" id="hid_ServiceCount"></input>
  </xsl:template>
</xsl:stylesheet>
