<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="html" encoding="UTF-8" />
  <xsl:template match="/">
    <table width="100%" border="0" cellpadding="0" cellspacing="0" class="table datalist" ID="tabDS">
      <tr class="rt">  
        <th nowarp="true" align="center">
          <b>名称</b>
        </th>
        <th align="center" width="200px">
          <b>源路径</b>
        </th>
        <th align="center" width="100px">
          <b>类型</b>
        </th> 
        <th align="center" width="50px">
          <b>状态</b>
        </th>  
        <th align="center" width="90px">
          <b>描述</b>
        </th>
        <th align="center" width="45px">
          <b>详情</b>
        </th>
      </tr>
      <xsl:for-each select="RecordSet/Record">
        <tr id="trDS{DS_ID}" position="{position()}"  onmousedown="dsToTask(this);">
          <xsl:attribute name ="dsId">
            <xsl:value-of disable-output-escaping="no" select="DS_ID" />
          </xsl:attribute>
          <xsl:attribute name ="dsName">
            <xsl:value-of disable-output-escaping="no" select="DS_NAME" />
          </xsl:attribute>
          <xsl:attribute name ="sourcePath">
            <xsl:value-of disable-output-escaping="no" select="STR_1" />
          </xsl:attribute>
          <xsl:attribute name ="classIds">
            <xsl:value-of disable-output-escaping="no" select="STR_2" />
          </xsl:attribute>
          <xsl:attribute name ="dsClass">
            <xsl:value-of disable-output-escaping="no" select="DS_CLASS" />
          </xsl:attribute>
          <xsl:attribute name ="state">
            <xsl:value-of disable-output-escaping="no" select="STATE" />
          </xsl:attribute>
           <xsl:attribute name ="dsDesc">
            <xsl:value-of disable-output-escaping="no" select="DS_DESC" />
          </xsl:attribute>
          
          <td align="center" title="{DS_NAME}">
            <xsl:value-of disable-output-escaping="no" select="DS_NAME" />
          </td>
          <td>
            <xsl:value-of disable-output-escaping="no" select="STR_1" />
          </td>
          <td align="center">
            <xsl:choose>
					<xsl:when test="DS_CLASS=801">
						<font>邮件</font>
					</xsl:when>
					<xsl:when test="DS_CLASS=802">
						<font>口令下载</font>
					</xsl:when>
					<xsl:when test="DS_CLASS=803">
						<font>身份认证</font>
					</xsl:when>
					<xsl:otherwise>
						<xsl:value-of disable-output-escaping="no" select="DS_CLASS"/>
					</xsl:otherwise>
				</xsl:choose>
          </td>
          <td align="center">
            <xsl:choose>
					<xsl:when test="STATE=0">
						<font>公共</font>
					</xsl:when>
					<xsl:when test="STATE=1">
						<font>指派用户</font>
					</xsl:when>
					<xsl:when test="STATE=2">
						<font>未分配</font>
					</xsl:when>
					<xsl:otherwise>
						<xsl:value-of disable-output-escaping="no" select="STATE"/>
					</xsl:otherwise>
				</xsl:choose>
          </td>
          <td>
            <xsl:value-of disable-output-escaping="no" select="DS_DESC" />
          </td>
          <td align="center">
          	<span style="cursor:pointer;" onclick="dsDetail('{DS_ID}','{STR_1}','{STATE}');">
          		<img src="images/cel_info.png"></img>
          	</span>
		  </td> 
        </tr>
      </xsl:for-each>
    </table>
    <input type="hidden" value="{RecordSet/totalCount}" id="hid_DsCount"></input>
  </xsl:template>
</xsl:stylesheet>
