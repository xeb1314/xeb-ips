<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="html" encoding="UTF-8" />
  <xsl:template match="/">
    <table width="100%" border="0" cellpadding="0" cellspacing="1" class="table" id="tabTasklog">
      <colgroup>
        <col width="auto"></col>
        <col width="150px"></col>
        <col width="100px"></col>
        <col width="80px"></col>
        <col width="150px"></col>        
        <col width="70px"></col>       
      </colgroup>
      <tr class="rt">
        <th scope="col" align="left">任务名称</th>
        <th scope="col" align="left">任务类型</th>
        <th scope="col">任务状态</th>
        <th scope="col">优先级</th>        
        <th scope="col">创建时间</th>
        <th scope="col">详情</th>       
      </tr>
      <xsl:for-each select="RecordSet/Record">
        <tr class="rt" onmousedown="setTrBgColor('tabTask',this)"  oncontextmenu ="showContextmenu('{TASK_ID}');return false;">

          <td align="left">
            <xsl:value-of disable-output-escaping="no" select="TASK_NAME" />
          </td>
          <td align="left">
            <xsl:value-of select="TASK_TYPE"/>
          </td>
          <td align="center">
            <xsl:choose>
              <xsl:when test="TASK_STATE=0">有依赖</xsl:when>
              <xsl:when test="TASK_STATE=1">新任务</xsl:when>
              <xsl:when test="TASK_STATE=2">等待执行</xsl:when>
              <xsl:when test="TASK_STATE=100">
                执行中
                <xsl:if test ="TASK_PERCENT!=0">
                  (
                  <xsl:value-of select="TASK_PERCENT"/>
                  %)
                </xsl:if>
              </xsl:when>
              <xsl:when test="TASK_STATE=101">执行中(异常)</xsl:when>
              <xsl:otherwise></xsl:otherwise>
            </xsl:choose>
          </td>
          <td align="center">
            <xsl:value-of disable-output-escaping="no" select="TASK_LEVEL" />
          </td>          
          <td align="center">
            <xsl:value-of select='translate(substring(CREATE_TIME,0,20),"T"," ")' ></xsl:value-of>
          </td>
          <td>
            <div class="look-1" onclick="viewTask('{TASK_ID}');">
              <span>详情</span>
            </div>
          </td>
        </tr>
      </xsl:for-each>
    </table>
    <input type="hidden" value="{RecordSet/totalCount}" id="sub_hid_TotalCount"></input>
  </xsl:template>
</xsl:stylesheet>