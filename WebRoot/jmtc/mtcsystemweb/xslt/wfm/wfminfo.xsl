<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="html" encoding="UTF-8" />
  <xsl:template match="/">
    <table width="100%" border="0" cellpadding="0" cellspacing="0" class="table datalist" ID="tabWfm">
      <tr class="rt">      
        <th nowarp="true" align="left">
          <b>对象名称</b>
        </th>
        <th align="center" width="100px">
          <b>流程状态</b>
        </th>
        <th width="200px">
          <b>流程描述</b>
        </th>
        <th align="center" width="120px">
          <b>创建用户</b>
        </th>
        <th align="center" width="125px">
          <b>开始时间</b>
        </th>       
      </tr>
      <xsl:for-each select="RecordSet/Record">
        <tr id="trWfm{PROCEXEC_ID}" position="{position()}" onmousedown="viewSubProcess('{PROCEXEC_ID}',{PROC_ID},'{PROC_STATE}')">
          <td align="left" title="{OBJ_NAME}">
            <xsl:value-of disable-output-escaping="no" select="OBJ_NAME" />
          </td>
          <td  align="center">
            <xsl:choose>
              <xsl:when test="PROC_STATE=0" >
                	未启动
              </xsl:when>
              <xsl:when test="PROC_STATE=1" >
                <font style="color:#faa827">等待执行</font>
              </xsl:when>
              <xsl:when test="PROC_STATE=2" >
                <font style="color:#388fc8">运行中</font>
              </xsl:when>
              <xsl:when test="PROC_STATE=5" >
                <font style="color:#fc2a3e">暂停</font>
              </xsl:when>
              <xsl:when test="PROC_STATE=10">
                <font style="color:#2c597a">结束</font>
              </xsl:when>
              <xsl:when test="PROC_STATE=11">
                <font style="color:#fc2a3e">终止</font>
              </xsl:when>
              <xsl:otherwise>
                <xsl:value-of select="PROC_STATE"></xsl:value-of>
              </xsl:otherwise>
            </xsl:choose>
          </td>
          <td title="{STATE_DESC}">
            <xsl:value-of disable-output-escaping="no" select="STATE_DESC" />
          </td>
          <td  align="center">
            <xsl:value-of disable-output-escaping="no" select="START_USER" />
          </td>
          <td  align="center">
            <xsl:value-of disable-output-escaping="yes" select="translate(substring(START_TIME,0,20),'T',' ')" />
          </td>         
        </tr>
      </xsl:for-each>
    </table>
  </xsl:template>
</xsl:stylesheet>
