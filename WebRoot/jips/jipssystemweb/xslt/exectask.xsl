<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="html" encoding="UTF-8" />
  <xsl:template match="/">
    <table width="100%" border="0" cellpadding="0" cellspacing="0" ID="tabExecTask">
      <tr>
        <th  nowarp="true"   align="center" >
          <b>任务名称</b>
        </th>
        <th width="150px"   align="center">
          <b>任务执行开始时间</b>
        </th>
 		<th width="100px"   align="center" >
          <b>任务状态</b>
        </th>
        <th width="280px"  align="center" >
          <b>状态描述</b>
        </th>
        <!-- <th width="100px"  align="center" >
          <b>流程查看</b>
        </th> -->
      </tr>
      <xsl:for-each select="RecordSet/Record">
        <tr onmousedown="procTaskToCount('{TASK_ID}',{PROC_ID})">
          <td align="left" title="{TASK_NAME}">
            <xsl:value-of disable-output-escaping="no" select="TASK_NAME" />
          </td>
          <td  align="center">
	      	<xsl:value-of select='translate(substring(CREATE_TIME,0,20),"T"," ")' ></xsl:value-of>
          </td>
          <td  align="center">
            <xsl:choose>
					<xsl:when test="TASK_STATE=11">
						<font>运行中</font>
					</xsl:when>
					<xsl:when test="TASK_STATE=100">
						<font>未运行</font>
					</xsl:when>
					<xsl:otherwise>
						<font>"未知-"+{TASK_STATE}</font>
					</xsl:otherwise>
				</xsl:choose>
          </td>
          <td title="{TASK_DESC}">
		  	<xsl:value-of disable-output-escaping="no" select="TASK_DESC"></xsl:value-of>
          </td>
          <!-- <td>
             <div class="jetsen-grid-body-inner" title="流程查看">
                     <span style="cursor:pointer;" onclick="">
                     	<img src="images/cel_info.png"/>
                     </span>
                 </div>
          </td> -->
        </tr>
      </xsl:for-each>
    </table>
    <input type="hidden" value="{RecordSet/totalCount}" id="hid_TotalCount"></input>
  </xsl:template>
</xsl:stylesheet>
