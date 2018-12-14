<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="html" encoding="UTF-8" />
  <xsl:template match="/">
    <table width="100%" border="0" cellpadding="0" cellspacing="0" class="table datalist" ID="tabTask">
      <tr class="rt">  
        <th nowarp="true" align="center">
          <b>任务名称</b>
        </th>
        <th align="center" width="100px">
          <b>任务类型</b>
        </th> 
        <th align="center" width="200px">
          <b>任务状态</b>
        </th>
      </tr>
      <xsl:for-each select="RecordSet/Record">
        <tr id="trDS{DS_ID}" position="{position()}"  onmousedown="taskToProces(this,false);">
          <xsl:attribute name ="taskId">
            <xsl:value-of disable-output-escaping="no" select="TASK_ID" />
          </xsl:attribute>
          <xsl:attribute name ="taskName">
            <xsl:value-of disable-output-escaping="no" select="TASK_NAME" />
          </xsl:attribute>
          <xsl:attribute name ="taskState">
            <xsl:value-of disable-output-escaping="no" select="TASK_STATE" />
          </xsl:attribute>
          <xsl:attribute name ="taskDesc">
            <xsl:value-of disable-output-escaping="no" select="TASK_DESC" />
          </xsl:attribute>
          <xsl:attribute name ="procId">
            <xsl:value-of disable-output-escaping="no" select="PROC_ID" />
          </xsl:attribute>
          <xsl:attribute name ="taskType">
            <xsl:value-of disable-output-escaping="no" select="TASK_TYPE" />
          </xsl:attribute>
          
          <td align="center" title="{TASK_NAME}">
            <xsl:value-of disable-output-escaping="no" select="TASK_NAME" />
          </td>
          <td align="center">
            <xsl:choose>
					<xsl:when test="TASK_TYPE=10">
						<font>数据处理</font>
					</xsl:when>
					<xsl:when test="TASK_TYPE=20">
						<font>数据采集</font>
					</xsl:when>
					<xsl:otherwise>
						<font>未知</font>
					</xsl:otherwise>
				</xsl:choose>
          </td>
          <td align="center">
            <xsl:choose>
					<xsl:when test="TASK_STATE=100">
						<font>未运行</font>
					</xsl:when>
					<xsl:when test="TASK_STATE=11">
						<font>运行中</font>
					</xsl:when>
					<xsl:otherwise>
						<font>未知</font>
					</xsl:otherwise>
				</xsl:choose>
          </td>
        </tr>
      </xsl:for-each>
    </table>
    <input type="hidden" value="{RecordSet/totalCount}" id="hid_TaskCount"></input>
  </xsl:template>
</xsl:stylesheet>
